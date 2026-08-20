"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import logoVpa from "../../../logovpa.webp";
import { publicNavigation } from "@/lib/navigation";

const mobileNavigation = [
  ...publicNavigation,
  { href: "/noticias", label: "NOTICIAS" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
    <header className="sticky top-0 z-40 border-b border-white/15 bg-primary backdrop-blur">
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
                className={`relative text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors ${
                  isActive ? "" : "hover:text-white"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          aria-expanded={isOpen}
          aria-label="Abrir menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        aria-hidden={!isOpen}
        className={`absolute left-0 right-0 top-full z-50 border-t border-white/15 bg-primary/98 backdrop-blur transition-all duration-300 ease-out md:hidden ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="shell flex flex-col items-center py-4 text-center">
          {mobileNavigation.map((item) => {
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                className={`relative w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white ${
                  isActive
                    ? ""
                    : "hover:bg-white/10 hover:text-white"
                }`}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
