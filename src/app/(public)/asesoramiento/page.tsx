import Image from "next/image";
import { createSeoMetadata } from "@/lib/seo";
import { AdvisoryContactForm } from "@/features/inquiries/advisory-contact-form";
import { AdvisoryServicesSection } from "@/features/inquiries/advisory-services-section";
import {
  InformativeGuidesSection,
  type InformativeGuide,
} from "@/features/inquiries/informative-guides-section";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
import virginiaImage from "../../../../virginia.jpeg";

const advisoryGuideFiles: Array<{
  descriptionKey: Parameters<typeof getPublicMessage>[1];
  href: string;
  id: string;
  titleKey: Parameters<typeof getPublicMessage>[1];
}> = [
  {
    id: "residents-guide",
    titleKey: "advisory.guidesResidentsTitle",
    descriptionKey: "advisory.guidesResidentsDescription",
    href: "/asesoramiento/residentes",
  },
  {
    id: "non-residents-guide",
    titleKey: "advisory.guidesNonResidentsTitle",
    descriptionKey: "advisory.guidesNonResidentsDescription",
    href: "/asesoramiento/no-residentes",
  },
];

export const metadata = createSeoMetadata({
  title: "Asesoramiento",
  description:
    "Asesoramiento personalizado para comprar, vender, alquilar o invertir, con experiencia y cercanía de Virginia Pintos.",
  path: "/asesoramiento",
});

export default async function AdvisoryPage() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const guides: InformativeGuide[] = advisoryGuideFiles.map((guide) => ({
    id: guide.id,
    title: t(guide.titleKey),
    description: t(guide.descriptionKey),
    href: guide.href,
  }));

  return (
    <>
      <AdvisoryServicesSection />

      <InformativeGuidesSection
        guides={guides}
        labels={{
          description: t("advisory.guidesDescription"),
          link: t("advisory.guidesLearnMore"),
          title: t("advisory.guidesTitle"),
        }}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
            <div className="relative min-h-[360px] overflow-hidden border border-border bg-surface-muted sm:min-h-[460px]">
              <Image
                src={virginiaImage}
                alt={t("advisory.heroAlt")}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>

            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h1 className="section-title advisory-hero-title">
                  {t("advisory.heroTitle")}
                </h1>
              </div>

              <div className="section-copy max-w-none space-y-5">
                <p>
                  {t("advisory.heroParagraphOne")}
                </p>
                <p>
                  {t("advisory.heroParagraphTwo")}
                </p>
                <p>
                  {t("advisory.heroParagraphThree")}
                </p>
                <p className="font-display advisory-hero-title text-primary-strong">
                  {t("advisory.heroParagraphFour")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-strong py-18 sm:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)] lg:items-start lg:gap-14">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="section-title">
                {t("advisory.talkTitle")}
              </h2>
              <p className="section-copy max-w-2xl">
                {t("advisory.talkDescription")}
              </p>
            </div>

            <AdvisoryContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
