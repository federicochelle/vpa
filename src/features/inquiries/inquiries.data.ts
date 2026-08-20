import "server-only";

import {
  createSupabaseServerActionClient,
  createSupabaseServerComponentClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Inquiry, InquiryKind } from "@/types/inquiry";
import type { ParsedPublicInquiryInput } from "@/features/inquiries/inquiries.form";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];
type InquiryInsert = Database["public"]["Tables"]["inquiries"]["Insert"];

export interface InquiriesResult {
  ok: boolean;
  data: Inquiry[];
  error: string | null;
}

export interface InquiryResult {
  ok: boolean;
  data: Inquiry | null;
  error: string | null;
}

export interface CreateInquiryResult {
  ok: boolean;
  error: "invalid_payload" | "not_found" | "unexpected" | null;
  message: string;
}

function mapInquiryRow(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    propertyId: row.property_id,
    projectId: row.project_id,
    projectUnitId: row.project_unit_id,
    relatedTitle: row.related_title,
    originPath: row.origin_path,
    status: row.status,
    createdAt: row.created_at,
  };
}

function getExpectedOriginPath(input: {
  kind: "property" | "project" | "general";
  slug: string;
  operationType?: "sale" | "rent";
}) {
  if (input.kind === "general") {
    return `/noticias/${input.slug}`;
  }

  if (input.kind === "project") {
    return `/inversion/${input.slug}`;
  }

  return input.operationType === "rent"
    ? `/alquileres/${input.slug}`
    : `/comprar/${input.slug}`;
}

