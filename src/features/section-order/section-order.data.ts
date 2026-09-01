import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";
import type { HomeHeroEntityType } from "@/features/home-hero/home-hero.types";

interface SupabaseActionError {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}

function formatError(error: SupabaseActionError): SupabaseActionError {
  return {
    code: error.code,
    details: error.details,
    hint: error.hint,
    message: error.message,
  };
}

export async function setSectionOrder(
  entityType: HomeHeroEntityType,
  entityId: string,
  sectionOrder: number | null,
): Promise<{ ok: boolean; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "Faltan las variables de entorno de Supabase.",
      },
    };
  }

  if (
    sectionOrder !== null &&
    (!Number.isInteger(sectionOrder) || sectionOrder < 1 || sectionOrder > 99)
  ) {
    return {
      ok: false,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "El orden debe estar entre 1 y 99.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { error } = await supabase.rpc("set_section_order", {
    p_entity_id: entityId,
    p_entity_type: entityType,
    p_section_order: sectionOrder,
  });

  return error ? { ok: false, error: formatError(error) } : { ok: true, error: null };
}
