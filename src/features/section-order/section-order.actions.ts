"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/auth";
import { setSectionOrder } from "@/features/section-order/section-order.data";
import type { HomeHeroEntityType } from "@/features/home-hero/home-hero.types";

export async function updateSectionOrderAction(
  entityType: HomeHeroEntityType,
  entityId: string,
  sectionOrder: number | null,
) {
  await requireAdminSession();

  const result = await setSectionOrder(entityType, entityId, sectionOrder);

  revalidatePath("/");
  revalidatePath("/comprar");
  revalidatePath("/alquileres");
  revalidatePath("/inversion");
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/proyectos");

  if (!result.ok) {
    throw new Error(result.error?.message ?? "No se pudo actualizar el orden de la sección.");
  }
}
