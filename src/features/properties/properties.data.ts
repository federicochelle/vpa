import "server-only";

import {
  createSupabaseServerActionClient,
  createSupabaseServerClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import { getHomeHeroOrderMap, setHomeHeroOrder } from "@/features/home-hero/home-hero.data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Property } from "@/types/property";
import type { Feature } from "@/types/feature";
import { mapPropertyRow } from "@/features/properties/property-mappers";
import type { Database } from "@/lib/supabase/types";

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];
type PropertyFeatureInsert = Database["public"]["Tables"]["property_features"]["Insert"];
type PropertyCoverImageRow = Pick<
  Database["public"]["Tables"]["property_images"]["Row"],
  "id" | "property_id" | "url" | "is_cover" | "sort_order" | "created_at"
>;
type FeatureRow = Pick<
  Database["public"]["Tables"]["features"]["Row"],
  "id" | "name" | "slug" | "category"
>;

export interface SupabaseActionError {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}

export interface PropertyMutationInput {
  title: string;
  slug: string;
  projectId: string | null;
  operationType: "sale" | "rent";
  propertyType: string;
  status: "draft" | "published" | "archived";
  published: boolean;
  featured: boolean;
  price: number | null;
  currency: "USD" | "UYU" | "EUR" | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  totalArea: number | null;
  kitchenType: Property["kitchenType"];
  hasBalcony: boolean;
  hasTerrace: boolean;
  disposition: Property["disposition"];
  orientation: Property["orientation"];
  floor: string | null;
  description: string | null;
  videoUrl: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  department: string | null;
  latitude: number | null;
  longitude: number | null;
  expenses: number | null;
  constructionYear: number | null;
  investmentOpportunity: boolean;
}

export type PropertyHeroOrder = 1 | 2 | 3 | null;

interface PropertiesReadResult {
  ok: boolean;
  data: Property[];
  error: SupabaseActionError | null;
}

interface PropertyReadResult {
  ok: boolean;
  data: Property | null;
  error: SupabaseActionError | null;
}

interface PropertyWriteResult {
  ok: boolean;
  data: Property | null;
  error: SupabaseActionError | null;
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

function mapFeatureRow(row: FeatureRow): Feature {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
  };
}

async function readPropertyFeatures(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string,
): Promise<Feature[]> {
  const { data: propertyFeatureRows, error: propertyFeaturesError } = await supabase
    .from("property_features")
    .select("feature_id")
    .eq("property_id", propertyId);

  if (propertyFeaturesError) {
    console.error("Error fetching property feature relations", formatError(propertyFeaturesError));
    return [];
  }

  const featureIds = Array.from(
    new Set(propertyFeatureRows.map((row) => row.feature_id).filter(Boolean)),
  );

  if (featureIds.length === 0) {
    return [];
  }

  const { data: featureRows, error: featuresError } = await supabase
    .from("features")
    .select("id, name, slug, category")
    .in("id", featureIds);

  if (featuresError) {
    console.error("Error fetching property features", formatError(featuresError));
    return [];
  }

  const featuresById = new Map(featureRows.map((row) => [row.id, mapFeatureRow(row)]));

  return featureIds
    .map((featureId) => featuresById.get(featureId))
    .filter((feature): feature is Feature => Boolean(feature));
}

function selectPropertyCoverImages(
  properties: Property[],
  imageRows: PropertyCoverImageRow[],
): Property[] {
  const coverByPropertyId = new Map<string, string>();

  for (const image of imageRows) {
    if (!coverByPropertyId.has(image.property_id)) {
      coverByPropertyId.set(image.property_id, image.url);
    }
  }

  return properties.map((property) => ({
    ...property,
    image: coverByPropertyId.get(property.id) ?? null,
  }));
}

async function attachPropertyCoverImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  properties: Property[],
): Promise<PropertiesReadResult> {
  if (properties.length === 0) {
    return {
      ok: true,
      data: properties,
      error: null,
    };
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
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: selectPropertyCoverImages(properties, data),
    error: null,
  };
}

