import "server-only";

import { createSupabaseServerActionClient, createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import { mapProjectImageRow } from "@/features/projects/project-mappers";
import type { ProjectImage } from "@/types/project";

type ProjectImageInsert = Database["public"]["Tables"]["project_images"]["Insert"];

export interface ProjectImageMutationInput {
  projectId: string;
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

interface ProjectImagesReadResult {
  ok: boolean;
  data: ProjectImage[];
  error: SupabaseActionError | null;
}

interface ProjectImageReadResult {
  ok: boolean;
  data: ProjectImage | null;
  error: SupabaseActionError | null;
}

interface ProjectImageWriteResult {
  ok: boolean;
  data: ProjectImage | null;
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
      message: `RLS o grants faltantes en project_images: ${error.message}`,
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

export async function listAdminProjectImages(
  projectId: string,
): Promise<ProjectImagesReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: [],
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
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
    data: data.map(mapProjectImageRow),
    error: null,
  };
}

export async function listPublishedProjectImages(
  projectId: string,
): Promise<ProjectImagesReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: [],
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
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
    data: data.map(mapProjectImageRow),
    error: null,
  };
}

export async function getAdminProjectImageById(
  projectId: string,
  imageId: string,
): Promise<ProjectImageReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
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
    data: data ? mapProjectImageRow(data) : null,
    error: null,
  };
}

export async function createProjectImage(
  input: ProjectImageMutationInput,
): Promise<ProjectImageWriteResult> {
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
      .from("project_images")
      .update({ is_cover: false })
      .eq("project_id", input.projectId)
      .eq("is_cover", true);

    if (coverResetError) {
      return {
        ok: false,
        data: null,
        error: formatError(coverResetError),
      };
    }
  }

  const payload: ProjectImageInsert = {
    project_id: input.projectId,
    url: input.url,
    public_id: input.publicId,
    sort_order: input.sortOrder,
    is_cover: input.isCover,
    alt_text: input.altText ?? null,
  };

  const { data, error } = await supabase
    .from("project_images")
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
    data: data ? mapProjectImageRow(data) : null,
    error: null,
  };
}

export async function deleteProjectImageRecord(
  projectId: string,
  imageId: string,
): Promise<{ ok: boolean; deleted: ProjectImage | null; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      deleted: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const imageResult = await getAdminProjectImageById(projectId, imageId);

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
    .from("project_images")
    .delete()
    .eq("project_id", projectId)
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

export async function assignProjectCoverFromRemainingImages(projectId: string) {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      nextCoverImageId: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", projectId)
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
    .from("project_images")
    .update({ is_cover: true })
    .eq("project_id", projectId)
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

export async function setProjectCoverImage(
  projectId: string,
  imageId: string,
): Promise<{ ok: boolean; coverImage: ProjectImage | null; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      coverImage: null,
      error: getMissingSupabaseEnvError(),
    };
  }

  const imageResult = await getAdminProjectImageById(projectId, imageId);

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
    .from("project_images")
    .update({ is_cover: false })
    .eq("project_id", projectId)
    .eq("is_cover", true);

  if (resetError) {
    return {
      ok: false,
      coverImage: null,
      error: formatError(resetError),
    };
  }

  const { data, error } = await supabase
    .from("project_images")
    .update({ is_cover: true })
    .eq("project_id", projectId)
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
    coverImage: data ? mapProjectImageRow(data) : null,
    error: null,
  };
}