export async function createPublicInquiry(
  input: ParsedPublicInquiryInput,
): Promise<CreateInquiryResult> {
  console.info("[inquiries][create] start", {
    kind: input.kind,
    originPath: input.originPath,
    propertyId: input.propertyId,
    projectId: input.projectId,
    hasPhone: Boolean(input.phone),
    emailDomain: input.email.split("@")[1] ?? null,
    nameLength: input.name.length,
    messageLength: input.message.length,
  });

  const supabase = createSupabaseServiceRoleClient();
  console.info("[inquiries][create] service_role_client_created");

  if (input.kind === "general") {
    const slug = input.originPath.replace(/^\/noticias\//, "").trim();

    if (!slug) {
      return {
        ok: false,
        error: "invalid_payload",
        message: "El origen de la consulta no es válido.",
      };
    }

    const { data: news, error } = await supabase
      .from("news")
      .select("slug, title")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("[inquiries][create] news_lookup_error", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        ok: false,
        error: "unexpected",
        message: "No se pudo procesar la consulta en este momento.",
      };
    }

    if (!news) {
      console.error("[inquiries][create] news_lookup_not_found", {
        originPath: input.originPath,
      });
      return {
        ok: false,
        error: "not_found",
        message: "La noticia consultada ya no está disponible.",
      };
    }

    const expectedOriginPath = getExpectedOriginPath({
      kind: "general",
      slug: news.slug,
    });

    if (input.originPath !== expectedOriginPath) {
      console.error("[inquiries][create] news_origin_mismatch", {
        expectedOriginPath,
        receivedOriginPath: input.originPath,
      });
      return {
        ok: false,
        error: "invalid_payload",
        message: "El origen de la consulta no es válido.",
      };
    }

    const payload: InquiryInsert = {
      kind: "general",
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      property_id: null,
      project_id: null,
      project_unit_id: null,
      related_title: news.title,
      origin_path: expectedOriginPath,
      source: "public_web",
    };

    const { error: insertError } = await supabase.from("inquiries").insert(payload);

    if (insertError) {
      console.error("[inquiries][create] inquiry_insert_error", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return {
        ok: false,
        error: "unexpected",
        message: "No se pudo procesar la consulta en este momento.",
      };
    }

    return {
      ok: true,
      error: null,
      message: "Consulta creada correctamente.",
    };
  }

  if (input.kind === "property") {
    if (!input.propertyId) {
      return {
        ok: false,
        error: "invalid_payload",
        message: "La propiedad relacionada no es válida.",
      };
    }

    console.info("[inquiries][create] property_lookup_start", {
      propertyId: input.propertyId,
    });
    const { data: property, error } = await supabase
      .from("properties")
      .select("id, slug, title, operation_type")
      .eq("id", input.propertyId)
      .eq("published", true)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("[inquiries][create] property_lookup_error", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        ok: false,
        error: "unexpected",
        message: "No se pudo procesar la consulta en este momento.",
      };
    }

    if (!property) {
      console.error("[inquiries][create] property_lookup_not_found", {
        propertyId: input.propertyId,
      });
      return {
        ok: false,
        error: "not_found",
        message: "La propiedad consultada ya no está disponible.",
      };
    }

    const expectedOriginPath = getExpectedOriginPath({
      kind: "property",
      slug: property.slug,
      operationType: property.operation_type,
    });

    if (input.originPath !== expectedOriginPath) {
      console.error("[inquiries][create] property_origin_mismatch", {
        expectedOriginPath,
        receivedOriginPath: input.originPath,
      });
      return {
        ok: false,
        error: "invalid_payload",
        message: "El origen de la consulta no es válido.",
      };
    }

    const payload: InquiryInsert = {
      kind: "property",
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      property_id: property.id,
      project_id: null,
      project_unit_id: null,
      related_title: property.title,
      origin_path: expectedOriginPath,
      source: "public_web",
    };

    console.info("[inquiries][create] inquiry_insert_start", {
      kind: payload.kind,
      propertyId: payload.property_id,
      relatedTitle: payload.related_title,
      originPath: payload.origin_path,
    });
    const { error: insertError } = await supabase.from("inquiries").insert(payload);

    if (insertError) {
      console.error("[inquiries][create] inquiry_insert_error", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return {
        ok: false,
        error: "unexpected",
        message: "No se pudo procesar la consulta en este momento.",
      };
    }

    console.info("[inquiries][create] inquiry_insert_ok", {
      kind: payload.kind,
      propertyId: payload.property_id,
    });
    return {
      ok: true,
      error: null,
      message: "Consulta creada correctamente.",
    };
  }

  console.info("[inquiries][create] project_lookup_start", {
    projectId: input.projectId,
  });

  if (!input.projectId) {
    return {
      ok: false,
      error: "invalid_payload",
      message: "El proyecto relacionado no es válido.",
    };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, slug, name")
    .eq("id", input.projectId)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[inquiries][create] project_lookup_error", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return {
      ok: false,
      error: "unexpected",
      message: "No se pudo procesar la consulta en este momento.",
    };
  }

  if (!project) {
    console.error("[inquiries][create] project_lookup_not_found", {
      projectId: input.projectId,
    });
    return {
      ok: false,
      error: "not_found",
      message: "El proyecto consultado ya no está disponible.",
    };
  }

  const expectedOriginPath = getExpectedOriginPath({
    kind: "project",
    slug: project.slug,
  });

  if (input.originPath !== expectedOriginPath) {
    console.error("[inquiries][create] project_origin_mismatch", {
      expectedOriginPath,
      receivedOriginPath: input.originPath,
    });
    return {
      ok: false,
      error: "invalid_payload",
      message: "El origen de la consulta no es válido.",
    };
  }

  const payload: InquiryInsert = {
    kind: "project",
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    property_id: null,
    project_id: project.id,
    project_unit_id: null,
    related_title: project.name,
    origin_path: expectedOriginPath,
    source: "public_web",
  };

  console.info("[inquiries][create] inquiry_insert_start", {
    kind: payload.kind,
    projectId: payload.project_id,
    relatedTitle: payload.related_title,
    originPath: payload.origin_path,
  });
  const { error: insertError } = await supabase.from("inquiries").insert(payload);

  if (insertError) {
    console.error("[inquiries][create] inquiry_insert_error", {
      code: insertError.code,
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
    });
    return {
      ok: false,
      error: "unexpected",
      message: "No se pudo procesar la consulta en este momento.",
    };
  }

  console.info("[inquiries][create] inquiry_insert_ok", {
    kind: payload.kind,
    projectId: payload.project_id,
  });
  return {
    ok: true,
    error: null,
    message: "Consulta creada correctamente.",
  };
}

export async function listAdminInquiries(): Promise<InquiriesResult> {
  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing admin inquiries", error);
    return {
      ok: false,
      data: [],
      error: "No se pudieron cargar las consultas.",
    };
  }

  return {
    ok: true,
    data: data.map(mapInquiryRow),
    error: null,
  };
}

export async function getAdminInquiryById(id: string): Promise<InquiryResult> {
  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error reading admin inquiry", error);
    return {
      ok: false,
      data: null,
      error: "No se pudo cargar la consulta.",
    };
  }

  return {
    ok: true,
    data: data ? mapInquiryRow(data) : null,
    error: null,
  };
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry["status"],
): Promise<InquiryResult> {
  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error updating inquiry status", error);
    return {
      ok: false,
      data: null,
      error: "No se pudo actualizar el estado de la consulta.",
    };
  }

  return {
    ok: true,
    data: data ? mapInquiryRow(data) : null,
    error: null,
  };
}

export function formatInquiryKind(kind: InquiryKind) {
  switch (kind) {
    case "property":
      return "Propiedad";
    case "project":
      return "Proyecto";
    case "project_unit":
      return "Unidad";
    case "general":
      return "General";
    default:
      return kind;
  }
}

export function formatInquiryStatus(status: Inquiry["status"]) {
  switch (status) {
    case "new":
      return "Nueva";
    case "contacted":
      return "Contactada";
    case "closed":
      return "Cerrada";
    default:
      return status;
  }
}
