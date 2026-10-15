"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import logoVpa from "../../../logovpa.webp";
import { MobileTopbarMenu } from "@/components/layout/mobile-topbar-menu";
import { OwnerLeadModal } from "@/features/inquiries/owner-lead-modal";
import { PublicLocaleSwitcher } from "@/i18n/public/locale-switcher";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import { publicNavigation } from "@/lib/navigation";

const ownerLeadNavigationItem = { action: "ownerLead", messageKey: "nav.sell" } as const;

const mobileNavigation = [
  ...publicNavigation.slice(0, 2),
  ownerLeadNavigationItem,
  ...publicNavigation.slice(2),
  { href: "/noticias", messageKey: "nav.news" },
] as const;

export function Navbar() {
  const { t } = usePublicLocale();
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeIndicator, setActiveIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [isOwnerLeadModalOpen, setIsOwnerLeadModalOpen] = useState(false);

  const isItemActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  useEffect(() => {
    const updateIndicator = () => {
      const activeItem = publicNavigation.find((item) => isItemActive(item.href));
      const activeLink = activeItem ? linkRefs.current[activeItem.href] : null;
      const nav = desktopNavRef.current;

      if (!activeLink || !nav) {
        setActiveIndicator(null);
        return;
      }

      setActiveIndicator({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    };

    updateIndicator();

    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [isItemActive, pathname]);

  return (
    <>
      <MobileTopbarMenu
        closeLabel={t("nav.closeMenu")}
        headerClassName="z-50 md:hidden"
        key={pathname}
        logo={
          <Link className="flex min-w-0 flex-1 items-center" href="/">
            <Image
              alt="VPA"
              className="h-auto w-full max-w-64"
              priority
              src={logoVpa}
            />
          </Link>
        }
        openLabel={t("nav.openMenu")}
        overlayClassName="fixed inset-x-0 top-20 z-50 border-t border-white/15 bg-primary/98 backdrop-blur"
        panel={
          <nav className="shell flex flex-col items-center py-4 text-center">
            {mobileNavigation.map((item) => {
              if ("action" in item) {
                return (
                  <Link
                    key={item.action}
                    className="type-meta font-display relative w-full rounded-2xl px-4 py-3 text-center font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10 hover:text-white/70"
                    href="#vender"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsOwnerLeadModalOpen(true);
                    }}
                  >
                    {t(item.messageKey)}
                  </Link>
                );
              }

              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  className={`type-meta font-display relative w-full rounded-2xl px-4 py-3 text-center font-semibold uppercase tracking-[0.14em] text-white transition-colors ${
                    isActive
                      ? ""
                      : "hover:bg-white/10 hover:text-white/70"
                  }`}
                  href={item.href}
                >
                  {t(item.messageKey)}
                </Link>
              );
            })}
            <div className="mt-4 flex w-full justify-center border-t border-white/15 pt-4">
              <PublicLocaleSwitcher />
            </div>
          </nav>
        }
      />

      <header className="sticky top-0 z-50 hidden border-b border-white/15 bg-primary backdrop-blur md:block">
        <div className="shell flex h-20 items-center justify-between gap-6">
          <Link className="flex items-center" href="/">
            <Image
              alt="VPA"
              className="h-auto w-64"
              priority
              src={logoVpa}
            />
          </Link>
          <nav
            ref={desktopNavRef}
            className="relative hidden items-center gap-6 md:flex"
          >
            {activeIndicator ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-2 h-0.5 rounded-full bg-white transition-all duration-300 ease-out"
                style={{
                  left: `${activeIndicator.left}px`,
                  width: `${activeIndicator.width}px`,
                }}
              />
            ) : null}
            {[...publicNavigation.slice(0, 2), ownerLeadNavigationItem, ...publicNavigation.slice(2)].map((item) => {
              if ("action" in item) {
                return (
                  <Link
                    key={item.action}
                    className="type-meta font-display relative font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:text-white/70"
                    href="#vender"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsOwnerLeadModalOpen(true);
                    }}
                  >
                    {t(item.messageKey)}
                  </Link>
                );
              }

              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  ref={(element) => {
                    linkRefs.current[item.href] = element;
                  }}
                  className={`type-meta font-display relative font-semibold uppercase tracking-[0.14em] text-white transition-colors ${
                    isActive ? "" : "hover:text-white/70"
                  }`}
                  href={item.href}
                >
                  {t(item.messageKey)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <PublicLocaleSwitcher />
        </div>
      </header>
      <OwnerLeadModal
        onClose={() => setIsOwnerLeadModalOpen(false)}
        open={isOwnerLeadModalOpen}
      />
    </>
  );
}
