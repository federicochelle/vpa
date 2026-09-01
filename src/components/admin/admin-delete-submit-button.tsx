"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";

interface AdminDeleteSubmitButtonProps {
  confirmLabel?: string;
  confirmMessage: string;
  confirmTitle: string;
  label: string;
  loadingMessage: string;
  loadingTitle: string;
  size?: "md" | "sm";
}

export function AdminDeleteSubmitButton({
  confirmLabel = "Eliminar",
  confirmMessage,
  confirmTitle,
  label,
  loadingMessage,
  loadingTitle,
  size = "sm",
}: AdminDeleteSubmitButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { pending } = useFormStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const sizeClassName = size === "md" ? "h-11 w-11" : "h-10 w-10";

  return (
    <>
      <button
        aria-label={label}
        className={`group relative inline-flex ${sizeClassName} items-center justify-center rounded-full border border-primary/20 bg-primary/6 text-primary-strong transition-colors hover:bg-primary/12 disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={pending}
        onClick={() => {
          setConfirmOpen(true);
        }}
        ref={buttonRef}
        title={label}
        type="button"
      >
        <Trash2 className="h-4 w-4 stroke-[2.2]" />
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          {label}
        </span>
      </button>

      <AdminFeedbackModal
        cancelLabel="Cancelar"
        confirmLabel={confirmLabel}
        message={confirmMessage}
        onClose={() => {
          setConfirmOpen(false);
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          buttonRef.current?.form?.requestSubmit();
        }}
        open={confirmOpen}
        title={confirmTitle}
        variant="confirm"
      />

      <AdminFeedbackModal
        message={loadingMessage}
        open={pending}
        title={loadingTitle}
        variant="loading"
      />
    </>
  );
}
