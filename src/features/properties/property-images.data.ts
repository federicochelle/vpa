import "server-only";

import {
  createSupabaseServerActionClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import { mapPropertyImageRow } from "@/features/properties/property-mappers";
import type { PropertyImage } from "@/types/property";

type PropertyImageInsert = Database["public"]["Tables"]["property_images"]["Insert"];

export interface PropertyImageMutationInput {
  propertyId: string;
  url: string;
  publicId: string;
  sortOrder: number;
  isCover: boolean;
  altText?: string | null;
}

export interface SupabaseActionError {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}

interface PropertyImagesReadResult {
  ok: boolean;
  data: PropertyImage[];
  error: SupabaseActionError | null;
}

interface PropertyImageReadResult {
  ok: boolean;
  data: PropertyImage | null;
  error: SupabaseActionError | null;
}

interface PropertyImageWriteResult {
  ok: boolean;
  data: PropertyImage | null;
  error: SupabaseActionError | null;
}

function formatError(error: {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}): SupabaseActionError {
  const base = {
    code: error.code,
    details: error.details,
    hint: error.hint,
    message: error.message,
  };

  if (error.code === "42501") {
    return {
      ...base,
      message: `RLS o grants faltantes en property_images: ${error.message}`,
    };
  }

  return base;
}

function getMissingSupabaseEnvError(): SupabaseActionError {
  return {
    code: null,
    details: null,
    hint: null,
    message:
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  };
}

export async function listAdminPropertyImages(
  propertyId: string,
): Promise<PropertyImagesReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: [],
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data.map(mapPropertyImageRow),
    error: null,
  };
}

export async function listPublishedPropertyImages(
  propertyId: string,
): Promise<PropertyImagesReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: [],
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data.map(mapPropertyImageRow),
    error: null,
  };
}

export async function getAdminPropertyImageById(
  propertyId: string,
  imageId: string,
): Promise<PropertyImageReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .eq("id", imageId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data ? mapPropertyImageRow(data) : null,
    error: null,
  };
}

export async function createPropertyImage(
  input: PropertyImageMutationInput,
): Promise<PropertyImageWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();

  if (input.isCover) {
    const { error: coverResetError } = await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", input.propertyId)
      .eq("is_cover", true);

    if (coverResetError) {
      return {
        ok: false,
        data: null,
        error: formatError(coverResetError),
      };
    }
  }

  const payload: PropertyImageInsert = {
    property_id: input.propertyId,
    url: input.url,
    public_id: input.publicId,
    sort_order: input.sortOrder,
    is_cover: input.isCover,
    alt_text: input.altText ?? null,
  };

  const { data, error } = await supabase
    .from("property_images")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data ? mapPropertyImageRow(data) : null,
    error: null,
  };
}

export async function deletePropertyImageRecord(
  propertyId: string,
  imageId: string,
): Promise<{ ok: boolean; deleted: PropertyImage | null; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      deleted: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const imageResult = await getAdminPropertyImageById(propertyId, imageId);

  if (!imageResult.ok) {
    return {
      ok: false,
      deleted: null,
      error: imageResult.error,
    };
  }

  if (!imageResult.data) {
    return {
      ok: true,
      deleted: null,
      error: null,
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("property_id", propertyId)
    .eq("id", imageId);

  if (error) {
    return {
      ok: false,
      deleted: null,
      error: formatError(error),
    };
  }

  return {
    ok: true,
    deleted: imageResult.data,
    error: null,
  };
}

export async function assignPropertyCoverFromRemainingImages(propertyId: string) {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      nextCoverImageId: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("property_images")
    .select("id")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      nextCoverImageId: null,
      error: formatError(error),
    };
  }

  if (!data) {
    return {
      ok: true,
      nextCoverImageId: null,
      error: null,
    };
  }

  const { error: updateError } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("property_id", propertyId)
    .eq("id", data.id);

  if (updateError) {
    return {
      ok: false,
      nextCoverImageId: null,
      error: formatError(updateError),
    };
  }

  return {
    ok: true,
    nextCoverImageId: data.id,
    error: null,
  };
}

export async function setPropertyCoverImage(
  propertyId: string,
  imageId: string,
): Promise<{ ok: boolean; coverImage: PropertyImage | null; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      coverImage: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const imageResult = await getAdminPropertyImageById(propertyId, imageId);

  if (!imageResult.ok) {
    return {
      ok: false,
      coverImage: null,
      error: imageResult.error,
    };
  }

  if (!imageResult.data) {
    return {
      ok: false,
      coverImage: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "Imagen no encontrada.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { error: resetError } = await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId)
    .eq("is_cover", true);

  if (resetError) {
    return {
      ok: false,
      coverImage: null,
      error: formatError(resetError),
    };
  }

  const { data, error } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("property_id", propertyId)
    .eq("id", imageId)
    .select("*")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      coverImage: null,
      error: formatError(error),
    };
  }

  return {
    ok: true,
    coverImage: data ? mapPropertyImageRow(data) : null,
    error: null,
  };
}
