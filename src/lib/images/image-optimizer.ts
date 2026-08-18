import "client-only";

import {
  JPEG_QUALITY_STEPS,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_SIZE_BYTES,
  MIN_IMAGE_SIZE_BYTES_TO_OPTIMIZE,
} from "@/lib/images/image-upload.constants";

type OptimizationPath = "createImageBitmap" | "fallbackImage" | "skipped";

type DecodedImageSource =
  | {
      height: number;
      path: "createImageBitmap";
      release: () => void;
      source: ImageBitmap;
      width: number;
    }
  | {
      height: number;
      objectUrl: string;
      path: "fallbackImage";
      release: () => void;
      source: HTMLImageElement;
      width: number;
    };

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ReadImageDimensionsResult extends ImageDimensions {
  path: Exclude<OptimizationPath, "skipped">;
}

export interface OptimizeImageFileResult {
  file: File;
  outputDimensions: ImageDimensions;
  wasOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
  perf?: {
    inputDimensions: ImageDimensions | null;
    outputDimensions: ImageDimensions | null;
    path: OptimizationPath;
    totalMs: number;
  };
}

function logImageOptimizerStep(label: string, payload?: Record<string, unknown>) {
  console.log(`[IMAGE_OPTIMIZER] ${label}`, payload ?? {});
}

function assertBrowserImageProcessingAvailable() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof URL === "undefined"
  ) {
    throw new Error(
      "El procesamiento de imagenes solo puede ejecutarse en el navegador.",
    );
  }
}

function replaceFileExtension(filename: string, extension: string) {
  const normalizedName = filename.trim();

  if (normalizedName.length === 0) {
    return `image.${extension}`;
  }

  return normalizedName.replace(/\.[^./\\]+$/, "") + `.${extension}`;
}

