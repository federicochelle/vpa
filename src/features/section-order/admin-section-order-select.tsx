"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateSectionOrderAction } from "@/features/section-order/section-order.actions";
import type { HomeHeroEntityType } from "@/features/home-hero/home-hero.types";

const SECTION_ORDER_VALUES = Array.from({ length: 99 }, (_, index) => index + 1);

interface AdminSectionOrderSelectProps {
  entityId: string;
  entityType: HomeHeroEntityType;
  label: string;
  sectionOrder: number | null;
}

export function AdminSectionOrderSelect({
  entityId,
  entityType,
  label,
  sectionOrder,
}: AdminSectionOrderSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(sectionOrder?.toString() ?? "");
  const [isPending, setIsPending] = useState(false);

  return (
    <select
      aria-label={`Orden de sección de ${label}`}
      className="type-meta rounded-full border border-border bg-white px-3 py-2 font-semibold text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        const nextValue = event.target.value;
        setValue(nextValue);
        setIsPending(true);

        startTransition(async () => {
          try {
            await updateSectionOrderAction(
              entityType,
              entityId,
              nextValue === "" ? null : Number(nextValue),
            );
            router.refresh();
          } catch {
            setValue(sectionOrder?.toString() ?? "");
          } finally {
            setIsPending(false);
          }
        });
      }}
      value={value}
    >
      <option value="">-</option>
      {SECTION_ORDER_VALUES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
