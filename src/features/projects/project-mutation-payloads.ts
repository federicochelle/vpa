import type { ProjectMutationInput } from "@/features/projects/projects.data";
import type { Database } from "@/lib/supabase/types";

type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export function buildProjectUpdatePayload(
  input: ProjectMutationInput,
  options: {
    published: boolean;
    slug: string;
  },
): ProjectUpdate {
  return {
    advisor_id: input.advisorId,
    name: input.name,
    slug: options.slug,
    description: input.description,
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
    published: options.published,
    featured: input.featured,
    is_investment_opportunity: input.isInvestmentOpportunity,
  };
}
