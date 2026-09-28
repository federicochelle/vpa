import type { Database } from "@/lib/supabase/types";
import type { ProjectAdvisor } from "@/types/project";

type ProjectAdvisorRow = Database["public"]["Tables"]["project_advisors"]["Row"];

export function mapProjectAdvisorRow(row: ProjectAdvisorRow): ProjectAdvisor {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    photoUrl: row.photo_url,
    active: row.active,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

export function resolveProjectAdvisorFallback(
  advisor: ProjectAdvisor | null | undefined,
  advisors: ProjectAdvisor[],
) {
  if (advisor?.active) {
    return advisor;
  }

  return advisors.find((candidate) => candidate.active && candidate.isDefault) ?? null;
}

export function canDeactivateProjectAdvisor(advisor: Pick<ProjectAdvisor, "isDefault">) {
  return !advisor.isDefault;
}