export function calculateTargetDimensions(width: number, height: number) {
  const largestSide = Math.max(width, height);

  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / largestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No pudimos optimizar la imagen seleccionada."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function decodeImageWithFallbackImage(
  file: File,
): Promise<DecodedImageSource> {
  const objectUrl = URL.createObjectURL(file);
  logImageOptimizerStep("decode:fallback:url-created", {
    fileName: file.name,
    objectUrl,
  });

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () =>
        reject(new Error("No pudimos leer la imagen seleccionada."));
      logImageOptimizerStep("decode:fallback:image-src-set", {
        fileName: file.name,
      });
      nextImage.src = objectUrl;
    });

    logImageOptimizerStep("decode:fallback:done", {
      fileName: file.name,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });

    return {
      height: image.naturalHeight,
      objectUrl,
      path: "fallbackImage",
      release: () => {
        URL.revokeObjectURL(objectUrl);
      },
      source: image,
      width: image.naturalWidth,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function decodeImageFile(file: File): Promise<DecodedImageSource> {
  assertBrowserImageProcessingAvailable();

  if (typeof window.createImageBitmap === "function") {
    try {
      logImageOptimizerStep("decode:createImageBitmap:start", {
        fileName: file.name,
      });
      const bitmap = await window.createImageBitmap(file, {
        imageOrientation: "from-image",
      });

      logImageOptimizerStep("decode:createImageBitmap:done", {
        fileName: file.name,
        width: bitmap.width,
        height: bitmap.height,
      });

      return {
        height: bitmap.height,
        path: "createImageBitmap",
        release: () => {
          bitmap.close();
        },
        source: bitmap,
        width: bitmap.width,
      };
    } catch (error) {
      logImageOptimizerStep("decode:createImageBitmap:error", {
        fileName: file.name,
        message:
          error instanceof Error ? error.message : "createImageBitmap fallo",
      });
    }
  }

  return decodeImageWithFallbackImage(file);
}

export async function readImageFileDimensions(
  file: File,
): Promise<ReadImageDimensionsResult> {
  assertBrowserImageProcessingAvailable();
  const traceId = `dimensions:${file.name}`;
  console.time(traceId);
  logImageOptimizerStep("dimensions:start", {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const decoded = await decodeImageFile(file);

  try {
    logImageOptimizerStep("dimensions:done", {
      fileName: file.name,
      width: decoded.width,
      height: decoded.height,
      path: decoded.path,
    });

    return {
      height: decoded.height,
      path: decoded.path,
      width: decoded.width,
    };
  } finally {
    decoded.release();
    console.timeEnd(traceId);
  }
}

export async function shouldOptimizeImageFile(file: File) {
  assertBrowserImageProcessingAvailable();
  const traceId = `should-optimize:${file.name}`;
  console.time(traceId);

  const dimensions = await readImageFileDimensions(file);
  const largestSide = Math.max(dimensions.width, dimensions.height);
  const shouldOptimize =
    file.size > MIN_IMAGE_SIZE_BYTES_TO_OPTIMIZE ||
    largestSide > MAX_IMAGE_DIMENSION;
  logImageOptimizerStep("should-optimize:done", {
    fileName: file.name,
    width: dimensions.width,
    height: dimensions.height,
    largestSide,
    size: file.size,
    shouldOptimize,
  });
  console.timeEnd(traceId);

  return {
    dimensions,
    shouldOptimize,
  };
}

async function drawFileToCanvas(file: File) {
  assertBrowserImageProcessingAvailable();
  const decoded = await decodeImageFile(file);

  try {
    return drawDecodedImageToCanvas(file, decoded);
  } finally {
    decoded.release();
  }
}

function drawDecodedImageToCanvas(file: File, decoded: DecodedImageSource) {
  const traceId = `draw-canvas:${file.name}`;
  console.time(traceId);
  logImageOptimizerStep("draw:start", {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const originalWidth = decoded.width;
  const originalHeight = decoded.height;
  const { width, height } = calculateTargetDimensions(originalWidth, originalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    console.timeEnd(traceId);
    throw new Error("No pudimos preparar la imagen para optimizarla.");
  }

  context.drawImage(decoded.source, 0, 0, width, height);
  logImageOptimizerStep("draw:done", {
    fileName: file.name,
    originalWidth,
    originalHeight,
    canvasWidth: width,
    canvasHeight: height,
    path: decoded.path,
  });
  console.timeEnd(traceId);

  return {
    canvas,
    originalHeight,
    originalWidth,
    path: decoded.path,
  };
}

export async function optimizeImageFile(
  file: File,
  providedDimensions?: ReadImageDimensionsResult,
): Promise<OptimizeImageFileResult> {
  assertBrowserImageProcessingAvailable();

  const optimizeStartedAt = performance.now();
  const traceId = `optimize:${file.name}`;
  console.time(traceId);
  logImageOptimizerStep("optimize:start", {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const decoded = providedDimensions ? null : await decodeImageFile(file);
  const decodedDimensions = decoded
    ? {
        width: decoded.width,
        height: decoded.height,
        path: decoded.path,
      }
    : null;
  const preflight = providedDimensions
    ? {
        dimensions: providedDimensions,
        shouldOptimize:
          file.size > MIN_IMAGE_SIZE_BYTES_TO_OPTIMIZE ||
          Math.max(providedDimensions.width, providedDimensions.height) > MAX_IMAGE_DIMENSION,
      }
    : {
        dimensions: decodedDimensions!,
        shouldOptimize:
          file.size > MIN_IMAGE_SIZE_BYTES_TO_OPTIMIZE ||
          Math.max(decodedDimensions!.width, decodedDimensions!.height) > MAX_IMAGE_DIMENSION,
      };

  if (!preflight.shouldOptimize) {
    decoded?.release();
    console.log(
      "[IMAGE OPTIMIZER]",
      file.name,
      "sin cambios",
      `original=${(file.size / 1024 / 1024).toFixed(2)} MB`,
      `final=${(file.size / 1024 / 1024).toFixed(2)} MB`,
    );

    return {
      file,
      outputDimensions: {
        width: preflight.dimensions.width,
        height: preflight.dimensions.height,
      },
      perf: {
        inputDimensions: {
          width: preflight.dimensions.width,
          height: preflight.dimensions.height,
        },
        outputDimensions: {
          width: preflight.dimensions.width,
          height: preflight.dimensions.height,
        },
        path: preflight.dimensions.path,
        totalMs: performance.now() - optimizeStartedAt,
      },
      wasOptimized: false,
      originalSize: file.size,
      optimizedSize: file.size,
    };
  }

  const { canvas, originalHeight, originalWidth, path } = decoded
    ? drawDecodedImageToCanvas(file, decoded)
    : await drawFileToCanvas(file);
  decoded?.release();
  const dimensionsLabel = `${canvas.width}x${canvas.height}`;

  for (const quality of JPEG_QUALITY_STEPS) {
    logImageOptimizerStep("optimize:encode:start", {
      fileName: file.name,
      quality,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });
    const blob = await canvasToBlob(canvas, quality);
    logImageOptimizerStep("optimize:encode:done", {
      fileName: file.name,
      quality,
      blobSize: blob.size,
    });

    if (blob.size > MAX_IMAGE_SIZE_BYTES) {
      continue;
    }

    const optimizedFile = new File(
      [blob],
      replaceFileExtension(file.name, "jpg"),
      {
        type: "image/jpeg",
        lastModified: file.lastModified,
      },
    );

    console.log(
      "[IMAGE OPTIMIZER]",
      file.name,
      `original=${(file.size / 1024 / 1024).toFixed(2)} MB`,
      `final=${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
      dimensionsLabel,
      `quality=${quality}`,
    );

    return {
      file: optimizedFile,
      outputDimensions: {
        width: canvas.width,
        height: canvas.height,
      },
      perf: {
        inputDimensions: {
          width: originalWidth,
          height: originalHeight,
        },
        outputDimensions: {
          width: canvas.width,
          height: canvas.height,
        },
        path,
        totalMs: performance.now() - optimizeStartedAt,
      },
      wasOptimized: true,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
    };
  }

  console.timeEnd(traceId);

  throw new Error(
    `${file.name}: sigue superando el maximo de 10MB despues de optimizar.`,
  );
}
