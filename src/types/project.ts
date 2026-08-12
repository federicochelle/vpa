import type { Currency } from "@/types/property";

export type ConstructionStatus =
  | "planning"
  | "pre-sale"
  | "under-construction"
  | "finished";

export type ProjectUnitStatus = "available" | "reserved" | "sold";

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  neighborhood: string | null;
  developerName: string | null;
  constructionStatus: ConstructionStatus | null;
  estimatedDeliveryDate: string | null;
  startingPrice: number | null;
  currency: Currency | null;
  image: string | null;
  featured: boolean;
  isInvestmentOpportunity: boolean;
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
