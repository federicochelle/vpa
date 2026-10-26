import Link from "next/link";

export interface InformativeGuide {
  description: string;
  external?: boolean;
  href: string;
  id: string;
  link?: string;
  title: string;
}

interface InformativeGuidesSectionProps {
  guides: InformativeGuide[];
  labels: {
    description: string;
    externalNote?: string;
    link: string;
    title: string;
  };
}

export function InformativeGuidesSection({ guides, labels }: InformativeGuidesSectionProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="shell space-y-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="section-title">{labels.title}</h2>
          <p className="section-copy mx-auto">{labels.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const className =
              "group flex h-full flex-col border border-border bg-surface px-6 py-7 shadow-[0_14px_40px_rgba(39,39,39,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_40px_rgba(39,39,39,0.08)] focus:outline-none focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/8 sm:px-8 sm:py-9";
            const content = (
              <>
                <div className="flex-1 space-y-4">
                  <h3 className="font-display text-2xl leading-tight text-foreground lg:text-[1.375rem] xl:text-2xl">
                    {guide.title}
                  </h3>
                  <p className="type-body-compact font-medium text-foreground">{guide.description}</p>
                </div>
                <span className="button-primary mt-8 inline-flex min-h-12 w-full items-center justify-center text-center sm:w-fit sm:px-8">
                  {guide.link ?? labels.link}
                </span>
              </>
            );

            return guide.external ? (
              <a
                className={className}
                href={guide.href}
                key={guide.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                {content}
                {labels.externalNote ? <span className="sr-only">{labels.externalNote}</span> : null}
              </a>
            ) : (
              <Link className={className} href={guide.href} key={guide.id}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
