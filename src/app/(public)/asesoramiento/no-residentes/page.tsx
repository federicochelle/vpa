import type { Metadata } from "next";
import { UruguayGuidePage } from "@/features/inquiries/uruguay-guide-page";
import { getUruguayGuideContent } from "@/features/inquiries/uruguay-guide-content";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { createSeoMetadata } from "@/lib/seo";

const path = "/asesoramiento/no-residentes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPublicLocale();
  const content = getUruguayGuideContent(locale, "nonResidents");

  return createSeoMetadata({
    title: content.title,
    description: content.subtitle,
    path,
  });
}

export default async function NonResidentsGuidePage() {
  const locale = await getPublicLocale();

  return <UruguayGuidePage content={getUruguayGuideContent(locale, "nonResidents")} />;
}
