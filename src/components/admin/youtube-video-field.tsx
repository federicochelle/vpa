"use client";

import { FormField } from "@/components/ui/form-field";
import { parseYouTubeUrl } from "@/lib/youtube";

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
  label = "Video de YouTube",
  onChange,
  readOnly = false,
  value,
}: YouTubeVideoFieldProps) {
  const parsedVideo = parseYouTubeUrl(value);
  const hasValue = value.trim().length > 0;
  const hasError = hasValue && !parsedVideo;

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
          placeholder="https://www.youtube.com/watch?v=..."
          type="url"
          value={value}
        />
      </FormField>

      {hasError ? (
        <p className="type-body-compact text-primary-strong">
          Ingresa una URL válida de YouTube.
        </p>
      ) : null}

      {parsedVideo ? (
        <div className="overflow-hidden border border-border bg-white">
          <div className="aspect-video bg-surface-muted">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              src={parsedVideo.embedUrl}
              title="Preview de video de YouTube"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
