import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  createSupabaseServerActionClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Feature } from "@/types/feature";
import type { ValidFeatureName } from "@/features/features/features.form";
import {
  buildCreatePublicContentTranslationFields,
} from "@/lib/translation/public-content";
import { translatePublicContent } from "@/lib/translation/public-content.server";

export interface FeaturesReadResult {
  ok: boolean;
  data: Feature[];
  error: {
    code: string | null;
    details: string | null;
    hint: string | null;
    message: string;
  } | null;
}

export interface FeatureWriteResult {
  ok: boolean;
  data: Feature | null;
  created: boolean;
  error: FeaturesReadResult["error"];
}

function mapFeatureRow(
  row: Pick<
    Database["public"]["Tables"]["features"]["Row"],
    "id" | "name" | "name_de" | "name_en" | "slug" | "category"
  >,
): Feature {
  return {
    id: row.id,
    name: row.name,
    nameDe: row.name_de,
    nameEn: row.name_en,
    slug: row.slug,
    category: row.category,
  };
}

function formatError(error: {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}) {
  return {
    code: error.code,
    details: error.details,
    hint: error.hint,
    message: error.message,
  };
}

export async function listAllFeatures(): Promise<FeaturesReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: [],
      error: {
        code: null,
        details: null,
        hint: null,
        message:
          "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("features")
    .select("id, name, name_en, name_de, slug, category")
    .order("name", { ascending: true });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data.map(mapFeatureRow),
    error: null,
  };
}

export async function createOrGetFeature(
  input: ValidFeatureName,
): Promise<FeatureWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      created: false,
      error: {
        code: null,
        details: null,
        hint: null,
        message:
          "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const translations = await buildCreatePublicContentTranslationFields(
    { description: null, title: input.name },
    translatePublicContent,
    "feature",
  );
  const { data, error } = await supabase
    .from("features")
    .insert({
      category: null,
      name: input.name,
      name_de: translations.titleDe,
      name_en: translations.titleEn,
      slug: input.slug,
    })
    .select("id, name, name_en, name_de, slug, category")
    .maybeSingle();

  if (!error && data) {
    return {
      ok: true,
      data: mapFeatureRow(data),
      created: true,
      error: null,
    };
  }

  if (error?.code !== "23505") {
    return {
      ok: false,
      data: null,
      created: false,
      error: error
        ? formatError(error)
        : {
            code: null,
            details: null,
            hint: null,
            message: "No se pudo crear el amenity.",
          },
    };
  }

  const { data: existingFeature, error: existingFeatureError } = await supabase
    .from("features")
    .select("id, name, name_en, name_de, slug, category")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existingFeatureError || !existingFeature) {
    return {
      ok: false,
      data: null,
      created: false,
      error: existingFeatureError
        ? formatError(existingFeatureError)
        : {
            code: null,
            details: null,
            hint: null,
            message: "El amenity ya existe, pero no se pudo recuperar.",
          },
    };
  }

  return {
    ok: true,
    data: mapFeatureRow(existingFeature),
    created: false,
    error: null,
  };
}
