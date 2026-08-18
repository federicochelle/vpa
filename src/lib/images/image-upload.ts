import "client-only";

import { heicTo } from "heic-to";
import {
  assertSupportedImageFile,
  getImageMimeTypeFromFileName,
  isHeicImageFile,
  JPEG_QUALITY_STEPS,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/images/image-upload.constants";
import {
  calculateTargetDimensions,
  type ImageDimensions,
  optimizeImageFile,
} from "@/lib/images/image-optimizer";

export interface PrepareImageUploadResult {
  file: File;
  outputDimensions: ImageDimensions;
  wasOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
  wasHeicConverted: boolean;
  heicPerf?: {
    conversionMs: number;
    convertedMimeType: string;
    convertedSize: number;
    decodeMs: number;
    originalMimeType: string;
    originalSize: number;
    resizeEncodeMs: number;
    startedAt: number;
    totalMs: number;
    outputDimensions: ImageDimensions;
    inputDimensions: ImageDimensions;
  };
}

interface HeicConversionResult {
  convertedMimeType: string;
  convertedSize: number;
  decodeMs: number;
  file: File;
  inputDimensions: ImageDimensions;
  resizeEncodeMs: number;
  totalMs: number;
  outputDimensions: ImageDimensions;
}

function logImageUploadStep(label: string, payload?: Record<string, unknown>) {
  console.log(`[IMAGE_UPLOAD] ${label}`, payload ?? {});
}

function assertBrowserImageProcessingAvailable() {
  if (typeof document === "undefined") {
    throw new Error(
      "El procesamiento de imagenes solo puede ejecutarse en el navegador.",
    );
  }
}

function bytesToMb(bytes: number) {
  return Number((bytes / 1024 / 1024).toFixed(2));
}

function replaceFileExtension(filename: string, extension: string) {
  const normalizedName = filename.trim();

  if (normalizedName.length === 0) {
    return `image.${extension}`;
  }

  return normalizedName.replace(/\.[^./\\]+$/, "") + `.${extension}`;
}

function logHeicConversionError(file: File, error: unknown) {
  const errorDetails =
    error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          cause: error.cause,
          causeStack: error.cause instanceof Error ? error.cause.stack : undefined,
        }
      : {
          message: String(error),
        };

  console.error("[HEIC CONVERSION FAILED]", {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    error,
    ...errorDetails,
  });
}

