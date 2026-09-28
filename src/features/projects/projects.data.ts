import "server-only";

import {
  createSupabaseServerActionClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import {
  canDeactivateProjectAdvisor,
  mapProjectAdvisorRow,
} from "@/features/projects/project-advisors";
import {
  buildProjectAdvisorInsertPayload,
  buildProjectAdvisorUpdatePayload,
} from "@/features/projects/project-advisor-mutation-payloads";
import { getHomeHeroOrderMap } from "@/features/home-hero/home-hero.data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import { mapProjectRow } from "@/features/projects/project-mappers";
import { buildProjectUpdatePayload } from "@/features/projects/project-mutation-payloads";
import {
  buildCreatePublicContentTranslationFields,
  buildUpdatePublicContentTranslationFields,
} from "@/lib/translation/public-content";
import { translatePublicContent } from "@/lib/translation/public-content.server";
import type { ConstructionStatus, Project, ProjectAdvisor } from "@/types/project";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
type ProjectFeatureInsert = Database["public"]["Tables"]["project_features"]["Insert"];
type ProjectCoverImageRow = Pick<
  Database["public"]["Tables"]["project_images"]["Row"],
  "id" | "project_id" | "url" | "is_cover" | "sort_order" | "created_at"
>;

export interface SupabaseActionError {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}

export interface ProjectMutationInput {
  advisorId: string | null;
  name: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  developerName: string | null;
  constructionStatus: ConstructionStatus;
  estimatedDeliveryDate: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  department: string | null;
  latitude: number | null;
  longitude: number | null;
  published: boolean;
  featured: boolean;
  isInvestmentOpportunity: boolean;
}

export interface ProjectAdvisorMutationInput {
  name: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  photoUrl: string | null;
  active: boolean;
  isDefault: boolean;
}

interface ProjectsReadResult {
  ok: boolean;
  data: Project[];
  error: SupabaseActionError | null;
}

interface ProjectReadResult {
  ok: boolean;
  data: Project | null;
  error: SupabaseActionError | null;
}

interface ProjectWriteResult {
  ok: boolean;
  data: Project | null;
  error: SupabaseActionError | null;
}

interface ProjectAdvisorsReadResult {
  ok: boolean;
  data: ProjectAdvisor[];
  error: SupabaseActionError | null;
}

interface ProjectAdvisorReadResult {
  ok: boolean;
  data: ProjectAdvisor | null;
  error: SupabaseActionError | null;
}

interface ProjectAdvisorWriteResult {
  ok: boolean;
  data: ProjectAdvisor | null;
  error: SupabaseActionError | null;
}

export interface ProjectSitemapEntry {
  slug: string;
  updatedAt: string | null;
}

function formatError(error: {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}): SupabaseActionError {
  return {
    code: error.code,
    details: error.details,
    hint: error.hint,
    message: error.message,
  };
}

function selectProjectCoverImages(
  projects: Project[],
  imageRows: ProjectCoverImageRow[],
): Project[] {
  const coverByProjectId = new Map<string, string>();

  for (const image of imageRows) {
    if (!coverByProjectId.has(image.project_id)) {
      coverByProjectId.set(image.project_id, image.url);
    }
  }

  return projects.map((project) => ({
    ...project,
    image: coverByProjectId.get(project.id) ?? null,
  }));
}

async function attachProjectCoverImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerComponentClient>>,
  projects: Project[],
): Promise<ProjectsReadResult> {
  if (projects.length === 0) {
    return {
      ok: true,
      data: projects,
      error: null,
    };
  }

  const projectIds = projects.map((project) => project.id);
  const { data, error } = await supabase
    .from("project_images")
    .select("project_id, url, is_cover, sort_order, created_at, id")
    .in("project_id", projectIds)
    .order("project_id", { ascending: true })
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: selectProjectCoverImages(projects, data),
    error: null,
  };
}

async function getProjectAdvisorById(
  supabase: Awaited<ReturnType<typeof createSupabaseServerComponentClient>>,
  advisorId: string | null,
) {
  if (!advisorId) {
    return null;
  }

  const { data, error } = await supabase
    .from("project_advisors")
    .select("*")
    .eq("id", advisorId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching project advisor", formatError(error));
    return null;
  }

  return data ? mapProjectAdvisorRow(data) : null;
}

