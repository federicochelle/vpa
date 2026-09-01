import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  createSupabaseServerActionClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type {
  HomeHeroAssignment,
  HomeHeroEntityType,
  HomeHeroOrder,
  HomeHeroSlide,
} from "@/features/home-hero/home-hero.types";
import { mapProjectRow } from "@/features/projects/project-mappers";
import { mapPropertyRow } from "@/features/properties/property-mappers";
import type { Project } from "@/types/project";
import type { Property } from "@/types/property";

type HomeHeroItemRow = Database["public"]["Tables"]["home_hero_items"]["Row"];
type HomeHeroItemInsert = Database["public"]["Tables"]["home_hero_items"]["Insert"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyImageRow = Pick<
  Database["public"]["Tables"]["property_images"]["Row"],
  "id" | "property_id" | "url" | "is_cover" | "sort_order" | "created_at"
>;
type ProjectImageRow = Pick<
  Database["public"]["Tables"]["project_images"]["Row"],
  "id" | "project_id" | "url" | "is_cover" | "sort_order" | "created_at"
>;

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

function formatLocationLabel(
  city: string | null,
  neighborhood: string | null,
  department?: string | null,
) {
  return [neighborhood, city, department].filter(Boolean).join(", ") || null;
}

function formatHeroPropertyPrice(price: number | null, currency: string | null) {
  if (!price || !currency) {
    return "Precio a consultar";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function getPropertyHref(property: Pick<Property, "slug" | "operationType">) {
  return property.operationType === "sale"
    ? `/comprar/${property.slug}`
    : `/alquileres/${property.slug}`;
}

function getProjectHref(project: Pick<Project, "slug">) {
  return `/inversion/${project.slug}`;
}

function mapAssignmentRow(row: HomeHeroItemRow): HomeHeroAssignment | null {
  const heroOrder = row.position as HomeHeroAssignment["heroOrder"];

  if (row.entity_type === "property" && row.property_id) {
    return {
      entityId: row.property_id,
      entityType: "property",
      heroOrder,
    };
  }

  if (row.entity_type === "project" && row.project_id) {
    return {
      entityId: row.project_id,
      entityType: "project",
      heroOrder,
    };
  }

  return null;
}

async function listHomeHeroAssignments(): Promise<HomeHeroAssignment[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("home_hero_items")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching home hero items", formatError(error));
    return [];
  }

  return data
    .map(mapAssignmentRow)
    .filter((assignment): assignment is HomeHeroAssignment => Boolean(assignment));
}

async function attachPropertyCoverImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerComponentClient>>,
  properties: Property[],
) {
  if (properties.length === 0) {
    return properties;
  }

  const propertyIds = properties.map((property) => property.id);
  const { data, error } = await supabase
    .from("property_images")
    .select("property_id, url, is_cover, sort_order, created_at, id")
    .in("property_id", propertyIds)
    .order("property_id", { ascending: true })
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching property images for hero", formatError(error));
    return properties;
  }

  const coverByPropertyId = new Map<string, string>();

  for (const image of data as PropertyImageRow[]) {
    if (!coverByPropertyId.has(image.property_id)) {
      coverByPropertyId.set(image.property_id, image.url);
    }
  }

  return properties.map((property) => ({
    ...property,
    image: coverByPropertyId.get(property.id) ?? null,
  }));
}

async function attachProjectCoverImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerComponentClient>>,
  projects: Project[],
) {
  if (projects.length === 0) {
    return projects;
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
    console.error("Error fetching project images for hero", formatError(error));
    return projects;
  }

  const coverByProjectId = new Map<string, string>();

  for (const image of data as ProjectImageRow[]) {
    if (!coverByProjectId.has(image.project_id)) {
      coverByProjectId.set(image.project_id, image.url);
    }
  }

  return projects.map((project) => ({
    ...project,
    image: coverByProjectId.get(project.id) ?? null,
  }));
}

