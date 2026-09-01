import type { Feature } from "@/types/feature";

export type OperationType = "sale" | "rent";

export type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "office"
  | "commercial-space"
  | "other";

export type Currency = "USD" | "UYU" | "EUR";
export type KitchenType = "integrated" | "independent";
export type PropertyDisposition = "front" | "back" | "lateral" | "interior";
export type PropertyOrientation =
  | "north"
  | "south"
  | "east"
  | "west"
  | "northeast"
  | "northwest"
  | "southeast"
  | "southwest";

export interface Property {
  id: string;
  slug: string;
  title: string;
  operationType: OperationType;
  propertyType: PropertyType;
  price: number | null;
  currency: Currency | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  builtArea: number | null;
  totalArea: number | null;
  landArea?: number | null;
  kitchenType?: KitchenType | null;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  disposition?: PropertyDisposition | null;
  orientation?: PropertyOrientation | null;
  floor?: string | null;
  neighborhood: string | null;
  address?: string | null;
  city?: string | null;
  department?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  expenses?: number | null;
  constructionYear?: number | null;
  description?: string | null;
  investmentOpportunity?: boolean;
  heroOrder: number | null;
  sectionOrder: number | null;
  features?: Feature[];
  image: string | null;
  videoUrl?: string | null;
  featured: boolean;
  published?: boolean;
  status?: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  publicId: string | null;
  sortOrder: number;
  isCover: boolean;
  altText: string | null;
  createdAt: string;
}
