import type { Feature } from "@/types/feature";
import { getLocalizedFeatureName } from "@/i18n/public/content";
import type { PublicLocale } from "@/i18n/public/config";

interface FeatureChipListProps {
  features: Feature[];
  locale?: PublicLocale;
}

export function FeatureChipList({ features, locale = "es" }: FeatureChipListProps) {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-wrap gap-2">
      {features.map((feature) => {
        const name = getLocalizedFeatureName(feature, locale);

        return (
          <span
            className="type-body-compact inline-flex max-w-full min-w-0 items-center break-words rounded-full border border-primary/12 bg-primary/8 px-3 py-2 font-medium text-primary-strong [overflow-wrap:anywhere]"
            key={feature.id}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
