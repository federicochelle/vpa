import type { ReactNode } from "react";
import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PublicScrollToTop } from "@/components/layout/public-scroll-to-top";
import { PublicWhatsAppButton } from "@/components/layout/public-whatsapp-button";
import { PublicInquiryAttributionCapture } from "@/features/inquiries/public-inquiry-attribution-capture";
import { PublicLocaleProvider } from "@/i18n/public/locale-provider";
import { getPublicLocale } from "@/i18n/public/locale.server";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const locale = await getPublicLocale();

  return (
    <PublicLocaleProvider locale={locale}>
      <div className="flex min-h-screen flex-col" lang={locale}>
        <Suspense fallback={null}>
          <PublicScrollToTop />
        </Suspense>
        <PublicInquiryAttributionCapture />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <PublicWhatsAppButton />
      </div>
    </PublicLocaleProvider>
  );
}
