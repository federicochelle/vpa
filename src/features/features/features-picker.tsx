"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  normalizeFeatureName,
  normalizeFeatureNameForComparison,
} from "@/features/features/features.form";
import type { Feature } from "@/types/feature";

interface FeaturesPickerProps {
  allFeatures: Feature[];
  hiddenInputName?: string;
  initialSelectedIds?: string[];
}

export interface FeaturesPickerHandle {
  waitForPendingCreation: () => Promise<void>;
}

interface PendingFeatureCreation {
  expectedFeatureId: string | null;
  promise: Promise<void>;
  resolve: () => void;
}

export const FeaturesPicker = forwardRef<FeaturesPickerHandle, FeaturesPickerProps>(
  function FeaturesPicker(
    {
      allFeatures,
      hiddenInputName = "featureIds",
      initialSelectedIds = [],
    },
    ref,
  ) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const creationFailureRef = useRef<string | null>(null);
  const pendingCreationRef = useRef<PendingFeatureCreation | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>(allFeatures);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const selectedFeatures = useMemo(
    () =>
      selectedIds
        .map((id) => availableFeatures.find((feature) => feature.id === id))
        .filter((feature): feature is Feature => Boolean(feature)),
    [availableFeatures, selectedIds],
  );

  const normalizedQuery = normalizeFeatureNameForComparison(query);
  const matches = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return availableFeatures.filter((feature) => {
      if (selectedIds.includes(feature.id)) {
        return false;
      }

      return normalizeFeatureNameForComparison(feature.name).includes(normalizedQuery);
    });
  }, [availableFeatures, normalizedQuery, selectedIds]);
  const exactMatchExists = availableFeatures.some(
    (feature) =>
      normalizeFeatureNameForComparison(feature.name) === normalizedQuery,
  );
  const canCreate = Boolean(normalizedQuery) && !exactMatchExists;
  const createLabel = normalizeFeatureName(query);

  useImperativeHandle(ref, () => ({
    async waitForPendingCreation() {
      while (pendingCreationRef.current) {
        await pendingCreationRef.current.promise;
      }

      if (creationFailureRef.current) {
        throw new Error(creationFailureRef.current);
      }
    },
  }), []);

  useEffect(() => {
    const pendingCreation = pendingCreationRef.current;

    if (
      pendingCreation?.expectedFeatureId &&
      selectedIds.includes(pendingCreation.expectedFeatureId)
    ) {
      pendingCreationRef.current = null;
      pendingCreation.resolve();
    }
  }, [selectedIds]);

  useEffect(
    () => () => {
      const pendingCreation = pendingCreationRef.current;
      pendingCreationRef.current = null;
      pendingCreation?.resolve();
    },
    [],
  );

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

  function handleCreateFeature() {
    if (!canCreate || pendingCreationRef.current) {
      return;
    }

    const requestedName = createLabel;
    let resolvePendingCreation = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePendingCreation = resolve;
    });
    const pendingCreation: PendingFeatureCreation = {
      expectedFeatureId: null,
      promise: pendingPromise,
      resolve: resolvePendingCreation,
    };
    pendingCreationRef.current = pendingCreation;
    creationFailureRef.current = null;
    setCreating(true);
    setCreationError(null);

    void (async () => {
      try {
        const response = await fetch("/api/admin/features", {
          body: JSON.stringify({ name: requestedName }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const payload = (await response.json().catch(() => null)) as
          | { feature?: Feature; message?: string }
          | null;

        if (!response.ok || !payload?.feature) {
          throw new Error(payload?.message ?? "No se pudo crear el amenity.");
        }

        const feature = payload.feature;
        pendingCreation.expectedFeatureId = feature.id;
        setAvailableFeatures((currentFeatures) =>
          currentFeatures.some((currentFeature) => currentFeature.id === feature.id)
            ? currentFeatures
            : [...currentFeatures, feature].sort((left, right) =>
                left.name.localeCompare(right.name, "es-UY"),
              ),
        );
        setSelectedIds((currentIds) =>
          currentIds.includes(feature.id) ? [...currentIds] : [...currentIds, feature.id],
        );
        setQuery((currentQuery) =>
          normalizeFeatureNameForComparison(currentQuery) ===
          normalizeFeatureNameForComparison(requestedName)
            ? ""
            : currentQuery,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo crear el amenity.";

        if (pendingCreationRef.current === pendingCreation) {
          pendingCreationRef.current = null;
        }
        pendingCreation.resolve();
        creationFailureRef.current = message;
        setCreationError(message);
      } finally {
        setCreating(false);
      }
    })();
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="relative">
        <input
          className="admin-input-base"
          onChange={(event) => {
            setQuery(event.target.value);
            creationFailureRef.current = null;
            setCreationError(null);
          }}
          placeholder="Buscar amenities..."
          type="text"
          value={query}
        />
        {normalizedQuery ? (
          <div className="absolute top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_40px_rgba(39,39,39,0.08)]">
            {matches.length > 0 || canCreate ? (
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
                {canCreate ? (
                  <li>
                    <button
                      className="type-body-compact flex w-full items-center px-4 py-3 text-left font-medium text-primary-strong transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={creating}
                      onClick={handleCreateFeature}
                      type="button"
                    >
                      {creating ? "Creando…" : `Crear “${createLabel}”`}
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : (
              <div className="type-body-compact px-4 py-3 text-muted">No se encontraron amenities</div>
            )}
          </div>
        ) : null}
        {creationError ? (
          <p className="type-caption mt-2 text-primary-strong" role="alert">
            {creationError}
          </p>
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
  },
);
