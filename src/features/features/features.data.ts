import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Feature } from "@/types/feature";

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

function mapFeatureRow(
  row: Pick<
    Database["public"]["Tables"]["features"]["Row"],
    "id" | "name" | "slug" | "category"
  >,
): Feature {
  return {
    id: row.id,
    name: row.name,
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
    .select("id, name, slug, category")
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