async function resolveUniquePropertySlug(
  slug: string,
  options?: { excludeId?: string },
) {
  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, slug")
    .ilike("slug", `${slug}%`);

  if (error) {
    throw error;
  }

  const takenSlugs = new Set(
    data
      .filter((row) => row.id !== options?.excludeId)
      .map((row) => row.slug),
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

function toPropertyPayload(
  input: PropertyMutationInput,
): Pick<
  Database["public"]["Tables"]["properties"]["Insert"],
  | "title"
  | "slug"
  | "project_id"
  | "operation_type"
  | "property_type"
  | "status"
  | "published"
  | "featured"
  | "price"
  | "currency"
  | "bedrooms"
  | "bathrooms"
  | "garages"
  | "total_area"
  | "kitchen_type"
  | "has_balcony"
  | "has_terrace"
  | "disposition"
  | "orientation"
  | "floor"
  | "description"
  | "video_url"
  | "address"
  | "neighborhood"
  | "city"
  | "department"
  | "latitude"
  | "longitude"
  | "expenses"
  | "construction_year"
  | "investment_opportunity"
> {
  return {
    title: input.title,
    slug: input.slug,
    project_id: input.projectId,
    operation_type: input.operationType,
    property_type: input.propertyType,
    status: input.status,
    published: input.published,
    featured: input.featured,
    price: input.price,
    currency: input.currency,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    garages: input.garages,
    total_area: input.totalArea,
    kitchen_type: input.kitchenType,
    has_balcony: input.hasBalcony,
    has_terrace: input.hasTerrace,
    disposition: input.disposition,
    orientation: input.orientation,
    floor: input.floor,
    description: input.description,
    video_url: input.videoUrl,
    address: input.address,
    neighborhood: input.neighborhood,
    city: input.city,
    department: input.department,
    latitude: input.latitude,
    longitude: input.longitude,
    expenses: input.expenses,
    construction_year: input.constructionYear,
    investment_opportunity: input.investmentOpportunity,
  };
}

async function ensureProjectExists(
  supabase: Awaited<ReturnType<typeof createSupabaseServerActionClient>>,
  projectId: string | null,
) {
  if (!projectId) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    return formatError(error);
  }

  if (!data) {
    return {
      code: null,
      details: null,
      hint: null,
      message: "El proyecto asociado no existe o no está disponible.",
    };
  }

  return null;
}

async function readPublishedProperties(): Promise<PropertiesReadResult> {
  return readPublishedPropertiesByOperation();
}

async function readPublishedPropertiesByOperation(
  operationType?: Property["operationType"],
): Promise<PropertiesReadResult> {
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

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("properties")
    .select("*")
    .eq("published", true)
    .eq("status", "published")
    .order("section_order", { ascending: true, nullsFirst: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (operationType) {
    query = query.eq("operation_type", operationType);
  }

  const { data, error } = await query;

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return attachPropertyCoverImages(supabase, data.map(mapPropertyRow));
}

export async function listPublishedProperties(): Promise<Property[]> {
  const result = await readPublishedProperties();

  if (!result.ok) {
    return [];
  }

  return result.data;
}

export async function listPublishedPropertiesByOperation(
  operationType: Property["operationType"],
): Promise<Property[]> {
  const result = await readPublishedPropertiesByOperation(operationType);

  if (!result.ok) {
    return [];
  }

  return result.data;
}

export async function listPublishedPropertiesByProject(
  projectId: string,
): Promise<Property[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("project_id", projectId)
    .eq("published", true)
    .eq("status", "published")
    .order("section_order", { ascending: true, nullsFirst: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing published properties by project", formatError(error));
    return [];
  }

  const result = await attachPropertyCoverImages(supabase, data.map(mapPropertyRow));

  if (!result.ok) {
    console.error("Error listing published property covers by project", result.error);
    return [];
  }

  return result.data;
}

export async function listHeroProperties(): Promise<Property[]> {
  const result = await readPublishedProperties();

  if (!result.ok) {
    return [];
  }

  const heroOrderMap = await getHomeHeroOrderMap();

  return result.data
    .map((property) => ({
      ...property,
      heroOrder: heroOrderMap.get(`property:${property.id}`) ?? null,
    }))
    .filter((property) => property.heroOrder !== null)
    .sort((a, b) => (a.heroOrder ?? 99) - (b.heroOrder ?? 99))
    .slice(0, 3);
}

export async function getPublishedPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  const result = await getPublishedPropertyBySlugResult(slug);

  if (!result.ok) {
    console.error("Error fetching property by slug", result.error);
    return null;
  }

  return result.data;
}

export async function getPublishedPropertyBySlugResult(
  slug: string,
): Promise<PropertyReadResult> {
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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error),
    };
  }

  if (!data) {
    return {
      ok: true,
      data: null,
      error: null,
    };
  }

  const features = await readPropertyFeatures(supabase, data.id);

  return {
    ok: true,
    data: {
      ...mapPropertyRow(data),
      features,
    },
    error: null,
  };
}