function normalizeImageFileType(file: File) {
  const inferredMimeType = getImageMimeTypeFromFileName(file.name);

  if (!inferredMimeType || file.type === inferredMimeType) {
    return file;
  }

  return new File([file], file.name, {
    type: inferredMimeType,
    lastModified: file.lastModified,
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("La conversion no devolvio una imagen valida."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function convertHeicImageFile(file: File): Promise<HeicConversionResult> {
  assertBrowserImageProcessingAvailable();

  const totalStartedAt = performance.now();
  const traceId = `heic:${file.name}`;
  console.time(traceId);
  logImageUploadStep("heic:start", {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });

  try {
    const decodeStartedAt = performance.now();
    logImageUploadStep("heic:decode:start", { fileName: file.name });
    const convertedBitmap = await heicTo({
      blob: file,
      type: "bitmap",
    });
    const decodeMs = performance.now() - decodeStartedAt;
    logImageUploadStep("heic:decode:done", {
      fileName: file.name,
      decodeMs,
    });

    if (!(convertedBitmap instanceof ImageBitmap)) {
      throw new Error("La conversion no devolvio una imagen valida.");
    }

    const inputDimensions = {
      width: convertedBitmap.width,
      height: convertedBitmap.height,
    };
    const outputDimensions = calculateTargetDimensions(
      convertedBitmap.width,
      convertedBitmap.height,
    );
    const canvas = document.createElement("canvas");
    canvas.width = outputDimensions.width;
    canvas.height = outputDimensions.height;

    try {
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("No pudimos preparar la imagen para convertirla.");
      }

      const resizeEncodeStartedAt = performance.now();
      logImageUploadStep("heic:draw:start", {
        fileName: file.name,
        outputWidth: outputDimensions.width,
        outputHeight: outputDimensions.height,
      });
      context.drawImage(
        convertedBitmap,
        0,
        0,
        outputDimensions.width,
        outputDimensions.height,
      );

      let convertedBlob: Blob | null = null;

      for (const quality of JPEG_QUALITY_STEPS) {
        logImageUploadStep("heic:encode:start", {
          fileName: file.name,
          quality,
        });
        const nextBlob = await canvasToBlob(canvas, quality);
        logImageUploadStep("heic:encode:done", {
          fileName: file.name,
          quality,
          blobSize: nextBlob.size,
        });

        if (nextBlob.size > MAX_IMAGE_SIZE_BYTES) {
          continue;
        }

        convertedBlob = nextBlob;
        break;
      }

      if (!convertedBlob || convertedBlob.size === 0) {
        throw new Error("La conversion no devolvio una imagen valida.");
      }

      const resizeEncodeMs = performance.now() - resizeEncodeStartedAt;
      const convertedFile = new File(
        [convertedBlob],
        replaceFileExtension(file.name, "jpg"),
        {
          type: "image/jpeg",
          lastModified: file.lastModified,
        },
      );

      return {
        convertedMimeType: convertedBlob.type || convertedFile.type,
        convertedSize: convertedBlob.size,
        decodeMs,
        file: convertedFile,
        inputDimensions,
        outputDimensions,
        resizeEncodeMs,
        totalMs: performance.now() - totalStartedAt,
      };
    } finally {
      convertedBitmap.close();
      canvas.width = 1;
      canvas.height = 1;
      console.timeEnd(traceId);
    }
  } catch (error) {
    logHeicConversionError(file, error);
    console.timeEnd(traceId);

    throw new Error(
      `${file.name}: no pudimos convertir la imagen HEIC/HEIF automaticamente.`,
      {
        cause: error,
      },
    );
  }
}

export async function prepareImageUploadFile(
  file: File,
): Promise<PrepareImageUploadResult> {
  assertBrowserImageProcessingAvailable();
  assertSupportedImageFile(file);

  const totalStartedAt = performance.now();
  const traceId = `prepare:${file.name}`;
  console.time(traceId);
  logImageUploadStep("prepare:start", {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const normalizedInputFile = normalizeImageFileType(file);
  const isHeic = isHeicImageFile(normalizedInputFile);
  logImageUploadStep("prepare:normalized", {
    fileName: file.name,
    normalizedMimeType: normalizedInputFile.type,
    isHeic,
  });

  if (isHeic) {
    console.groupCollapsed(`[HEIC_PERF] ${normalizedInputFile.name}`);
    console.log("[HEIC_PERF] start", {
      fileName: normalizedInputFile.name,
      mimeType: normalizedInputFile.type,
      originalSizeMb: bytesToMb(normalizedInputFile.size),
    });
  }

  const heicConversionResult = isHeic
    ? await convertHeicImageFile(normalizedInputFile)
    : null;
  logImageUploadStep("prepare:heic-finished", {
    fileName: file.name,
    wasConverted: Boolean(heicConversionResult),
  });
  const normalizedFile = heicConversionResult
    ? heicConversionResult.file
    : normalizedInputFile;

  const optimizationResult = heicConversionResult
    ? {
        file: heicConversionResult.file,
        outputDimensions: heicConversionResult.outputDimensions,
        optimizedSize: heicConversionResult.file.size,
        originalSize: normalizedInputFile.size,
        wasOptimized: true,
      }
    : await optimizeImageFile(normalizedFile);
  logImageUploadStep("prepare:optimize-finished", {
    fileName: file.name,
    wasOptimized: optimizationResult.wasOptimized,
    optimizedSize: optimizationResult.optimizedSize,
    outputWidth: optimizationResult.outputDimensions.width,
    outputHeight: optimizationResult.outputDimensions.height,
  });

  if (heicConversionResult) {
    console.log("[HEIC_PERF] conversion", {
      decodeMs: Number(heicConversionResult.decodeMs.toFixed(2)),
      durationMs: Number(heicConversionResult.totalMs.toFixed(2)),
      finalSizeMb: bytesToMb(heicConversionResult.file.size),
      inputDimensions: heicConversionResult.inputDimensions,
      outputDimensions: heicConversionResult.outputDimensions,
      resizeEncodeMs: Number(heicConversionResult.resizeEncodeMs.toFixed(2)),
    });
    console.log("[HEIC_PERF] total", {
      totalMs: Number((performance.now() - totalStartedAt).toFixed(2)),
    });
    console.groupEnd();
  }

  console.timeEnd(traceId);

  return {
    file: optimizationResult.file,
    outputDimensions: optimizationResult.outputDimensions,
    wasOptimized: optimizationResult.wasOptimized,
    originalSize: optimizationResult.originalSize,
    optimizedSize: optimizationResult.optimizedSize,
    wasHeicConverted: Boolean(heicConversionResult),
    heicPerf: heicConversionResult
      ? {
          conversionMs: heicConversionResult.totalMs,
          convertedMimeType: heicConversionResult.convertedMimeType,
          convertedSize: heicConversionResult.convertedSize,
          decodeMs: heicConversionResult.decodeMs,
          originalMimeType: normalizedInputFile.type,
          originalSize: normalizedInputFile.size,
          resizeEncodeMs: heicConversionResult.resizeEncodeMs,
          startedAt: totalStartedAt,
          totalMs: performance.now() - totalStartedAt,
          outputDimensions: heicConversionResult.outputDimensions,
          inputDimensions: heicConversionResult.inputDimensions,
        }
      : undefined,
  };
}
