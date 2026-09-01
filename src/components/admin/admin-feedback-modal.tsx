"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { AlertTriangle, Check, LoaderCircle, Trash2 } from "lucide-react";

type AdminFeedbackVariant = "confirm" | "error" | "loading" | "success";

interface AdminFeedbackModalProps {
  autoCloseMs?: number;
  cancelLabel?: string;
  confirmLabel?: string;
  defaultOpen?: boolean;
  message: string;
  onClose?: () => void;
  onConfirm?: () => void;
  open?: boolean;
  title: string;
  variant: AdminFeedbackVariant;
}

interface ScrollLockSnapshot {
  body: Pick<
    CSSStyleDeclaration,
    "left" | "overflow" | "overscrollBehavior" | "paddingRight" | "position" | "right" | "top" | "width"
  >;
  html: Pick<CSSStyleDeclaration, "overflow" | "overscrollBehavior">;
  scrollX: number;
  scrollY: number;
}

let scrollLockCount = 0;
let scrollLockSnapshot: ScrollLockSnapshot | null = null;

function lockDocumentScroll() {
  const html = document.documentElement;
  const body = document.body;

  if (scrollLockCount === 0) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    scrollLockSnapshot = {
      body: {
        left: body.style.left,
        overflow: body.style.overflow,
        overscrollBehavior: body.style.overscrollBehavior,
        paddingRight: body.style.paddingRight,
        position: body.style.position,
        right: body.style.right,
        top: body.style.top,
        width: body.style.width,
      },
      html: {
        overflow: html.style.overflow,
        overscrollBehavior: html.style.overscrollBehavior,
      },
      scrollX,
      scrollY,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.right = "0";
    body.style.width = "100%";
    body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  }

  scrollLockCount += 1;

  return () => {
    scrollLockCount -= 1;

    if (scrollLockCount !== 0 || !scrollLockSnapshot) {
      return;
    }

    const { body: bodyStyles, html: htmlStyles, scrollX, scrollY } = scrollLockSnapshot;

    html.style.overflow = htmlStyles.overflow;
    html.style.overscrollBehavior = htmlStyles.overscrollBehavior;
    body.style.left = bodyStyles.left;
    body.style.overflow = bodyStyles.overflow;
    body.style.overscrollBehavior = bodyStyles.overscrollBehavior;
    body.style.paddingRight = bodyStyles.paddingRight;
    body.style.position = bodyStyles.position;
    body.style.right = bodyStyles.right;
    body.style.top = bodyStyles.top;
    body.style.width = bodyStyles.width;
    window.scrollTo(scrollX, scrollY);
    scrollLockSnapshot = null;
  };
}

function resolveIcon(variant: AdminFeedbackVariant) {
  if (variant === "loading") {
    return <LoaderCircle className="h-7 w-7 animate-spin" />;
  }

  if (variant === "success") {
    return <Check className="h-7 w-7" />;
  }

  if (variant === "confirm") {
    return <Trash2 className="h-7 w-7" />;
  }

  return <AlertTriangle className="h-7 w-7" />;
}

function resolveIconClassName(variant: AdminFeedbackVariant) {
  if (variant === "success") {
    return "bg-primary text-white";
  }

  if (variant === "loading") {
    return "bg-primary/10 text-primary";
  }

  if (variant === "confirm") {
    return "bg-primary/10 text-primary-strong";
  }

  return "bg-primary/10 text-primary-strong";
}

export function AdminFeedbackModal({
  autoCloseMs,
  cancelLabel = "Cancelar",
  confirmLabel = "Continuar",
  defaultOpen = true,
  message,
  onClose,
  onConfirm,
  open,
  title,
  variant,
}: AdminFeedbackModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    return lockDocumentScroll();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !autoCloseMs || variant !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!isControlled) {
        setInternalOpen(false);
      }
      onClose?.();
    }, autoCloseMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [autoCloseMs, isControlled, isOpen, onClose, variant]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (!isControlled) {
      setInternalOpen(false);
    }
    onClose?.();
  }

  let actions: ReactNode;

  if (variant === "loading") {
    actions = null;
  } else if (variant === "confirm") {
    actions = (
      <div className="mt-6 flex gap-3">
        <button
          className="admin-button-secondary flex-1 justify-center"
          onClick={handleClose}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className="admin-button-primary flex-1 justify-center"
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    );
  } else {
    actions = (
      <button
        className="mt-6 admin-button-primary w-full justify-center"
        onClick={handleClose}
        type="button"
      >
        {variant === "success" ? "Continuar" : "Entendido"}
      </button>
    );
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center overscroll-none bg-black/30 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-[28px] border border-border bg-white p-6 text-center shadow-[0_24px_60px_rgba(39,39,39,0.18)]">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${resolveIconClassName(variant)}`}
        >
          {resolveIcon(variant)}
        </div>
        <h2 className="mt-4 font-display text-2xl text-foreground">{title}</h2>
        <p className="type-body-compact mt-2 text-muted">{message}</p>
        {actions}
      </div>
    </div>
  );
}
