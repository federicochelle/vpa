import type { Feature } from "@/types/feature";

interface FeatureChipListProps {
  features: Feature[];
}

export function FeatureChipList({ features }: FeatureChipListProps) {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-wrap gap-2">
      {features.map((feature) => (
        <span
          className="type-body-compact inline-flex max-w-full min-w-0 items-center break-words rounded-full border border-primary/12 bg-primary/8 px-3 py-2 font-medium text-primary-strong [overflow-wrap:anywhere]"
          key={feature.id}
        >
          {feature.name}
        </span>
      ))}
    </div>
  );
}
