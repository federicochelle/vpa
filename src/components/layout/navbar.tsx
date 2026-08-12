"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { publicNavigation } from "@/lib/navigation";
import { siteName } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Link className="font-display text-xl tracking-[0.08em] text-foreground" href="/">
          {siteName}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {publicNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-primary-strong"
                    : "text-muted hover:text-primary-strong"
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {isOpen ? (
        <div className="border-t border-border bg-white md:hidden">
          <nav className="shell flex flex-col py-4">
            {publicNavigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-surface-strong hover:text-primary-strong"
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
