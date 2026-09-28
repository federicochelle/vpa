"use client";

import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PropertyType } from "@/types/property";
import { usePublicLocale } from "@/i18n/public/locale-provider";

const searchOperationOptions = [
  { value: "sale", labelKey: "search.buy" },
  { value: "rent", labelKey: "search.rent" },
  { value: "investment", labelKey: "search.investment" },
] as const;

interface SearchLocationOption {
  label: string;
  neighborhood: string | null;
  operations: Array<(typeof searchOperationOptions)[number]["value"]>;
}

interface SearchPropertyTypeOption {
  label: string;
  operations: Array<"sale" | "rent">;
  value: PropertyType;
}

interface SearchSectionProps {
  locationOptions: SearchLocationOption[];
  propertyTypeOptions: SearchPropertyTypeOption[];
}

function normalizeLocation(value: string) {
  return value.trim().toLocaleLowerCase("es-UY");
}

function getCommonPrefixLength(a: string, b: string) {
  const maxLength = Math.min(a.length, b.length);
  let index = 0;

  while (index < maxLength && a[index] === b[index]) {
    index += 1;
  }

  return index;
}

function LocationCombobox({
  options,
  operation,
  selectedOption,
  onSelect,
  onSuggestionSelect,
}: {
  options: SearchLocationOption[];
  operation: (typeof searchOperationOptions)[number]["value"];
  selectedOption: SearchLocationOption | null;
  onSelect: (option: SearchLocationOption | null) => void;
  onSuggestionSelect: (option: SearchLocationOption) => void;
}) {
  const { t } = usePublicLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeLocation(query);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      normalizeLocation(option.label).includes(normalizedQuery),
    );
  }, [options, query]);

  const hasExactMatch = useMemo(() => {
    const normalizedQuery = normalizeLocation(query);

    if (!normalizedQuery) {
      return false;
    }

    return options.some((option) => normalizeLocation(option.label) === normalizedQuery);
  }, [options, query]);

  const suggestedOptions = useMemo(() => {
    const normalizedQuery = normalizeLocation(query);

    if (!normalizedQuery || filteredOptions.length > 0 || hasExactMatch) {
      return [];
    }

    return [...options]
      .sort((left, right) => {
        const leftOperationScore = left.operations.includes(operation) ? 1 : 0;
        const rightOperationScore = right.operations.includes(operation) ? 1 : 0;

        if (leftOperationScore !== rightOperationScore) {
          return rightOperationScore - leftOperationScore;
        }

        const leftPrefixScore = Math.max(
          getCommonPrefixLength(normalizedQuery, normalizeLocation(left.label)),
          getCommonPrefixLength(normalizedQuery, normalizeLocation(left.neighborhood ?? "")),
        );
        const rightPrefixScore = Math.max(
          getCommonPrefixLength(normalizedQuery, normalizeLocation(right.label)),
          getCommonPrefixLength(normalizedQuery, normalizeLocation(right.neighborhood ?? "")),
        );

        if (leftPrefixScore !== rightPrefixScore) {
          return rightPrefixScore - leftPrefixScore;
        }

        return left.label.localeCompare(right.label, "es-UY");
      })
      .slice(0, 5);
  }, [filteredOptions.length, hasExactMatch, operation, options, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  function closeCombobox() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        className="search-field flex items-center justify-between gap-3 text-left"
        onClick={() => {
          if (isOpen) {
            closeCombobox();
            return;
          }

          setIsOpen(true);
        }}
        type="button"
      >
        <span className={selectedOption ? "truncate text-foreground" : "truncate text-muted"}>
          {selectedOption?.label ?? t("search.zone")}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-none text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-40 overflow-hidden border border-border bg-white shadow-[0_14px_40px_rgba(39,39,39,0.08)]">
          <div className="border-b border-border p-3">
            <input
              ref={inputRef}
              autoComplete="off"
              className="search-field search-zone-input"
              placeholder={t("search.zonePlaceholder")}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div
            aria-label={t("search.zone")}
            className="max-h-60 overflow-y-auto"
            id={listboxId}
            role="listbox"
          >
            {filteredOptions.map((option) => (
              <button
                key={option.label}
                aria-selected={selectedOption?.label === option.label}
                className="type-body-compact block w-full px-4 py-3 text-left text-foreground transition-colors hover:bg-surface-strong"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(option);
                  closeCombobox();
          }}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            ))}
            {filteredOptions.length === 0 && suggestedOptions.length > 0 ? (
              <div className="border-t border-border px-4 py-3">
                <p className="type-body-compact font-medium text-foreground">
                  {t("search.suggestedZones")}
                </p>
                <div className="mt-3 space-y-2">
                  {suggestedOptions.map((option) => (
                    <button
                      key={`suggested-${option.label}`}
                      className="type-body-compact block w-full text-left text-primary transition-colors hover:text-primary-strong"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(option);
                        closeCombobox();
                        onSuggestionSelect(option);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {filteredOptions.length === 0 && suggestedOptions.length === 0 ? (
              <div className="type-body-compact px-4 py-3 text-muted">
                {t("search.noZone")}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SearchSection({ locationOptions, propertyTypeOptions }: SearchSectionProps) {
  const router = useRouter();
  const { t } = usePublicLocale();
  const [operation, setOperation] = useState<(typeof searchOperationOptions)[number]["value"]>("sale");
  const [propertyType, setPropertyType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SearchLocationOption | null>(null);
  const operationLocationOptions = useMemo(
    () => locationOptions.filter((option) => option.operations.includes(operation)),
    [locationOptions, operation],
  );
  const operationPropertyTypeOptions = useMemo(
    () =>
      operation === "investment"
        ? []
        : propertyTypeOptions.filter((option) => option.operations.includes(operation)),
    [operation, propertyTypeOptions],
  );

  function handleOperationChange(nextOperation: (typeof searchOperationOptions)[number]["value"]) {
    setOperation(nextOperation);

    if (selectedLocation && !selectedLocation.operations.includes(nextOperation)) {
      setSelectedLocation(null);
    }

    if (
      propertyType &&
      (
        nextOperation === "investment" ||
        !propertyTypeOptions.some(
          (option) => option.value === propertyType && option.operations.includes(nextOperation),
        )
      )
    ) {
      setPropertyType("");
    }
  }

  function buildSearchHref(location: SearchLocationOption | null = selectedLocation) {
    const params = new URLSearchParams();
    if (operation !== "investment" && propertyType) {
      params.set("tipo", propertyType);
    }
    if (location) {
      params.set("zona", location.label);
    }

    const basePath =
      operation === "rent" ? "/alquileres" : operation === "investment" ? "/inversion" : "/comprar";
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildSearchHref());
  }

  const desktopGridClassName =
    operation === "investment"
      ? "gap-4 md:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
      : "gap-4 md:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]";

  return (
    <section className="relative z-20 -mb-64 w-full max-w-full min-w-0 -mt-24 px-4 md:mt-0 md:shell md:-mb-16 md:-mt-20 md:px-0 lg:-mt-24">
      <div className="md:hidden">
        <div className="mx-auto w-full max-w-full min-w-0 overflow-visible border border-border bg-surface shadow-[0_14px_40px_rgba(39,39,39,0.05)]">
          <div className="bg-white p-5">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {operation === "investment" ? null : (
                <label className="grid gap-2 type-body-compact font-medium text-foreground">
                  {t("search.propertyType")}
                  <select
                    className="search-field search-select"
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                    name="tipo"
                  >
                    <option value="">{t("common.all")}</option>
                    {operationPropertyTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="grid gap-2 type-body-compact font-medium text-foreground">
                {t("search.operation")}
                <select
                  className="search-field search-select"
                  value={operation}
                  onChange={(event) =>
                    handleOperationChange(event.target.value as (typeof searchOperationOptions)[number]["value"])
                  }
                  name="operacion"
                >
                  {searchOperationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2 type-body-compact font-medium text-foreground">
                <span>{t("search.zone")}</span>
                <LocationCombobox
                  options={operationLocationOptions}
                  operation={operation}
                  selectedOption={selectedLocation}
                  onSelect={setSelectedLocation}
                  onSuggestionSelect={(option) => router.push(buildSearchHref(option))}
                />
              </div>

              <button
                className="button-primary inline-flex items-center justify-center gap-2 rounded-2xl"
                type="submit"
              >
                <Search className="h-4 w-4" />
                {t("common.search")}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:mx-auto md:block md:w-full md:max-w-6xl">
        <div className="border border-border bg-surface p-6 shadow-[0_14px_40px_rgba(39,39,39,0.05)] sm:p-8">
          <form
            className={desktopGridClassName}
            onSubmit={handleSubmit}
          >
            {operation === "investment" ? null : (
              <label className="grid gap-2 type-body-compact font-medium text-foreground">
                {t("search.propertyType")}
                <select
                  className="search-field search-select"
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                  name="tipo"
                >
                  <option value="">{t("common.all")}</option>
                  {operationPropertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="grid gap-2 type-body-compact font-medium text-foreground">
              {t("search.operation")}
              <select
                className="search-field search-select"
                value={operation}
                onChange={(event) =>
                  handleOperationChange(event.target.value as (typeof searchOperationOptions)[number]["value"])
                }
                name="operacion"
              >
                {searchOperationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-2 type-body-compact font-medium text-foreground">
              <span>{t("search.zone")}</span>
              <LocationCombobox
                options={operationLocationOptions}
                operation={operation}
                selectedOption={selectedLocation}
                onSelect={setSelectedLocation}
                onSuggestionSelect={(option) => router.push(buildSearchHref(option))}
              />
            </div>

            <button
              className="button-primary inline-flex items-center justify-center gap-2 rounded-2xl xl:self-end"
              type="submit"
            >
              <Search className="h-4 w-4" />
              {t("common.search")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
