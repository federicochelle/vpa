"use client";

import { LoaderCircle, Star, Trash2 } from "lucide-react";

interface ImageCardActionsProps {
  coverEligible?: boolean;
  deleteLabel: string;
  deleting?: boolean;
  disabled?: boolean;
  isCover?: boolean;
  onDelete: () => void;
  onSetCover?: () => void;
  updatingCover?: boolean;
}

const actionClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-sm transition hover:border-primary/30 hover:bg-white hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function ImageCardActions({
  coverEligible = true,
  deleteLabel,
  deleting = false,
  disabled = false,
  isCover = false,
  onDelete,
  onSetCover,
  updatingCover = false,
}: ImageCardActionsProps) {
  const controlsDisabled = disabled || deleting || updatingCover;

  return (
    <div className="absolute right-3 top-3 z-10 flex items-start gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
      {coverEligible && onSetCover ? (
        <button
          aria-label={isCover ? "Imagen de portada" : "Marcar como portada"}
          aria-pressed={isCover}
          className={`${actionClassName} ${
            isCover
              ? "border-primary bg-primary text-white hover:border-primary-strong hover:bg-primary-strong hover:text-white"
              : ""
          }`}
          disabled={controlsDisabled}
          onClick={onSetCover}
          title={isCover ? "Imagen de portada" : "Marcar como portada"}
          type="button"
        >
          {updatingCover ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Star className={`h-4 w-4 ${isCover ? "fill-current" : ""}`} />
          )}
        </button>
      ) : null}
      <button
        aria-label={deleteLabel}
        className={actionClassName}
        disabled={controlsDisabled}
        onClick={onDelete}
        type="button"
      >
        {deleting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
