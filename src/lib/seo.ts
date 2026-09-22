import type { Metadata } from "next";

export const siteName = "Virginia Pintos & Asociados";

export const siteDescription =
  "Proyectos de arquitectura, propiedades e inversiones inmobiliarias en Uruguay con asesoramiento personalizado de Virginia Pintos.";

export const siteLocale = "es_UY";

export const openGraphImage = {
  path: "/opengraph.jpeg",
  width: 850,
  height: 224,
  type: "image/jpeg",
  alt: "Virginia Pintos & Asociados",
};

function normalizeSiteUrl(value: string | undefined) {
  const rawUrl = value?.trim();

  if (!rawUrl) {
    return undefined;
  }

  const urlWithProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    const url = new URL(urlWithProtocol);
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return undefined;
  }
}

function getConfiguredSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  return normalizeSiteUrl(rawUrl);
}

export const configuredSiteUrl = getConfiguredSiteUrl();
export const siteUrl = configuredSiteUrl ?? new URL("http://localhost:3000");

export function buildAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteUrl).toString();
}

interface SeoImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

interface SeoImageCandidate {
  url: string;
  isCover?: boolean | null;
  altText?: string | null;
}

interface CreateSeoMetadataInput {
  title: string;
  description?: string | null;
  path: string;
  image?: SeoImage | null;
  type?: "website" | "article";
  robots?: Metadata["robots"];
}

export function cleanSeoText(value: string | null | undefined) {
  return (
    value
      ?.replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || ""
  );
}

export function createSeoDescription(value: string | null | undefined) {
  const cleaned = cleanSeoText(value);
  const source = cleaned || siteDescription;

  if (source.length <= 170) {
    return source;
  }

  const truncated = source.slice(0, 167);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 120 ? lastSpace : 167).trim()}...`;
}

export function getFallbackSeoImage(alt = openGraphImage.alt): SeoImage {
  return {
    url: buildAbsoluteUrl(openGraphImage.path),
    width: openGraphImage.width,
    height: openGraphImage.height,
    type: openGraphImage.type,
    alt,
  };
}

export function resolveContentSeoImage(
  images: SeoImageCandidate[],
  fallbackAlt: string,
): SeoImage {
  const selectedImage =
    images.find((image) => image.isCover && image.url.trim().length > 0) ??
    images.find((image) => image.url.trim().length > 0);

  if (!selectedImage) {
    return getFallbackSeoImage(fallbackAlt);
  }

  return {
    url: buildAbsoluteUrl(selectedImage.url),
    alt: cleanSeoText(selectedImage.altText) || fallbackAlt,
  };
}

export function createSeoMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  robots,
}: CreateSeoMetadataInput): Metadata {
  const resolvedDescription = createSeoDescription(description);
  const resolvedImage = image ?? getFallbackSeoImage(title);
  const imageMetadata = {
    url: resolvedImage.url,
    ...(resolvedImage.width ? { width: resolvedImage.width } : {}),
    ...(resolvedImage.height ? { height: resolvedImage.height } : {}),
    ...(resolvedImage.type ? { type: resolvedImage.type } : {}),
    alt: resolvedImage.alt,
  };

  return {
    title: path === "/" ? { absolute: title } : title,
    description: resolvedDescription,
    alternates: {
      canonical: path,
    },
    ...(robots ? { robots } : {}),
    openGraph: {
      type,
      locale: siteLocale,
      siteName,
      title,
      description: resolvedDescription,
      url: buildAbsoluteUrl(path),
      images: [imageMetadata],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [imageMetadata],
    },
  };
}

export function createNotFoundSeoMetadata(title = "No encontrado"): Metadata {
  return createSeoMetadata({
    title,
    description: "No encontramos el contenido solicitado.",
    path: "/",
    robots: {
      index: false,
      follow: false,
    },
  });
}
