import type { Database } from "@/lib/supabase/types";
import { mapProjectAdvisorRow } from "@/features/projects/project-advisors";
import type { Project, ProjectAdvisor, ProjectImage } from "@/types/project";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectAdvisorRow = Database["public"]["Tables"]["project_advisors"]["Row"];
type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];

export function mapProjectRow(
  row: ProjectRow,
  advisor: ProjectAdvisor | ProjectAdvisorRow | null = null,
): Project {
  return {
    id: row.id,
    advisorId: row.advisor_id,
    advisor: advisor && "photo_url" in advisor ? mapProjectAdvisorRow(advisor) : advisor,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    nameDe: row.name_de,
    description: row.description,
    descriptionEn: row.description_en,
    descriptionDe: row.description_de,
    address: row.address,
    city: row.city,
    department: row.department,
    neighborhood: row.neighborhood,
    developerName: row.developer_name,
    constructionStatus: row.construction_status,
    estimatedDeliveryDate: row.estimated_delivery_date,
    latitude: row.latitude,
    longitude: row.longitude,
    image: null,
    videoUrl: row.video_url,
    heroOrder: null,
    sectionOrder: row.section_order,
    featured: row.featured,
    published: row.published,
    isInvestmentOpportunity: row.is_investment_opportunity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectImageRow(row: ProjectImageRow): ProjectImage {
  return {
    id: row.id,
    projectId: row.project_id,
    url: row.url,
    publicId: row.public_id,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    altText: row.alt_text,
    createdAt: row.created_at,
  };
}
