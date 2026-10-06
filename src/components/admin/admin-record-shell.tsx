import type { ReactNode } from "react";

interface AdminRecordShellProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  stackActionsOnMobile?: boolean;
  subtitle?: ReactNode;
  title: string;
}

export function AdminRecordShell({
  actions,
  children,
  className,
  stackActionsOnMobile = false,
  subtitle,
  title,
}: AdminRecordShellProps) {
  return (
    <div className={`panel overflow-hidden ${className ?? ""}`}>
      <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
        <div className={`flex items-start justify-between gap-6 ${stackActionsOnMobile ? "flex-col sm:flex-row" : ""}`}>
          <div className="min-w-0 flex-1 space-y-4">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              {title}
            </h4>
            {subtitle ? <div>{subtitle}</div> : null}
          </div>
          {actions ? (
            <div className={`flex flex-wrap items-start gap-3 ${stackActionsOnMobile ? "w-full sm:w-auto sm:shrink-0" : "shrink-0"}`}>
              {actions}
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-6 p-6 sm:p-8">{children}</div>
    </div>
  );
}
