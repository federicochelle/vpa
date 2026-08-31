interface StatCardProps {
  label: string;
  note: string;
}

export function StatCard({ label, note }: StatCardProps) {
  return (
    <article className="panel p-6">
      <p className="type-body-compact font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="type-body-compact mt-6 rounded-2xl border border-dashed border-border bg-surface-strong px-4 py-5 text-foreground">
        {note}
      </div>
    </article>
  );
}
