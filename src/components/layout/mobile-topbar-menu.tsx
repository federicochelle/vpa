"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

interface MobileTopbarMenuProps {
  closeOnPanelInteract?: boolean;
  closeLabel: string;
  headerActions?: ReactNode;
  headerClassName?: string;
  lockScroll?: boolean;
  logo: ReactNode;
  openLabel: string;
  overlayClassName?: string;
  panel: ReactNode;
}

export function MobileTopbarMenu({
  closeOnPanelInteract = false,
  closeLabel,
  headerActions,
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
    <>
      <header
        className={`sticky top-0 z-40 border-b border-white/15 bg-primary backdrop-blur lg:hidden ${headerClassName ?? ""}`}
      >
        <div className="shell flex h-20 items-center justify-between gap-6">
          {logo}
          <div className="flex items-center gap-2">
            {headerActions}
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
        </div>
      </header>

      <div
        aria-hidden={!isOpen}
        className={`block transition-[opacity,transform] duration-200 ease-out lg:hidden ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        } ${overlayClassName ?? "fixed inset-x-0 top-20 z-50 border-t border-white/15 bg-primary/98 backdrop-blur"}`}
        onClick={() => {
          setIsOpen(false);
        }}
      >
        <div
          onClickCapture={(event) => {
            if (!closeOnPanelInteract) {
              return;
            }

            const target = event.target;
            if (!(target instanceof HTMLElement)) {
              return;
            }

            if (target.closest("a, button")) {
              setIsOpen(false);
            }
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {panel}
        </div>
      </div>
    </>
  );
}
