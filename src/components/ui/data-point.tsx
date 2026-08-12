interface DataPointProps {
  label: string;
  value?: string | null;
}

export function DataPoint({ label, value }: DataPointProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 text-sm text-primary-strong">{value ?? "Pendiente de datos"}</p>
    </div>
  );
}
