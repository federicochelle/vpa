"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature } from "@/types/feature";

interface FeaturesPickerProps {
  allFeatures: Feature[];
  hiddenInputName?: string;
  initialSelectedIds?: string[];
}

export function FeaturesPicker({
  allFeatures,
  hiddenInputName = "featureIds",
  initialSelectedIds = [],
}: FeaturesPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const selectedFeatures = useMemo(
    () =>
      selectedIds
        .map((id) => allFeatures.find((feature) => feature.id === id))
        .filter((feature): feature is Feature => Boolean(feature)),
    [allFeatures, selectedIds],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return allFeatures.filter((feature) => {
      if (selectedIds.includes(feature.id)) {
        return false;
      }

      return feature.name.toLowerCase().includes(normalizedQuery);
    });
  }, [allFeatures, normalizedQuery, selectedIds]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="relative">
        <input
          className="admin-input-base"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder="Buscar amenities..."
          type="text"
          value={query}
        />
        {normalizedQuery ? (
          <div className="absolute top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_40px_rgba(39,39,39,0.08)]">
            {matches.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto py-2">
                {matches.map((feature) => (
                  <li key={feature.id}>
                    <button
                      className="type-body-compact flex w-full items-center px-4 py-3 text-left text-foreground transition-colors hover:bg-surface-muted"
                      onClick={() => {
                        setSelectedIds((current) => [...current, feature.id]);
                        setQuery("");
                      }}
                      type="button"
                    >
                      <span>{feature.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="type-body-compact px-4 py-3 text-muted">No se encontraron amenities</div>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedFeatures.map((feature) => (
          <div
            key={feature.id}
            className="type-body-compact inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/8 px-3 py-2 font-medium text-primary-strong"
          >
            <span>{feature.name}</span>
            <button
              aria-label={`Quitar ${feature.name}`}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary-strong transition-colors hover:bg-primary/10"
              onClick={() => {
                setSelectedIds((current) => current.filter((id) => id !== feature.id));
              }}
              type="button"
            >
              ×
            </button>
            <input name={hiddenInputName} type="hidden" value={feature.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
