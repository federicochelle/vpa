import { Blocks } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center gap-4 border-dashed px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Blocks className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-primary-strong">{title}</h3>
        <p className="type-body-compact mx-auto max-w-lg text-muted">{description}</p>
      </div>
    </div>
  );
}
