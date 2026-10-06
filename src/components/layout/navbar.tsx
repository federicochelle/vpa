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

const mobileNavigation = [
  ...publicNavigation,
  { href: "/noticias", messageKey: "nav.news" },
] as const;

function OwnerLeadStrip({
  className = "",
  isVisible,
  onOpen,
}: {
  className?: string;
  isVisible: boolean;
  onOpen: () => void;
}) {
  const { t } = usePublicLocale();

  return (
    <div className={`overflow-hidden ${className}`}>
      <button
        aria-label={t("ownerStrip.label")}
        aria-hidden={!isVisible}
        className={`group block w-full cursor-pointer border-b border-primary/12 bg-surface-strong text-center shadow-[0_1px_0_rgba(161,14,40,0.08)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none ${
          isVisible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
        onClick={onOpen}
        tabIndex={isVisible ? undefined : -1}
        type="button"
      >
        <div className="shell flex min-h-9 items-center justify-center px-4 py-2">
          <p className="type-body-compact text-foreground">
            {t("ownerStrip.text")}{" "}
            <span className="font-semibold text-primary-strong underline underline-offset-4 transition-colors group-hover:text-primary">
              {t("ownerStrip.cta")}
            </span>
          </p>
        </div>
      </button>
    </div>
  );
}

export function Navbar() {
  const { t } = usePublicLocale();
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeIndicator, setActiveIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [isOwnerStripVisible, setIsOwnerStripVisible] = useState(true);
  const [isOwnerLeadModalOpen, setIsOwnerLeadModalOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const frameRef = useRef<number | null>(null);

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

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const resetFrame = window.requestAnimationFrame(() => {
      setIsOwnerStripVisible(true);
    });

    return () => window.cancelAnimationFrame(resetFrame);
  }, [pathname]);

  useEffect(() => {
    const scrollThreshold = 8;

    const updateStripVisibility = () => {
      frameRef.current = null;
      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = lastScrollYRef.current;
      const scrollDelta = currentScrollY - previousScrollY;

      if (currentScrollY <= 0) {
        setIsOwnerStripVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (Math.abs(scrollDelta) < scrollThreshold) {
        return;
      }

      setIsOwnerStripVisible(scrollDelta < 0);
      lastScrollYRef.current = currentScrollY;
    };

    const handleScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(updateStripVisibility);
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

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
      <OwnerLeadStrip
        className="sticky top-20 z-30 md:hidden"
        isVisible={isOwnerStripVisible}
        onOpen={() => setIsOwnerLeadModalOpen(true)}
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
            {publicNavigation.map((item) => {
              const isActive = isItemActive(item.href);
              const isAdvisoryLink = item.href === "/asesoramiento";

              return (
                <Link
                  key={item.href}
                  ref={(element) => {
                    linkRefs.current[item.href] = element;
                  }}
                  className={
                    isAdvisoryLink
                      ? "type-meta font-display relative ml-2 inline-flex items-center border border-white bg-white px-[18px] py-2.5 font-semibold uppercase tracking-[0.14em] text-primary-strong transition-colors duration-200 hover:bg-white/82"
                      : `type-meta font-display relative font-semibold uppercase tracking-[0.14em] text-white transition-colors ${
                          isActive ? "" : "hover:text-white/70"
                        }`
                  }
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
      <OwnerLeadStrip
        className="sticky top-20 z-30 hidden md:block"
        isVisible={isOwnerStripVisible}
        onOpen={() => setIsOwnerLeadModalOpen(true)}
      />
      <OwnerLeadModal
        onClose={() => setIsOwnerLeadModalOpen(false)}
        open={isOwnerLeadModalOpen}
      />
    </>
  );
}
