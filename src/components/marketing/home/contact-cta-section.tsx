import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicMessage } from "@/i18n/public/messages";
import { getPublicLocale } from "@/i18n/public/locale.server";

export async function ContactCtaSection() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <section className="shell section-gap">
      <div className="panel overflow-hidden bg-[linear-gradient(135deg,rgba(40,75,99,0.98),rgba(23,48,66,0.96))] px-6 py-10 text-white sm:px-8">
        <SectionHeading
          eyebrow={t("home.contactCtaEyebrow")}
          title={t("home.contactCtaTitle")}
          description={t("home.contactCtaDescription")}
        />
        <div className="mt-8">
          <Button href="/contacto">
            {t("home.contactCtaButton")}
          </Button>
        </div>
      </div>
    </section>
  );
}
