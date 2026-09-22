import type { MetadataRoute } from "next";
import { listPublishedNewsSitemapEntries } from "@/features/news/news.data";
import { listPublishedProjectSitemapEntries } from "@/features/projects/projects.data";
import { listPublishedPropertySitemapEntries } from "@/features/properties/properties.data";
import { buildAbsoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "/",
  "/comprar",
  "/alquileres",
  "/inversion",
  "/noticias",
  "/asesoramiento",
  "/contacto",
];

function toSitemapEntry(path: string, lastModified?: string | null) {
  return {
    url: buildAbsoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects, news] = await Promise.all([
    listPublishedPropertySitemapEntries(),
    listPublishedProjectSitemapEntries(),
    listPublishedNewsSitemapEntries(),
  ]);
  const seenUrls = new Set<string>();

  const entries = [
    ...staticRoutes.map((path) => toSitemapEntry(path)),
    ...properties.map((property) =>
      toSitemapEntry(
        `/${property.operationType === "rent" ? "alquileres" : "comprar"}/${property.slug}`,
        property.updatedAt,
      ),
    ),
    ...projects.map((project) =>
      toSitemapEntry(`/inversion/${project.slug}`, project.updatedAt),
    ),
    ...news.map((item) =>
      toSitemapEntry(`/noticias/${item.slug}`, item.updatedAt ?? item.publishedAt),
    ),
  ];

  return entries.filter((entry) => {
    if (seenUrls.has(entry.url)) {
      return false;
    }

    seenUrls.add(entry.url);
    return true;
  });
}
