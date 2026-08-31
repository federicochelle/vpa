import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, actions }: PageIntroProps) {
  return (
    <section className="section-gap shell">
      <div className="panel overflow-hidden">
        <div className="grid gap-8 brand-panel-header px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-12">
          <div className="space-y-4">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="section-copy">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
