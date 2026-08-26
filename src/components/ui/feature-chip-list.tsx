import type { Feature } from "@/types/feature";

interface FeatureChipListProps {
  features: Feature[];
}

export function FeatureChipList({ features }: FeatureChipListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature) => (
        <span
          className="inline-flex items-center rounded-full border border-primary/12 bg-primary/8 px-3 py-2 text-sm font-medium text-primary-strong"
          key={feature.id}
        >
          {feature.name}
        </span>
      ))}
    </div>
  );
}
