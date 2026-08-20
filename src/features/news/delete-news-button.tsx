"use client";

import { Trash2 } from "lucide-react";

interface DeleteNewsButtonProps {
  label: string;
}

export function DeleteNewsButton({ label }: DeleteNewsButtonProps) {
  return (
    <button
      aria-label={label}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/6 text-primary-strong transition-colors hover:bg-primary/12"
      onClick={(event) => {
        if (!window.confirm("¿Eliminar esta noticia?")) {
          event.preventDefault();
        }
      }}
      title={label}
      type="submit"
    >
      <Trash2 className="h-4 w-4 stroke-[2.2]" />
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
