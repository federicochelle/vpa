"use client";

import { FormField } from "@/components/ui/form-field";
import { parseVideoUrl } from "@/lib/youtube";

interface YouTubeVideoFieldProps {
  disabled?: boolean;
  idPrefix: string;
  label?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}

export function YouTubeVideoField({
  disabled = false,
  idPrefix,
  label = "Video YouTube / Instagram",
  onChange,
  readOnly = false,
  value,
}: YouTubeVideoFieldProps) {
  const parsedVideo = parseVideoUrl(value);
  const hasValue = value.trim().length > 0;
  const hasError = hasValue && !parsedVideo;
  const previewWrapperClassName =
    parsedVideo?.provider === "instagram"
      ? "mx-auto w-full max-w-[380px]"
      : "max-w-2xl";
  const previewAspectClassName = parsedVideo?.aspectClassName ?? "";

  return (
    <div className="space-y-4">
      <FormField htmlFor={`${idPrefix}-video-url`} label={label}>
        <input
          className="admin-input-base"
          disabled={disabled || readOnly}
          id={`${idPrefix}-video-url`}
          name="videoUrl"
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="https://www.youtube.com/watch?v=... o https://www.instagram.com/reel/..."
          type="url"
          value={value}
        />
      </FormField>

      {hasError ? (
        <p className="type-body-compact text-primary-strong">
          Ingresa una URL válida de YouTube o Instagram.
        </p>
      ) : null}

      {parsedVideo ? (
        <div className={`overflow-hidden border border-border bg-white ${previewWrapperClassName}`}>
          <div className={`${previewAspectClassName} bg-surface-muted`}>
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              src={parsedVideo.embedUrl}
              title={`Preview de ${parsedVideo.title}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
