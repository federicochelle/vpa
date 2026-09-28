import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicMessage } from "@/i18n/public/messages";
import { getPublicLocale } from "@/i18n/public/locale.server";

export async function FeaturedPropertiesSection() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <section className="shell section-gap">
      <SectionHeading
        eyebrow={t("home.featuredPropertiesEyebrow")}
        title={t("home.featuredPropertiesTitle")}
        description={t("home.featuredPropertiesDescription")}
      />
      <div className="mt-8">
        <EmptyState
          title={t("home.featuredPropertiesEmptyTitle")}
          description={t("home.featuredPropertiesEmptyDescription")}
        />
      </div>
    </section>
  );
}