export async function listAdminProperties(): Promise<PropertiesReadResult> {
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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
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
  const mappedProperties = data.map((property) => ({
    ...mapPropertyRow(property),
    heroOrder: heroOrderMap.get(`property:${property.id}`) ?? null,
  }));
  return {
    ok: true,
    data: mappedProperties,
    error: null,
  };
}

export async function getAdminPropertyById(id: string): Promise<PropertyReadResult> {
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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
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
    data: data ? mapPropertyRow(data) : null,
    error: null,
  };
}

export async function getPropertyFeatureIds(propertyId: string): Promise<string[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("property_features")
    .select("feature_id")
    .eq("property_id", propertyId);

  if (error) {
    console.error("Error fetching property features", formatError(error));
    return [];
  }

  return data.map((row) => row.feature_id);
}

async function syncPropertyFeatures(propertyId: string, featureIds: string[]) {
  const supabase = await createSupabaseServerActionClient();
  const { error: deleteError } = await supabase
    .from("property_features")
    .delete()
    .eq("property_id", propertyId);

  if (deleteError) {
    throw deleteError;
  }

  const uniqueFeatureIds = Array.from(new Set(featureIds));

  if (uniqueFeatureIds.length === 0) {
    return;
  }

  const payload: PropertyFeatureInsert[] = uniqueFeatureIds.map((featureId) => ({
    property_id: propertyId,
    feature_id: featureId,
  }));

  const { error: insertError } = await supabase
    .from("property_features")
    .insert(payload);

  if (insertError) {
    throw insertError;
  }
}

export async function createProperty(
  input: PropertyMutationInput,
  featureIds: string[] = [],
): Promise<PropertyWriteResult> {
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
  const projectError = await ensureProjectExists(supabase, input.projectId);

  if (projectError) {
    return {
      ok: false,
      data: null,
      error: projectError,
    };
  }

  let uniqueSlug = input.slug;

  try {
    uniqueSlug = await resolveUniquePropertySlug(input.slug);
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error as SupabaseActionError),
    };
  }

  const payload = toPropertyPayload({
    ...input,
    published: true,
    slug: uniqueSlug,
    status: "published",
  });
  const insertPayload: PropertyInsert = {
    title: payload.title,
    slug: payload.slug,
    project_id: payload.project_id,
    operation_type: payload.operation_type,
    property_type: payload.property_type,
    status: payload.status,
    published: payload.published,
    featured: payload.featured,
    price: payload.price,
    currency: payload.currency,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    garages: payload.garages,
    total_area: payload.total_area,
    kitchen_type: payload.kitchen_type,
    has_balcony: payload.has_balcony,
    has_terrace: payload.has_terrace,
    disposition: payload.disposition,
    orientation: payload.orientation,
    floor: payload.floor,
    description: payload.description,
    video_url: payload.video_url,
    address: payload.address,
    neighborhood: payload.neighborhood,
    city: payload.city,
    department: payload.department,
    latitude: payload.latitude,
    longitude: payload.longitude,
    expenses: payload.expenses,
    construction_year: payload.construction_year,
    investment_opportunity: payload.investment_opportunity,
  };

  const { data, error } = await supabase
    .from("properties")
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
      await syncPropertyFeatures(data.id, featureIds);
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
    data: data ? mapPropertyRow(data) : null,
    error: null,
  };
}

