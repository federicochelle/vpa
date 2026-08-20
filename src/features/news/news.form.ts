import type { NewsMutationInput, SupabaseActionError } from "@/features/news/news.data";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toRequiredString(value: FormDataEntryValue | null, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toNewsErrorMessage(
  error: SupabaseActionError | null,
  fallback: string,
) {
  if (!error) {
    return fallback;
  }

  return error.message;
}

export function buildNewsInput(formData: FormData): NewsMutationInput {
  const title = toRequiredString(formData.get("title"));

  return {
    title,
    slug: slugify(title),
    excerpt: toNullableString(formData.get("excerpt")),
    content: toNullableString(formData.get("content")),
    published: true,
  };
}
