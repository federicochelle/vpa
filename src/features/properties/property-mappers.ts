import type { Database } from "@/lib/supabase/types";
import type { Property, PropertyImage } from "@/types/property";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];

export function mapPropertyRow(row: PropertyRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    operationType: row.operation_type,
    propertyType: row.property_type as Property["propertyType"],
    price: row.price,
    currency: row.currency,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    garages: row.garages,
    builtArea: row.built_area,
    totalArea: row.total_area,
    landArea: row.land_area,
    neighborhood: row.neighborhood,
    address: row.address,
    city: row.city,
    department: row.department,
    latitude: row.latitude,
    longitude: row.longitude,
    expenses: row.expenses,
    constructionYear: row.construction_year,
    description: row.description,
    investmentOpportunity: row.investment_opportunity,
    image: null,
    videoUrl: row.video_url,
    featured: row.featured,
    published: row.published,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPropertyImageRow(row: PropertyImageRow): PropertyImage {
  return {
    id: row.id,
    propertyId: row.property_id,
    url: row.url,
    publicId: row.public_id,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    altText: row.alt_text,
    createdAt: row.created_at,
  };
}
