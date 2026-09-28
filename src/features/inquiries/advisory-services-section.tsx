"use client";

import { useState } from "react";
import {
  ChartNoAxesCombined,
  FileText,
  Handshake,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { AdvisoryContactModal } from "@/features/inquiries/advisory-contact-modal";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import type { InquiryIntent } from "@/types/inquiry";

interface AdvisoryServiceConfig {
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  intent: InquiryIntent;
  modalTitle: string;
  modalDescription: string;
  submitLabel: string;
}

export function AdvisoryServicesSection() {
  const { t } = usePublicLocale();
  const [activeService, setActiveService] = useState<AdvisoryServiceConfig | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const advisoryServices: AdvisoryServiceConfig[] = [
    {
      title: t("advisory.serviceValuationTitle"),
      description: t("advisory.serviceValuationDescription"),
      cta: t("advisory.serviceValuationCta"),
      icon: Scale,
      intent: "valuation",
      modalTitle: t("advisory.serviceValuationCta"),
      modalDescription: t("advisory.serviceValuationModalDescription"),
      submitLabel: t("advisory.serviceSubmitRequest"),
    },
    {
      title: t("advisory.serviceSellTitle"),
      description: t("advisory.serviceSellDescription"),
      cta: t("advisory.serviceSellTitle"),
      icon: Handshake,
      intent: "sell",
      modalTitle: t("advisory.serviceSellModalTitle"),
      modalDescription: t("advisory.serviceSellModalDescription"),
      submitLabel: t("advisory.serviceSubmitInquiry"),
    },
    {
      title: t("advisory.serviceInvestmentTitle"),
      description: t("advisory.serviceInvestmentDescription"),
      cta: t("advisory.serviceInvestmentCta"),
      icon: ChartNoAxesCombined,
      intent: "investment",
      modalTitle: t("advisory.serviceInvestmentTitle"),
      modalDescription: t("advisory.serviceInvestmentModalDescription"),
      submitLabel: t("advisory.serviceSubmitAdvice"),
    },
    {
      title: t("advisory.serviceReportTitle"),
      description: t("advisory.serviceReportDescription"),
      cta: t("advisory.serviceReportCta"),
      icon: FileText,
      intent: "professional_report",
      modalTitle: t("advisory.serviceReportTitle"),
      modalDescription: t("advisory.serviceReportModalDescription"),
      submitLabel: t("advisory.serviceSubmitReport"),
    },
  ];
  const openService = (service: AdvisoryServiceConfig) => {
    setActiveService(service);
  };

  return (
    <section
      className="scroll-mt-32 bg-surface-strong py-18 sm:py-24"
      id="propietarios"
    >
      <div className="shell">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="section-title">
              {t("advisory.servicesTitle")}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {advisoryServices.map((service) => {
              const Icon = service.icon;

              return (
                <button
                  className="group grid h-full grid-cols-[5.25rem_minmax(0,1fr)] items-center gap-5 border border-border bg-surface px-5 py-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_40px_rgba(39,39,39,0.06)] focus:outline-none focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/8 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-7 sm:px-7 sm:py-8"
                  key={service.title}
                  onClick={() => openService(service)}
                  type="button"
                >
                  <span className="flex h-20 w-20 items-center justify-center self-center border border-primary/15 bg-primary/6 text-primary-strong transition-colors group-hover:border-primary/25 group-hover:bg-primary/8 sm:h-[6.5rem] sm:w-[6.5rem]">
                    <Icon aria-hidden="true" className="h-11 w-11 stroke-[1.45] sm:h-14 sm:w-14" />
                  </span>

                  <span className="flex min-w-0 flex-col">
                    <span className="font-display text-xl leading-tight text-foreground">
                      {service.title}
                    </span>
                    <span className="type-body-compact mt-4 text-muted">
                      {service.description}
                    </span>
                    <span className="type-button mt-7 inline-flex w-fit items-center border-b border-primary/30 pb-1 text-primary-strong transition-colors group-hover:border-primary group-hover:text-primary">
                      {service.cta}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AdvisoryContactModal
        description={activeService?.modalDescription}
        intent={activeService?.intent}
        onClose={() => setActiveService(null)}
        onSuccess={() => {
          setActiveService(null);
          setShowSuccessModal(true);
        }}
        open={activeService !== null}
        submitLabel={activeService?.submitLabel}
        title={activeService?.modalTitle}
      />
      {showSuccessModal ? (
        <AdminFeedbackModal
          message={t("advisory.successMessage")}
          onClose={() => setShowSuccessModal(false)}
          title={t("advisory.successTitle")}
          variant="success"
        />
      ) : null}
    </section>
  );
}
