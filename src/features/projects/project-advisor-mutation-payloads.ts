import type { ProjectAdvisorMutationInput } from "@/features/projects/projects.data";
import type { Database } from "@/lib/supabase/types";

type ProjectAdvisorInsert = Database["public"]["Tables"]["project_advisors"]["Insert"];
type ProjectAdvisorUpdate = Database["public"]["Tables"]["project_advisors"]["Update"];

export function buildProjectAdvisorInsertPayload(
  input: ProjectAdvisorMutationInput,
): ProjectAdvisorInsert {
  return {
    name: input.name,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    photo_url: input.photoUrl,
    active: input.active,
    is_default: false,
  };
}

export function buildProjectAdvisorUpdatePayload(
  input: ProjectAdvisorMutationInput,
  options: {
    isDefault: boolean;
  },
): ProjectAdvisorUpdate {
  return {
    name: input.name,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    photo_url: input.photoUrl,
    active: input.active,
    is_default: options.isDefault,
  };
}
