"use client";

import { useEffect, useState } from "react";

interface SuccessModalProps {
  title?: string;
  message: string;
}

export function SuccessModal({
  title = "Propiedad creada",
  message,
}: SuccessModalProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOpen(false);
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-[28px] border border-border bg-white p-6 text-center shadow-[0_24px_60px_rgba(39,39,39,0.18)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white">
          ✓
        </div>
        <h2 className="mt-4 font-display text-2xl text-foreground">{title}</h2>
        <p className="type-body-compact mt-2 text-muted">{message}</p>
        <button
          className="mt-6 button-primary w-full"
          onClick={() => {
            setOpen(false);
          }}
          type="button"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
