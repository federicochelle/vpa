import type { ProjectAdvisorMutationInput, SupabaseActionError } from "@/features/projects/projects.data";

function toString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableString(value: FormDataEntryValue | null) {
  const text = toString(value);
  return text.length > 0 ? text : null;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

export function buildProjectAdvisorInput(formData: FormData): ProjectAdvisorMutationInput {
  return {
    name: toString(formData.get("name")),
    phone: toString(formData.get("phone")),
    whatsapp: toString(formData.get("whatsapp")),
    email: toNullableString(formData.get("email")),
    photoUrl: toNullableString(formData.get("photoUrl")),
    active: toBoolean(formData.get("active")),
    isDefault: toBoolean(formData.get("isDefault")),
  };
}

export function toProjectAdvisorErrorMessage(
  error: SupabaseActionError | null,
  fallback: string,
) {
  if (!error) {
    return fallback;
  }

  return error.message;
}
