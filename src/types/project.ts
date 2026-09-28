import type { Currency } from "@/types/property";

export const PROJECT_CONSTRUCTION_STATUS_VALUES = [
  "presale",
  "construction",
  "immediate_occupancy",
] as const;

export type ConstructionStatus =
  (typeof PROJECT_CONSTRUCTION_STATUS_VALUES)[number];

export const PROJECT_CONSTRUCTION_STATUS_LABELS: Record<
  ConstructionStatus,
  string
> = {
  presale: "En pozo",
  construction: "Construcción",
  immediate_occupancy: "Ocupación inmediata",
};

export type ProjectUnitStatus = "available" | "reserved" | "sold";

export interface ProjectAdvisor {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  photoUrl: string | null;
  active: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  advisorId: string | null;
  advisor: ProjectAdvisor | null;
  slug: string;
  name: string;
  nameEn: string | null;
  nameDe: string | null;
  description: string | null;
  descriptionEn: string | null;
  descriptionDe: string | null;
  address: string | null;
  city: string | null;
  department: string | null;
  neighborhood: string | null;
  developerName: string | null;
  constructionStatus: ConstructionStatus | null;
  estimatedDeliveryDate: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  videoUrl: string | null;
  heroOrder: number | null;
  sectionOrder: number | null;
  featured: boolean;
  published: boolean;
  isInvestmentOpportunity: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  publicId: string | null;
  sortOrder: number;
  isCover: boolean;
  altText: string | null;
  createdAt: string;
}

export interface ProjectUnit {
  id: string;
  unitNumber: string;
  floor: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  builtArea: number | null;
  totalArea: number | null;
  price: number | null;
  currency: Currency | null;
  status: ProjectUnitStatus;
}
