"use client";

import { startTransition, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { setPropertyPublishedInlineAction } from "@/features/properties/properties.actions";

interface AdminPropertyPublishedToggleProps {
  isPublished: boolean;
  label: string;
  propertyId: string;
}

export function AdminPropertyPublishedToggle({
  isPublished,
  label,
  propertyId,
}: AdminPropertyPublishedToggleProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nextPublished = !isPublished;
  const title = isPublished ? `Desactivar ${label}` : `Activar ${label}`;

  return (
    <>
      <button
        aria-label={title}
        aria-pressed={isPublished}
        className={`inline-flex size-8 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70 ${
          isPublished
            ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
            : "border-border bg-surface-muted hover:border-primary/30"
        }`}
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          setIsPending(true);
          setErrorMessage(null);

          startTransition(async () => {
            try {
              await setPropertyPublishedInlineAction(propertyId, nextPublished);
              router.refresh();
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "No se pudo cambiar la publicación.",
              );
            } finally {
              setIsPending(false);
            }
          });
        }}
        title={title}
        type="button"
      >
        {isPending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-muted" />
        ) : (
          <span
            aria-hidden="true"
            className={`size-3.5 rounded-full ${
              isPublished ? "bg-emerald-500" : "bg-muted/45"
            }`}
          />
        )}
      </button>
      {errorMessage ? (
        <AdminFeedbackModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          title="No se pudo cambiar la publicación"
          variant="error"
        />
      ) : null}
    </>
  );
}
