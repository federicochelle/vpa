import "server-only";

import {
  createSupabaseServerActionClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mapNewsRow } from "@/features/news/news-mappers";
import type { Database } from "@/lib/supabase/types";
import type { News } from "@/types/news";

type NewsInsert = Database["public"]["Tables"]["news"]["Insert"];
type NewsUpdate = Database["public"]["Tables"]["news"]["Update"];

export interface SupabaseActionError {
  code: string | null;
  details: string | null;
  hint: string | null;
  message: string;
}

export interface NewsMutationInput {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  published: boolean;
}

interface NewsReadResult {
  ok: boolean;
  data: News[];
  error: SupabaseActionError | null;
}

interface SingleNewsReadResult {
  ok: boolean;
  data: News | null;
  error: SupabaseActionError | null;
}

interface NewsWriteResult {
  ok: boolean;
  data: News | null;
  error: SupabaseActionError | null;
}

export interface PublishedNewsPageResult {
  data: News[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NewsSitemapEntry {
  slug: string;
  updatedAt: string | null;
  publishedAt: string | null;
}

function getMissingEnvError(): SupabaseActionError {
  return {
    code: null,
    details: null,
    hint: null,
    message:
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  };
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

function resolvePublishedAt(
  published: boolean,
  existingPublishedAt?: string | null,
) {
  if (!published) {
    return null;
  }

  return existingPublishedAt ?? new Date().toISOString();
}

async function resolveUniqueNewsSlug(
  slug: string,
  options?: { excludeId?: string },
) {
  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("news")
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

export async function listAdminNews(): Promise<NewsReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: [],
      error: getMissingEnvError(),
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
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
    data: data.map(mapNewsRow),
    error: null,
  };
}

export async function listPublishedNews(options?: {
  limit?: number;
}): Promise<News[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  let query = supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing published news", formatError(error));
    return [];
  }

  return data.map(mapNewsRow);
}

export async function listPublishedNewsSitemapEntries(): Promise<NewsSitemapEntry[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("news")
    .select("slug, updated_at, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error listing published news sitemap entries", formatError(error));
    return [];
  }

  return data.map((news) => ({
    slug: news.slug,
    updatedAt: news.updated_at,
    publishedAt: news.published_at,
  }));
}

export async function listPublishedNewsPage(options?: {
  page?: number;
  pageSize?: number;
}): Promise<PublishedNewsPageResult> {
  const pageSize = Math.max(1, options?.pageSize ?? 5);
  const requestedPage = Math.max(1, options?.page ?? 1);

  if (!hasSupabaseEnv()) {
    return {
      data: [],
      page: 1,
      pageSize,
      total: 0,
      totalPages: 1,
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const from = (requestedPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error listing published news page", formatError(error));
    return {
      data: [],
      page: 1,
      pageSize,
      total: 0,
      totalPages: 1,
    };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  if (page !== requestedPage) {
    const correctedFrom = (page - 1) * pageSize;
    const correctedTo = correctedFrom + pageSize - 1;
    const correctedResult = await supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(correctedFrom, correctedTo);

    if (correctedResult.error) {
      console.error(
        "Error listing corrected published news page",
        formatError(correctedResult.error),
      );
      return {
        data: [],
        page: 1,
        pageSize,
        total,
        totalPages,
      };
    }

    return {
      data: correctedResult.data.map(mapNewsRow),
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  return {
    data: data.map(mapNewsRow),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getPublishedNewsBySlug(slug: string): Promise<News | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching published news by slug", formatError(error));
    return null;
  }

  return data ? mapNewsRow(data) : null;
}

export async function getAdminNewsById(id: string): Promise<SingleNewsReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingEnvError(),
    };
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("news")
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
    data: data ? mapNewsRow(data) : null,
    error: null,
  };
}

export async function createNews(input: NewsMutationInput): Promise<NewsWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  let uniqueSlug = input.slug;

  try {
    uniqueSlug = await resolveUniqueNewsSlug(input.slug);
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error as SupabaseActionError),
    };
  }

  const insertPayload: NewsInsert = {
    title: input.title,
    slug: uniqueSlug,
    excerpt: input.excerpt,
    content: input.content,
    published: input.published,
    published_at: resolvePublishedAt(input.published),
  };

  const { data, error } = await supabase
    .from("news")
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
    data: data ? mapNewsRow(data) : null,
    error: null,
  };
}

export async function updateNews(
  id: string,
  input: NewsMutationInput,
): Promise<NewsWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingEnvError(),
    };
  }

  const existingNewsResult = await getAdminNewsById(id);

  if (!existingNewsResult.ok) {
    return {
      ok: false,
      data: null,
      error: existingNewsResult.error,
    };
  }

  if (!existingNewsResult.data) {
    return {
      ok: false,
      data: null,
      error: {
        code: null,
        details: null,
        hint: null,
        message: "No se encontro la noticia a actualizar.",
      },
    };
  }

  const supabase = await createSupabaseServerActionClient();
  let uniqueSlug = input.slug;

  try {
    uniqueSlug = await resolveUniqueNewsSlug(input.slug, { excludeId: id });
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: formatError(error as SupabaseActionError),
    };
  }

  const updatePayload: NewsUpdate = {
    title: input.title,
    slug: uniqueSlug,
    excerpt: input.excerpt,
    content: input.content,
    published: input.published,
    published_at: resolvePublishedAt(
      input.published,
      existingNewsResult.data.publishedAt,
    ),
  };

  const { data, error } = await supabase
    .from("news")
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
    data: data ? mapNewsRow(data) : null,
    error: null,
  };
}

export async function updateNewsImage(
  id: string,
  payload: {
    imagePublicId: string;
    imageUrl: string;
  },
): Promise<NewsWriteResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      data: null,
      error: getMissingEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from("news")
    .update({
      image_public_id: payload.imagePublicId,
      image_url: payload.imageUrl,
    })
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
    data: data ? mapNewsRow(data) : null,
    error: null,
  };
}

export async function deleteNews(
  id: string,
): Promise<{ ok: boolean; error: SupabaseActionError | null }> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: getMissingEnvError(),
    };
  }

  const supabase = await createSupabaseServerActionClient();
  const { error } = await supabase.from("news").delete().eq("id", id);

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
