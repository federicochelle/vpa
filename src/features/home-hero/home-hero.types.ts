export type HomeHeroEntityType = "property" | "project";

export type HomeHeroOrder = 1 | 2 | 3 | null;

export interface HomeHeroAssignment {
  entityId: string;
  entityType: HomeHeroEntityType;
  heroOrder: Exclude<HomeHeroOrder, null>;
}

export interface HomeHeroSlide {
  entityId: string;
  entityType: HomeHeroEntityType;
  heroOrder: Exclude<HomeHeroOrder, null>;
  src: string;
  alt: string;
  title: string;
  href: string;
  locationLabel: string | null;
  price?: string;
}
