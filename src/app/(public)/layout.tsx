import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PublicWhatsAppButton } from "@/components/layout/public-whatsapp-button";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <PublicWhatsAppButton />
    </div>
  );
}
