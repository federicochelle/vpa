import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Property } from "@/types/property";
import { mapPropertyRow } from "@/features/properties/property-mappers";
import type { Database } from "@/lib/supabase/types";

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

export interface SupabaseActionError {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}

export interface PropertyMutationInput {
  title: string;
  slug: string;
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
  builtArea: number | null;
  totalArea: number | null;
  landArea: number | null;
  description: string | null;
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

function toPropertyPayload(
  input: PropertyMutationInput,
): Database["public"]["Tables"]["properties"]["Row"] {
  return {
    id: "",
    title: input.title,
    slug: input.slug,
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
    built_area: input.builtArea,
    total_area: input.totalArea,
    land_area: input.landArea,
    description: input.description,
    address: input.address,
    neighborhood: input.neighborhood,
    city: input.city,
    department: input.department,
    latitude: input.latitude,
    longitude: input.longitude,
    expenses: input.expenses,
    construction_year: input.constructionYear,
    investment_opportunity: input.investmentOpportunity,
    created_at: "",
    updated_at: "",
  };
}

async function readPublishedProperties(): Promise<PropertiesReadResult> {
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
    .eq("published", true)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data.map(mapPropertyRow),
    error: null,
  };
}

export async function listPublishedProperties(): Promise<Property[]> {
  const result = await readPublishedProperties();

  if (!result.ok) {
    console.error("Error listing published properties", result.error);
    return [];
  }

  return result.data;
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

  return {
    ok: true,
    data: data ? mapPropertyRow(data) : null,
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
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      data: [],
      error: formatError(error),
    };
  }

  return {
    ok: true,
    data: data.map(mapPropertyRow),
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

export async function createProperty(
  input: PropertyMutationInput,
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
  const payload = toPropertyPayload(input);
  const insertPayload: PropertyInsert = {
    title: payload.title,
    slug: payload.slug,
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
    built_area: payload.built_area,
    total_area: payload.total_area,
    land_area: payload.land_area,
    description: payload.description,
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

  return {
    ok: true,
    data: data ? mapPropertyRow(data) : null,
    error: null,
  };
}

export async function updateProperty(
  id: string,
  input: PropertyMutationInput,
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
  const payload = toPropertyPayload(input);
  const updatePayload: PropertyUpdate = {
    title: payload.title,
    slug: payload.slug,
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
    built_area: payload.built_area,
    total_area: payload.total_area,
    land_area: payload.land_area,
    description: payload.description,
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
