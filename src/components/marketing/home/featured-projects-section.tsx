import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicMessage } from "@/i18n/public/messages";
import { getPublicLocale } from "@/i18n/public/locale.server";

export async function FeaturedProjectsSection() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <section className="shell section-gap">
      <SectionHeading
        eyebrow={t("home.featuredProjectsEyebrow")}
        title={t("home.featuredProjectsTitle")}
        description={t("home.featuredProjectsDescription")}
      />
      <div className="mt-8">
        <EmptyState
          title={t("home.featuredProjectsEmptyTitle")}
          description={t("home.featuredProjectsEmptyDescription")}
        />
      </div>
    </section>
  );
}