async function getDefaultProjectAdvisor(
  supabase: Awaited<ReturnType<typeof createSupabaseServerComponentClient>>,
) {
  const { data, error } = await supabase
    .from("project_advisors")
    .select("*")
    .eq("active", true)
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching default project advisor", formatError(error));
    return null;
  }

  return data ? mapProjectAdvisorRow(data) : null;
}

export async function resolveProjectAdvisorForEntity(
  entity: { advisor?: ProjectAdvisor | null; advisorId: string | null },
): Promise<ProjectAdvisor | null> {
  if (!hasSupabaseEnv()) {
    return entity.advisor?.active ? entity.advisor : null;
  }

  if (entity.advisor?.active) {
    return entity.advisor;
  }

  const supabase = await createSupabaseServerComponentClient();
  const assignedAdvisor = await getProjectAdvisorById(supabase, entity.advisorId);

  if (assignedAdvisor) {
    return assignedAdvisor;
  }

  return getDefaultProjectAdvisor(supabase);
}

export async function resolveProjectAdvisorForProject(
  project: Pick<Project, "advisor" | "advisorId">,
): Promise<ProjectAdvisor | null> {
  return resolveProjectAdvisorForEntity(project);
}

export async function listActiveProjectAdvisors(): Promise<ProjectAdvisorsReadResult> {
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
    .from("project_advisors")
    .select("*")
    .eq("active", true)
    .order("is_default", { ascending: false })
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
    data: data.map(mapProjectAdvisorRow),
    error: null,
  };
}

export async function listAdminProjectAdvisors(): Promise<ProjectAdvisorsReadResult> {
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
    .from("project_advisors")
    .select("*")
    .order("is_default", { ascending: false })
    .order("active", { ascending: false })
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
    data: data.map(mapProjectAdvisorRow),
    error: null,
  };
}

export async function getAdminProjectAdvisorById(
  id: string,
): Promise<ProjectAdvisorReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
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
    .from("project_advisors")
    .select("*")
    .eq("id", id)
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
    data: data ? mapProjectAdvisorRow(data) : null,
    error: null,
  };
}

async function readPublishedProjects(options?: {
  investmentOnly?: boolean;
}): Promise<ProjectsReadResult> {
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
  let query = supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("section_order", { ascending: true, nullsFirst: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.investmentOnly) {
    query = query.eq("is_investment_opportunity", true);
  }

  const { data, error } = await query;

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return attachProjectCoverImages(supabase, data.map((project) => mapProjectRow(project)));
}

export async function listPublishedProjects(options?: {
  investmentOnly?: boolean;
}): Promise<Project[]> {
  const result = await readPublishedProjects(options);

  if (!result.ok) {
    console.error("Error listing published projects", result.error);
    return [];
  }

  return result.data;
}

export async function listPublishedProjectSitemapEntries(): Promise<ProjectSitemapEntry[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error listing published project sitemap entries", formatError(error));
    return [];
  }

  return data.map((project) => ({
    slug: project.slug,
    updatedAt: project.updated_at,
  }));
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<Project | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching published project by slug", formatError(error));
    return null;
  }

  const advisor = await getProjectAdvisorById(supabase, data?.advisor_id ?? null);

  return data ? mapProjectRow(data, advisor) : null;
}

export async function getPublishedProjectById(id: string): Promise<Project | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching published project by id", formatError(error));
    return null;
  }

  if (!data) {
    return null;
  }

  const result = await attachProjectCoverImages(supabase, [mapProjectRow(data)]);

  if (!result.ok) {
    console.error("Error fetching published project cover by id", result.error);
    return null;
  }

  return result.data[0] ?? null;
}

async function resolveUniqueProjectSlug(
  slug: string,
  options?: { excludeId?: string },
) {
  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug")
    .ilike("slug", `${slug}%`);

  if (error) {
    throw error;
  }

  const takenSlugs = new Set(
    data.filter((row) => row.id !== options?.excludeId).map((row) => row.slug),
  );

  if (!takenSlugs.has(slug)) {
    return slug;
  }

  let suffix = 2;

  while (takenSlugs.has(`${slug}-${suffix}`)) {
    suffix += 1;
  }

  return `${slug}-${suffix}`;
}

