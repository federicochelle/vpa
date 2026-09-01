"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/auth";
import { setHomeHeroOrder, toggleHomeHeroItem } from "@/features/home-hero/home-hero.data";
import type { HomeHeroEntityType, HomeHeroOrder } from "@/features/home-hero/home-hero.types";

export async function updateHomeHeroOrderAction(
  entityType: HomeHeroEntityType,
  entityId: string,
  heroOrder: HomeHeroOrder,
) {
  await requireAdminSession();

  const result = await setHomeHeroOrder(entityType, entityId, heroOrder);

  revalidatePath("/");
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/proyectos");

  if (!result.ok) {
    throw new Error(result.error?.message ?? "No se pudo actualizar la posición del hero.");
  }
}

export async function toggleHomeHeroItemAction(
  entityType: HomeHeroEntityType,
  entityId: string,
) {
  await requireAdminSession();

  const result = await toggleHomeHeroItem(entityType, entityId);

  revalidatePath("/");
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/proyectos");

  if (!result.ok) {
    throw new Error(result.error?.message ?? "No se pudo actualizar el hero.");
  }
}
