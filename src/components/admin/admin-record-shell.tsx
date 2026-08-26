import type { ReactNode } from "react";

interface AdminRecordShellProps {
  actions?: ReactNode;
  children: ReactNode;
  subtitle?: ReactNode;
  title: string;
}

export function AdminRecordShell({
  actions,
  children,
  subtitle,
  title,
}: AdminRecordShellProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1 space-y-4">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              {title}
            </h4>
            {subtitle ? <div>{subtitle}</div> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-start gap-3">{actions}</div> : null}
        </div>
      </div>
      <div className="space-y-6 p-6 sm:p-8">{children}</div>
    </div>
  );
}
