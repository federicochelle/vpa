"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

interface MobileTopbarMenuProps {
  closeLabel: string;
  headerClassName?: string;
  lockScroll?: boolean;
  logo: ReactNode;
  openLabel: string;
  overlayClassName?: string;
  panel: ReactNode;
}

export function MobileTopbarMenu({
  closeLabel,
  headerClassName,
  lockScroll = false,
  logo,
  openLabel,
  overlayClassName,
  panel,
}: MobileTopbarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!lockScroll || !isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, lockScroll]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/15 bg-primary backdrop-blur lg:hidden ${headerClassName ?? ""}`}
    >
      <div className="shell flex h-20 items-center justify-between gap-6">
        {logo}
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? closeLabel : openLabel}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div
          aria-hidden={!isOpen}
          className={`block animate-in fade-in duration-200 lg:hidden ${overlayClassName ?? "absolute left-0 right-0 top-full z-50 border-t border-white/15 bg-primary/98 backdrop-blur"}`}
        >
          {panel}
        </div>
      ) : null}
    </header>
  );
}