export async function listAdminProjects(): Promise<ProjectsReadResult> {
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
    .from("projects")
    .select("*")
    .order("section_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  const heroOrderMap = await getHomeHeroOrderMap();
  const mappedProjects = data.map((project) => ({
    ...mapProjectRow(project),
    heroOrder: heroOrderMap.get(`project:${project.id}`) ?? null,
  }));

  return {
    ok: true,
    data: mappedProjects,
    error: null,
  };
}

export async function getAdminProjectById(id: string): Promise<ProjectReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
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
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error),
    };
  }

  const advisor = await getProjectAdvisorById(supabase, data?.advisor_id ?? null);

  return {
    ok: true,
    data: data ? mapProjectRow(data, advisor) : null,
    error: null,
  };
}

export async function getProjectFeatureIds(projectId: string): Promise<string[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("project_features")
    .select("feature_id")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching project features", {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });
    return [];
  }

  return data.map((row) => row.feature_id);
}

async function syncProjectFeatures(projectId: string, featureIds: string[]) {
  const supabase = await createSupabaseServerActionClient();
  const { error: deleteError } = await supabase
    .from("project_features")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    throw deleteError;
  }

  const uniqueFeatureIds = Array.from(new Set(featureIds));

  if (uniqueFeatureIds.length === 0) {
    return;
  }

  const payload: ProjectFeatureInsert[] = uniqueFeatureIds.map((featureId) => ({
    project_id: projectId,
    feature_id: featureId,
  }));

  const { error: insertError } = await supabase
    .from("project_features")
    .insert(payload);

  if (insertError) {
    throw insertError;
  }
}

async function setProjectAdvisorDefault(
  supabase: Awaited<ReturnType<typeof createSupabaseServerActionClient>>,
  advisorId: string,
) {
  const { error: clearError } = await supabase
    .from("project_advisors")
    .update({ is_default: false })
    .neq("id", advisorId);

  if (clearError) {
    throw clearError;
  }

  const { error: setError } = await supabase
    .from("project_advisors")
    .update({ active: true, is_default: true })
    .eq("id", advisorId);

  if (setError) {
    throw setError;
  }
}

export async function createProjectAdvisor(
  input: ProjectAdvisorMutationInput,
): Promise<ProjectAdvisorWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message:
          "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
    };
  }

  if (input.isDefault && !input.active) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "El asesor por defecto debe estar activo.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("project_advisors")
    .insert(buildProjectAdvisorInsertPayload(input))
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      data: null,
      error: error
        ? formatError(error)
        : {
            code: null,
            details: null,
            hint: null,
            message: "No se pudo crear el asesor.",
          },
    };
  }

  if (input.isDefault) {
    try {
      await setProjectAdvisorDefault(supabase, data.id);
    } catch (defaultError) {
      return {
        ok: false,
        data: null,
        error: formatError(defaultError as SupabaseActionError),
      };
    }
  }

  const result = await getAdminProjectAdvisorById(data.id);

  return {
    ok: result.ok,
    data: result.data,
    error: result.error,
  };
}

export async function updateProjectAdvisor(
  id: string,
  input: ProjectAdvisorMutationInput,
): Promise<ProjectAdvisorWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message:
          "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
    };
  }

  const existingResult = await getAdminProjectAdvisorById(id);

  if (!existingResult.ok) {
    return {
      ok: false,
      data: null,
      error: existingResult.error,
    };
  }

  if (!existingResult.data) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "No se encontró el asesor.",
      },
    };
  }

  if (input.isDefault && !input.active) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "El asesor por defecto debe estar activo.",
      },
    };
  }

  if (existingResult.data.isDefault && !input.isDefault) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "Elegí otro asesor por defecto antes de quitar este.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("project_advisors")
    .update(buildProjectAdvisorUpdatePayload(input, { isDefault: existingResult.data.isDefault }))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      data: null,
      error: error
        ? formatError(error)
        : {
            code: null,
            details: null,
            hint: null,
            message: "No se pudo actualizar el asesor.",
          },
    };
  }

  if (input.isDefault && !existingResult.data.isDefault) {
    try {
      await setProjectAdvisorDefault(supabase, id);
    } catch (defaultError) {
      return {
        ok: false,
        data: null,
        error: formatError(defaultError as SupabaseActionError),
      };
    }
  }

  const result = await getAdminProjectAdvisorById(id);

  return {
    ok: result.ok,
    data: result.data,
    error: result.error,
  };
}

