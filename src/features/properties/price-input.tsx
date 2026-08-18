"use client";

import { useState } from "react";

interface PriceInputProps {
  defaultValue?: number | null;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
}

function parsePriceInput(value: string) {
  const sanitized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");

  if (sanitized === "" || sanitized === "." || sanitized === "-") {
    return "";
  }

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? sanitized : "";
}

function formatPriceInput(value: string) {
  if (!value) {
    return "";
  }

  const [integerPart, decimalPart] = value.split(".");
  const formattedInteger = new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(Number(integerPart || "0"));

  if (typeof decimalPart === "string") {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
}

export function PriceInput({
  defaultValue,
  id = "price",
  name = "price",
  placeholder = "0",
  disabled = false,
}: PriceInputProps) {
  const normalizedDefaultValue =
    typeof defaultValue === "number" && Number.isFinite(defaultValue)
      ? String(defaultValue)
      : "";

  const [rawValue, setRawValue] = useState(normalizedDefaultValue);

  return (
    <>
      <input
        disabled={disabled}
        id={id}
        inputMode="decimal"
        onChange={(event) => {
          setRawValue(parsePriceInput(event.target.value));
        }}
        placeholder={placeholder}
        type="text"
        value={formatPriceInput(rawValue)}
        className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-foreground outline-none disabled:cursor-not-allowed"
      />
      <input name={name} type="hidden" value={rawValue} />
    </>
  );
}
