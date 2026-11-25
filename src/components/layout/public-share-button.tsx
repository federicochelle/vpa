"use client";

import { Share } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FLOATING_BUTTON_CLASS,
  FLOATING_ICON_CLASS,
} from "@/components/layout/floating-button-styles";
import { usePublicLocale } from "@/i18n/public/locale-provider";

const FEEDBACK_DELAY = 2000;
const DESKTOP_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const BUBBLE_CLASS =
  "pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap border border-white/30 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-lg";

const TOOLTIP_VISIBILITY_CLASS =
  "hidden [@media(hover:hover)_and_(pointer:fine)]:peer-hover:block [@media(hover:hover)_and_(pointer:fine)]:peer-focus-visible:block";

interface Feedback {
  messageKey: "social.linkCopied" | "social.linkCopyError";
}

function copyWithHiddenInput(value: string) {
  const previousFocus = document.activeElement;
  const input = document.createElement("input");

  input.value = value;
  input.readOnly = true;
  input.style.position = "fixed";
  input.style.top = "0";
  input.style.left = "0";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    input.remove();

    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus({ preventScroll: true });
    }
  }
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return copyWithHiddenInput(value);
  }
}

export function PublicShareButton() {
  const { t } = usePublicLocale();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), FEEDBACK_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const handleClick = async () => {
    // Read on click, so nothing touches `window` during render.
    const url = window.location.href;
    // Some desktop browsers support navigator.share, so the pointer type decides.
    const isDesktop = window.matchMedia(DESKTOP_POINTER_QUERY).matches;

    if (!isDesktop && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, text: t("social.shareText"), url });
        return;
      } catch (error) {
        // The user dismissed the native share sheet.
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    const copied = await copyToClipboard(url);
    setFeedback({ messageKey: copied ? "social.linkCopied" : "social.linkCopyError" });
  };

  return (
    <div className="relative flex">
      <button
        aria-label={t("social.share")}
        className={`peer ${FLOATING_BUTTON_CLASS} cursor-pointer`}
        onClick={handleClick}
        type="button"
      >
        <Share aria-hidden="true" className={FLOATING_ICON_CLASS} />
      </button>

      {feedback ? null : (
        <span aria-hidden="true" className={`${BUBBLE_CLASS} ${TOOLTIP_VISIBILITY_CLASS}`}>
          {t("social.copyLink")}
        </span>
      )}

      {/* Always mounted so screen readers announce the text when it appears. */}
      <span aria-live="polite" role="status">
        {feedback ? <span className={BUBBLE_CLASS}>{t(feedback.messageKey)}</span> : null}
      </span>
    </div>
  );
}
