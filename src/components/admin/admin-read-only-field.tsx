import type { ReactNode } from "react";

interface AdminReadOnlyFieldProps {
  className?: string;
  label: string;
  multiline?: boolean;
  plain?: boolean;
  value: ReactNode;
}

export function AdminReadOnlyField({
  className = "",
  label,
  multiline = false,
  plain = true,
  value,
}: AdminReadOnlyFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div className="min-w-0 flex flex-col gap-2">
      <span className="admin-field-label">{label}</span>
      <div
        className={`${plain ? "type-input px-4 py-3 text-foreground" : "admin-input-base"} min-w-0 break-words flex items-center ${
          multiline ? "min-h-40 items-start whitespace-pre-wrap" : "min-h-12"
        } ${className}`}
      >
        {isEmpty ? "—" : value}
      </div>
    </div>
  );
}
