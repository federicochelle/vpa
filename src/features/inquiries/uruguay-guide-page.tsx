import type { ReactNode } from "react";
import { AdvisoryContactForm } from "@/features/inquiries/advisory-contact-form";
import type { InquiryIntent } from "@/types/inquiry";

export interface UruguayGuideTable {
  headers: string[];
  rows: string[][];
}

export interface UruguayGuideSection {
  bullets?: string[];
  callout?: string;
  children?: ReactNode;
  paragraphs?: string[];
  table?: UruguayGuideTable;
  title: string;
}

export interface UruguayGuideFaq {
  answer: string;
  question: string;
}

export interface UruguayGuidePageContent {
  contactDescription: string;
  contactTitle: string;
  ctaLabel: string;
  disclaimer: string;
  eyebrow: string;
  faq: UruguayGuideFaq[];
  faqTitle: string;
  introduction: string;
  intent: InquiryIntent;
  sections: UruguayGuideSection[];
  subtitle: string;
  title: string;
}

export function UruguayGuidePage({ content }: { content: UruguayGuidePageContent }) {
  return (
    <>
      <main>
        <section className="bg-white py-14 sm:py-20">
          <div className="shell">
            <h1 className="sr-only">{content.title}</h1>
            <p className="mx-auto max-w-6xl text-center font-display text-2xl leading-relaxed text-primary-strong sm:text-3xl">
              {content.introduction}
            </p>
          </div>
        </section>

        <div className="bg-surface-strong py-14 sm:py-20">
          <div className="shell space-y-8 sm:space-y-10">
            {content.sections.map((section) => (
              <section className="border border-border bg-white p-6 sm:p-9" key={section.title}>
                <div className="max-w-6xl space-y-6">
                  <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                    {section.title}
                  </h2>

                  {section.paragraphs?.map((paragraph) => (
                    <p className="section-copy !max-w-6xl" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}

                  {section.callout ? (
                    <p className="border-l-4 border-primary bg-primary/6 px-5 py-4 font-display text-lg leading-relaxed text-primary-strong">
                      {section.callout}
                    </p>
                  ) : null}

                  {section.bullets ? (
                    <ul className="grid gap-3 text-base leading-relaxed text-foreground sm:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <li className="flex gap-3" key={bullet}>
                          <span aria-hidden="true" className="mt-2 h-2 w-2 flex-none rounded-full bg-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.table ? (
                    <div className="overflow-x-auto border border-border">
                      <table className="min-w-full border-collapse text-left text-sm leading-relaxed">
                        <thead className="bg-primary text-white">
                          <tr>
                            {section.table.headers.map((header) => (
                              <th className="px-4 py-3 font-semibold" key={header} scope="col">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row) => (
                            <tr className="border-t border-border align-top even:bg-surface-strong" key={row.join("|")}>
                              {row.map((cell, index) => (
                                <td className="min-w-48 px-4 py-3 text-foreground" key={`${row[0]}-${index}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {section.children}
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="bg-white py-14 sm:py-20">
          <div className="shell max-w-6xl space-y-6">
            <h2 className="section-title">{content.faqTitle}</h2>
            <div className="divide-y divide-border border-y border-border">
              {content.faq.map((item) => (
                <details className="group py-5" key={item.question}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-display text-lg text-foreground marker:hidden">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="text-2xl font-light text-primary-strong transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="section-copy mt-4 !max-w-6xl">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-strong py-14 sm:py-20" id="consultar">
          <div className="shell">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)] lg:items-start lg:gap-14">
              <div className="space-y-5">
                <h2 className="section-title">{content.contactTitle}</h2>
                <p className="section-copy !max-w-6xl">{content.contactDescription}</p>
                <p className="type-body-compact max-w-6xl text-muted">{content.disclaimer}</p>
              </div>
              <AdvisoryContactForm intent={content.intent} submitLabel={content.ctaLabel} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
