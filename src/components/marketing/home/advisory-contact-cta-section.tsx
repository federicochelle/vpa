"use client";

import { useState } from "react";
import {
  AdvisoryContactModal,
  type AdvisoryContactOrigin,
} from "@/features/inquiries/advisory-contact-modal";
import { usePublicLocale } from "@/i18n/public/locale-provider";

const ctaButtons: Array<{
  labelKey: "advisory.wantAdvice" | "advisory.conversation" | "advisory.investment";
  origin: AdvisoryContactOrigin;
}> = [
  { labelKey: "advisory.wantAdvice", origin: "advisory" },
  { labelKey: "advisory.conversation", origin: "conversation" },
  { labelKey: "advisory.investment", origin: "investment" },
];

export function AdvisoryContactCtaSection() {
  const { t } = usePublicLocale();
  const [modalOrigin, setModalOrigin] = useState<AdvisoryContactOrigin | null>(null);

  return (
    <section className="bg-background py-18 sm:py-24">
      <div className="shell">
        <div className="mx-auto max-w-5xl space-y-8 text-center">
          <div className="mx-auto max-w-4xl space-y-5">
            <h2 className="font-display text-[clamp(1.45rem,5.5vw,2rem)] leading-tight text-foreground sm:text-[2.25rem]">
              {t("home.advisoryCtaTitleLineOne")}
              <span className="block text-primary-strong">
                {t("home.advisoryCtaTitleLineTwo")}
              </span>
            </h2>
            <p className="section-copy mx-auto max-w-2xl">
              {t("home.advisoryCtaDescription")}
            </p>
          </div>

          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {ctaButtons.map((button) => (
              <button
                className="button-primary inline-flex min-h-12 items-center justify-center px-6"
                key={button.origin}
                onClick={() => setModalOrigin(button.origin)}
                type="button"
              >
                {t(button.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AdvisoryContactModal
        onClose={() => setModalOrigin(null)}
        open={modalOrigin !== null}
        origin={modalOrigin}
      />
    </section>
  );
}
