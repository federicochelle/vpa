import type { Currency } from "@/types/property";

export type ConstructionStatus =
  | "planned"
  | "under_construction"
  | "finished";

export type ProjectUnitStatus = "available" | "reserved" | "sold";

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
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
