"use client";

import { startTransition, useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { toggleHomeHeroItemAction } from "@/features/home-hero/home-hero.actions";
import type { HomeHeroEntityType } from "@/features/home-hero/home-hero.types";

interface AdminHeroToggleProps {
  entityId: string;
  entityType: HomeHeroEntityType;
  isInHero: boolean;
  isPublished: boolean;
  label: string;
}

export function AdminHeroToggle({
  entityId,
  entityType,
  isInHero,
  isPublished,
  label,
}: AdminHeroToggleProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const disabled = isPending || (!isPublished && !isInHero);
  const title = errorMessage ?? (
    isInHero
      ? `Quitar ${label} del hero`
      : isPublished
        ? `Agregar ${label} al hero`
        : "Solo los elementos publicados pueden aparecer en el hero"
  );

  return (
    <>
      <button
        aria-label={title}
        aria-pressed={isInHero}
        className={`inline-flex size-10 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40 ${
          isInHero
            ? "text-primary hover:text-primary-strong"
            : "text-muted hover:text-primary"
        }`}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          setIsPending(true);
          setErrorMessage(null);

          startTransition(async () => {
            try {
              await toggleHomeHeroItemAction(entityType, entityId);
              router.refresh();
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : "No se pudo actualizar el hero.",
              );
            } finally {
              setIsPending(false);
            }
          });
        }}
        title={title}
        type="button"
      >
        <Star aria-hidden="true" className="size-5" fill={isInHero ? "currentColor" : "none"} />
      </button>
      {errorMessage ? (
        <AdminFeedbackModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          title="No se pudo actualizar el hero"
          variant="error"
        />
      ) : null}
    </>
  );
}
