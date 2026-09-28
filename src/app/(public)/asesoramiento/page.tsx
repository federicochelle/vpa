import Image from "next/image";
import { createSeoMetadata } from "@/lib/seo";
import { AdvisoryContactForm } from "@/features/inquiries/advisory-contact-form";
import { AdvisoryServicesSection } from "@/features/inquiries/advisory-services-section";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
import virginiaImage from "../../../../virginia.jpeg";
import virginiaSecondaryImage from "../../../../virgina2.jpeg";

export const metadata = createSeoMetadata({
  title: "Asesoramiento",
  description:
    "Asesoramiento personalizado para comprar, vender, alquilar o invertir, con experiencia y cercanía de Virginia Pintos.",
  path: "/asesoramiento",
});

export default async function AdvisoryPage() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <>
      <section className="bg-surface-strong py-16 sm:py-20">
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
                <h1 className="section-title">
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
              </div>

              <p className="font-display text-2xl text-foreground">
                Virginia Pintos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-18 sm:py-24">
        <div className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:gap-14">
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h2 className="section-title">
                  {t("advisory.personalTitle")}
                </h2>
              </div>

              <div className="section-copy max-w-2xl space-y-6">
                <p>
                  {t("advisory.personalParagraphOne")}
                </p>
                <p>
                  {t("advisory.personalParagraphTwo")}
                </p>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden border border-border bg-surface-muted sm:min-h-[420px]">
              <Image
                src={virginiaSecondaryImage}
                alt={t("advisory.personalAlt")}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <AdvisoryServicesSection />

      <section className="bg-white py-18 sm:py-24">
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
