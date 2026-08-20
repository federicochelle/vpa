import type { Database } from "@/lib/supabase/types";
import type { News } from "@/types/news";

type NewsRow = Database["public"]["Tables"]["news"]["Row"];

export function mapNewsRow(row: NewsRow): News {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    imagePublicId: row.image_public_id,
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