async function listPublishedHeroPropertiesByIds(propertyIds: string[]) {
  if (propertyIds.length === 0 || !hasSupabaseEnv()) {
    return new Map<string, Property>();
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .in("id", propertyIds)
    .eq("published", true)
    .eq("status", "published");

  if (error) {
    console.error("Error fetching hero properties", formatError(error));
    return new Map<string, Property>();
  }

  const properties = await attachPropertyCoverImages(
    supabase,
    (data as PropertyRow[]).map(mapPropertyRow),
  );
  return new Map(properties.map((property) => [property.id, property]));
}

async function listPublishedHeroProjectsByIds(projectIds: string[]) {
  if (projectIds.length === 0 || !hasSupabaseEnv()) {
    return new Map<string, Project>();
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .in("id", projectIds)
    .eq("published", true);

  if (error) {
    console.error("Error fetching hero projects", formatError(error));
    return new Map<string, Project>();
  }

  const projects = await attachProjectCoverImages(
    supabase,
    (data as ProjectRow[]).map(mapProjectRow),
  );
  return new Map(projects.map((project) => [project.id, project]));
}

export async function listHomeHeroSlides(): Promise<HomeHeroSlide[]> {
  const assignments = await listHomeHeroAssignments();

  if (assignments.length === 0) {
    return [];
  }

  const propertyIds = assignments
    .filter((assignment) => assignment.entityType === "property")
    .map((assignment) => assignment.entityId);
  const projectIds = assignments
    .filter((assignment) => assignment.entityType === "project")
    .map((assignment) => assignment.entityId);
  const [propertiesById, projectsById] = await Promise.all([
    listPublishedHeroPropertiesByIds(propertyIds),
    listPublishedHeroProjectsByIds(projectIds),
  ]);

  return assignments.reduce<HomeHeroSlide[]>((slides, assignment) => {
    if (assignment.entityType === "property") {
      const property = propertiesById.get(assignment.entityId);

      if (!property?.image) {
        return slides;
      }

      slides.push({
        entityId: property.id,
        entityType: "property",
        heroOrder: assignment.heroOrder,
        src: property.image,
        alt: property.title,
        title: property.title,
        href: getPropertyHref(property),
        locationLabel: formatLocationLabel(
          property.city ?? null,
          property.neighborhood ?? null,
          property.department ?? null,
        ),
        price: formatHeroPropertyPrice(property.price, property.currency),
      });

      return slides;
    }

    const project = projectsById.get(assignment.entityId);

    if (!project?.image) {
      return slides;
    }

    slides.push({
      entityId: project.id,
      entityType: "project",
      heroOrder: assignment.heroOrder,
      src: project.image,
      alt: project.name,
      title: project.name,
      href: getProjectHref(project),
      locationLabel: formatLocationLabel(
        project.city,
        project.neighborhood,
        project.department,
      ),
    });

    return slides;
  }, []);
}

export async function getHomeHeroOrderMap() {
  const assignments = await listHomeHeroAssignments();
  return new Map(
    assignments.map((assignment) => [
      `${assignment.entityType}:${assignment.entityId}`,
      assignment.heroOrder,
    ]),
  );
}

export async function toggleHomeHeroItem(
  entityType: HomeHeroEntityType,
  entityId: string,
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
  const existingQuery = entityType === "property"
    ? supabase.from("home_hero_items").select("position").eq("property_id", entityId)
    : supabase.from("home_hero_items").select("position").eq("project_id", entityId);
  const { data: existingItem, error: existingItemError } = await existingQuery.maybeSingle();

  if (existingItemError) {
    return { ok: false, error: formatError(existingItemError) };
  }

  if (existingItem) {
    return setHomeHeroOrder(entityType, entityId, null);
  }

  const { data: occupiedItems, error: occupiedItemsError } = await supabase
    .from("home_hero_items")
    .select("position");

  if (occupiedItemsError) {
    return { ok: false, error: formatError(occupiedItemsError) };
  }

  const occupiedPositions = new Set(occupiedItems.map((item) => item.position));
  const nextPosition = ([1, 2, 3] as const).find(
    (position) => !occupiedPositions.has(position),
  );

  if (!nextPosition) {
    return {
      ok: false,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "El hero admite un máximo de tres elementos destacados.",
      },
    };
  }

  return setHomeHeroOrder(entityType, entityId, nextPosition);
}

export async function setHomeHeroOrder(
  entityType: HomeHeroEntityType,
  entityId: string,
  heroOrder: HomeHeroOrder,
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

  if (entityType === "property") {
    const { data, error } = await supabase
      .from("properties")
      .select("id, published, status")
      .eq("id", entityId)
      .maybeSingle();

    if (error) {
      return { ok: false, error: formatError(error) };
    }

    if (!data) {
      return {
        ok: false,
        error: { code: null, details: null, hint: null, message: "No se encontró la propiedad." },
      };
    }

    if (heroOrder !== null && (!data.published || data.status !== "published")) {
      return {
        ok: false,
        error: {
          code: null,
          details: null,
          hint: null,
          message: "Solo las propiedades publicadas pueden ocupar una posición en el hero.",
        },
      };
    }
  } else {
    const { data, error } = await supabase
      .from("projects")
      .select("id, published")
      .eq("id", entityId)
      .maybeSingle();

    if (error) {
      return { ok: false, error: formatError(error) };
    }

    if (!data) {
      return {
        ok: false,
        error: { code: null, details: null, hint: null, message: "No se encontró el proyecto." },
      };
    }

    if (heroOrder !== null && !data.published) {
      return {
        ok: false,
        error: {
          code: null,
          details: null,
          hint: null,
          message: "Solo los proyectos publicados pueden ocupar una posición en el hero.",
        },
      };
    }
  }

  const currentRowMatch = entityType === "property"
    ? { entity_type: "property" as const, property_id: entityId, project_id: null }
    : { entity_type: "project" as const, property_id: null, project_id: entityId };

  const removeExistingQuery = entityType === "property"
    ? supabase.from("home_hero_items").delete().eq("property_id", entityId)
    : supabase.from("home_hero_items").delete().eq("project_id", entityId);
  const { error: removeExistingError } = await removeExistingQuery;

  if (removeExistingError) {
    return { ok: false, error: formatError(removeExistingError) };
  }

  if (heroOrder === null) {
    return { ok: true, error: null };
  }

  const { error: clearSlotError } = await supabase
    .from("home_hero_items")
    .delete()
    .eq("position", heroOrder);

  if (clearSlotError) {
    return { ok: false, error: formatError(clearSlotError) };
  }

  const payload: HomeHeroItemInsert = {
    position: heroOrder,
    entity_type: currentRowMatch.entity_type,
    property_id: currentRowMatch.property_id,
    project_id: currentRowMatch.project_id,
  };

  const { error: insertError } = await supabase
    .from("home_hero_items")
    .insert(payload);

  if (insertError) {
    return { ok: false, error: formatError(insertError) };
  }

  return { ok: true, error: null };
}