export async function updateProperty(
  id: string,
  input: PropertyMutationInput,
  featureIds: string[] = [],
): Promise<PropertyWriteResult> {
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
  const projectError = await ensureProjectExists(supabase, input.projectId);

  if (projectError) {
    return {
      ok: false,
      data: null,
      error: projectError,
    };
  }

  let uniqueSlug = input.slug;

  try {
    uniqueSlug = await resolveUniquePropertySlug(input.slug, { excludeId: id });
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error as SupabaseActionError),
    };
  }

  const existingPropertyResult = await getAdminPropertyById(id);

  if (!existingPropertyResult.ok) {
    return {
      ok: false,
      data: null,
      error: existingPropertyResult.error,
    };
  }

  if (!existingPropertyResult.data) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "No se encontró la propiedad a actualizar.",
      },
    };
  }

  const payload = toPropertyPayload({
    ...input,
    published: existingPropertyResult.data.published ?? false,
    slug: uniqueSlug,
    status: existingPropertyResult.data.status ?? "draft",
  });
  const updatePayload: PropertyUpdate = {
    title: payload.title,
    slug: payload.slug,
    project_id: payload.project_id,
    operation_type: payload.operation_type,
    property_type: payload.property_type,
    status: payload.status,
    published: payload.published,
    featured: payload.featured,
    price: payload.price,
    currency: payload.currency,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    garages: payload.garages,
    total_area: payload.total_area,
    kitchen_type: payload.kitchen_type,
    has_balcony: payload.has_balcony,
    has_terrace: payload.has_terrace,
    disposition: payload.disposition,
    orientation: payload.orientation,
    floor: payload.floor,
    description: payload.description,
    video_url: payload.video_url,
    address: payload.address,
    neighborhood: payload.neighborhood,
    city: payload.city,
    department: payload.department,
    latitude: payload.latitude,
    longitude: payload.longitude,
    expenses: payload.expenses,
    construction_year: payload.construction_year,
    investment_opportunity: payload.investment_opportunity,
  };

  const { data, error } = await supabase
    .from("properties")
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
      await syncPropertyFeatures(data.id, featureIds);
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
    data: data ? mapPropertyRow(data) : null,
    error: null,
  };
}

export async function deleteProperty(id: string): Promise<{ ok: boolean; error: SupabaseActionError | null }> {
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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);

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

export async function setPropertyPublished(
  id: string,
  published: boolean,
): Promise<PropertyWriteResult> {
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

  const supabase = await createSupabaseServerClient();
  const nextStatus = published ? "published" : "draft";
  const { data, error } = await supabase
    .from("properties")
    .update({
      published,
      status: nextStatus,
    } as PropertyUpdate)
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

  return {
    ok: true,
    data: data ? mapPropertyRow(data) : null,
    error: null,
  };
}

export async function setPropertyHeroOrder(
  propertyId: string,
  heroOrder: PropertyHeroOrder,
): Promise<PropertyWriteResult> {
  const result = await setHomeHeroOrder("property", propertyId, heroOrder);

  if (!result.ok) {
    return {
      ok: false,
      data: null,
      error: result.error,
    };
  }

  const dataResult = await getAdminPropertyById(propertyId);

  return {
    ok: true,
    data: dataResult.data
      ? {
          ...dataResult.data,
          heroOrder,
        }
      : null,
    error: null,
  };
}
