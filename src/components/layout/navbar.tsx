"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logoVpa from "../../../logovpa.webp";
import { publicNavigation } from "@/lib/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeIndicator, setActiveIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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
  }, [pathname]);

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
      {isOpen ? (
        <div className="border-t border-white/15 bg-primary md:hidden">
          <nav className="shell flex flex-col py-4">
            {publicNavigation.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  className={`relative rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white ${
                    isActive
                      ? "bg-white/16 after:absolute after:bottom-2 after:left-4 after:right-4 after:h-0.5 after:bg-white after:content-['']"
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
      ) : null}
    </header>
  );
}
