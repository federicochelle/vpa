"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import logoVpa from "../../../logovpa.webp";
import { MobileTopbarMenu } from "@/components/layout/mobile-topbar-menu";
import { publicNavigation } from "@/lib/navigation";

const mobileNavigation = [
  ...publicNavigation,
  { href: "/noticias", label: "NOTICIAS" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeIndicator, setActiveIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

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
        closeLabel="Cerrar menu"
        headerClassName="md:hidden"
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
        openLabel="Abrir menu"
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
        }
      />

      <header className="sticky top-0 z-40 hidden border-b border-white/15 bg-primary backdrop-blur md:block">
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