export async function setProjectAdvisorActive(
  id: string,
  active: boolean,
): Promise<ProjectAdvisorWriteResult> {
  const existingResult = await getAdminProjectAdvisorById(id);

  if (!existingResult.ok || !existingResult.data) {
    return {
      ok: false,
      data: null,
      error:
        existingResult.error ?? {
          code: null,
          details: null,
          hint: null,
          message: "No se encontró el asesor.",
        },
    };
  }

  if (!active && !canDeactivateProjectAdvisor(existingResult.data)) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "No se puede desactivar el asesor por defecto.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("project_advisors")
    .update({ active })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      data: null,
      error: error
        ? formatError(error)
        : {
            code: null,
            details: null,
            hint: null,
            message: "No se pudo cambiar el estado del asesor.",
          },
    };
  }

  return {
    ok: true,
    data: mapProjectAdvisorRow(data),
    error: null,
  };
}

export async function createProject(
  input: ProjectMutationInput,
  featureIds: string[] = [],
): Promise<ProjectWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
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
  let uniqueSlug = input.slug;

  try {
    uniqueSlug = await resolveUniqueProjectSlug(input.slug);
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error as SupabaseActionError),
    };
  }

  const translations = await buildCreatePublicContentTranslationFields(
    {
      description: input.description,
      title: input.name,
    },
    translatePublicContent,
    "project",
  );
  const insertPayload: ProjectInsert = {
    name: input.name,
    name_en: translations.titleEn,
    name_de: translations.titleDe,
    slug: uniqueSlug,
    description: input.description,
    description_en: translations.descriptionEn,
    description_de: translations.descriptionDe,
    video_url: input.videoUrl,
    developer_name: input.developerName,
    construction_status: input.constructionStatus,
    estimated_delivery_date: input.estimatedDeliveryDate,
    address: input.address,
    neighborhood: input.neighborhood,
    city: input.city,
    department: input.department,
    latitude: input.latitude,
    longitude: input.longitude,
    published: true,
    featured: input.featured,
    is_investment_opportunity: input.isInvestmentOpportunity,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(insertPayload)
    .select("*")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error),
    };
  }

  if (data?.id) {
    try {
      await syncProjectFeatures(data.id, featureIds);
    } catch (featureError) {
      return {
        ok: false,
        data: null,
        error: formatError(featureError as SupabaseActionError),
      };
    }
  }

  return {
    ok: true,
    data: data ? mapProjectRow(data) : null,
    error: null,
  };
}

export async function updateProject(
  id: string,
  input: ProjectMutationInput,
  featureIds: string[] = [],
): Promise<ProjectWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
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
  let uniqueSlug = input.slug;

  try {
    uniqueSlug = await resolveUniqueProjectSlug(input.slug, { excludeId: id });
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error as SupabaseActionError),
    };
  }

  const existingProjectResult = await getAdminProjectById(id);

  if (!existingProjectResult.ok) {
    return {
      ok: false,
      data: null,
      error: existingProjectResult.error,
    };
  }

  if (!existingProjectResult.data) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "No se encontró el proyecto a actualizar.",
      },
    };
  }

  const updatePayload: ProjectUpdate = buildProjectUpdatePayload(input, {
    published: existingProjectResult.data.published ?? false,
    slug: uniqueSlug,
  });
  const translations = await buildUpdatePublicContentTranslationFields({
    context: "project",
    next: {
      description: input.description,
      title: input.name,
    },
    previous: {
      description: existingProjectResult.data.description,
      descriptionDe: existingProjectResult.data.descriptionDe,
      descriptionEn: existingProjectResult.data.descriptionEn,
      title: existingProjectResult.data.name,
      titleDe: existingProjectResult.data.nameDe,
      titleEn: existingProjectResult.data.nameEn,
    },
    translator: translatePublicContent,
  });

  updatePayload.name_en = translations.titleEn;
  updatePayload.name_de = translations.titleDe;
  updatePayload.description_en = translations.descriptionEn;
  updatePayload.description_de = translations.descriptionDe;

  const { data, error } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error),
    };
  }

  if (data?.id) {
    try {
      await syncProjectFeatures(data.id, featureIds);
    } catch (featureError) {
      return {
        ok: false,
        data: null,
        error: formatError(featureError as SupabaseActionError),
      };
    }
  }

  return {
    ok: true,
    data: data ? mapProjectRow(data) : null,
    error: null,
  };
}

export async function deleteProject(
  id: string,
): Promise<{ ok: boolean; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
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
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return {
      ok: false,
      error: formatError(error),
    };
  }

  return {
    ok: true,
    error: null,
  };
}
