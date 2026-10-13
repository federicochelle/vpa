export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      features: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          name: string;
          name_de: string | null;
          name_en: string | null;
          slug: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          name_de?: string | null;
          name_en?: string | null;
          slug: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          name_de?: string | null;
          name_en?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          created_at: string;
          campaign: string | null;
          email: string;
          google_event_id: string | null;
          id: string;
          intent: "general" | "advisory" | "contact" | "sell" | "valuation" | "investment" | "professional_report" | null;
          kind: "property" | "project" | "project_unit" | "general";
          landing_page: string | null;
          message: string;
          meet_url: string | null;
          medium: string | null;
          meeting_end: string | null;
          meeting_start: string | null;
          meeting_status: "scheduled" | "cancelled" | null;
          name: string;
          phone: string | null;
          project_id: string | null;
          project_unit_id: string | null;
          property_id: string | null;
          origin_path: string | null;
          referrer: string | null;
          related_title: string | null;
          source: string | null;
          status: "new" | "contacted" | "closed";
        };
        Insert: {
          created_at?: string;
          campaign?: string | null;
          email: string;
          google_event_id?: string | null;
          id?: string;
          intent?: "general" | "advisory" | "contact" | "sell" | "valuation" | "investment" | "professional_report" | null;
          kind: "property" | "project" | "project_unit" | "general";
          landing_page?: string | null;
          message: string;
          meet_url?: string | null;
          medium?: string | null;
          meeting_end?: string | null;
          meeting_start?: string | null;
          meeting_status?: "scheduled" | "cancelled" | null;
          name: string;
          phone?: string | null;
          project_id?: string | null;
          project_unit_id?: string | null;
          property_id?: string | null;
          origin_path?: string | null;
          referrer?: string | null;
          related_title?: string | null;
          source?: string | null;
          status?: "new" | "contacted" | "closed";
        };
        Update: {
          created_at?: string;
          campaign?: string | null;
          email?: string;
          google_event_id?: string | null;
          id?: string;
          intent?: "general" | "advisory" | "contact" | "sell" | "valuation" | "investment" | "professional_report" | null;
          kind?: "property" | "project" | "project_unit" | "general";
          landing_page?: string | null;
          message?: string;
          meet_url?: string | null;
          medium?: string | null;
          meeting_end?: string | null;
          meeting_start?: string | null;
          meeting_status?: "scheduled" | "cancelled" | null;
          name?: string;
          phone?: string | null;
          project_id?: string | null;
          project_unit_id?: string | null;
          property_id?: string | null;
          origin_path?: string | null;
          referrer?: string | null;
          related_title?: string | null;
          source?: string | null;
          status?: "new" | "contacted" | "closed";
        };
        Relationships: [];
      };
      news: {
        Row: {
          content: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          image_public_id: string | null;
          image_url: string | null;
          published: boolean;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          image_public_id?: string | null;
          image_url?: string | null;
          published?: boolean;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          image_public_id?: string | null;
          image_url?: string | null;
          published?: boolean;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: "admin" | "editor";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: "admin" | "editor";
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: "admin" | "editor";
          updated_at?: string;
        };
        Relationships: [];
      };
      project_advisors: {
        Row: {
          active: boolean;
          created_at: string;
          email: string | null;
          id: string;
          is_default: boolean;
          name: string;
          phone: string;
          photo_url: string | null;
          whatsapp: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_default?: boolean;
          name: string;
          phone?: string;
          photo_url?: string | null;
          whatsapp?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_default?: boolean;
          name?: string;
          phone?: string;
          photo_url?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_cover: boolean;
          project_id: string;
          public_id: string | null;
          sort_order: number;
          url: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_cover?: boolean;
          project_id: string;
          public_id?: string | null;
          sort_order?: number;
          url: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_cover?: boolean;
          project_id?: string;
          public_id?: string | null;
          sort_order?: number;
          url?: string;
        };
        Relationships: [];
      };
      project_features: {
        Row: {
          feature_id: string;
          project_id: string;
        };
        Insert: {
          feature_id: string;
          project_id: string;
        };
        Update: {
          feature_id?: string;
          project_id?: string;
        };
        Relationships: [];
      };
      home_hero_items: {
        Row: {
          created_at: string;
          entity_type: "property" | "project";
          id: string;
          position: number;
          project_id: string | null;
          property_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          entity_type: "property" | "project";
          id?: string;
          position: number;
          project_id?: string | null;
          property_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          entity_type?: "property" | "project";
          id?: string;
          position?: number;
          project_id?: string | null;
          property_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_units: {
        Row: {
          bathrooms: number | null;
          bedrooms: number | null;
          built_area: number | null;
          created_at: string;
          currency: "USD" | "UYU" | "EUR" | null;
          floor: string | null;
          garages: number | null;
          id: string;
          price: number | null;
          project_id: string;
          status: "available" | "reserved" | "sold";
          total_area: number | null;
          unit_number: string;
          updated_at: string;
        };
        Insert: {
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          created_at?: string;
          currency?: "USD" | "UYU" | "EUR" | null;
          floor?: string | null;
          garages?: number | null;
          id?: string;
          price?: number | null;
          project_id: string;
          status?: "available" | "reserved" | "sold";
          total_area?: number | null;
          unit_number: string;
          updated_at?: string;
        };
        Update: {
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          created_at?: string;
          currency?: "USD" | "UYU" | "EUR" | null;
          floor?: string | null;
          garages?: number | null;
          id?: string;
          price?: number | null;
          project_id?: string;
          status?: "available" | "reserved" | "sold";
          total_area?: number | null;
          unit_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          address: string | null;
          advisor_id: string | null;
          construction_status: "presale" | "construction" | "ready_delivery" | "immediate_occupancy";
          created_at: string;
          department: string | null;
          description: string | null;
          description_de: string | null;
          description_en: string | null;
          developer_name: string | null;
          estimated_delivery_date: string | null;
          featured: boolean;
          id: string;
          is_investment_opportunity: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          name_de: string | null;
          name_en: string | null;
          neighborhood: string | null;
          published: boolean;
          section_order: number | null;
          slug: string;
          video_url: string | null;
          city: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          advisor_id?: string | null;
          construction_status?: "presale" | "construction" | "ready_delivery" | "immediate_occupancy";
          created_at?: string;
          department?: string | null;
          description?: string | null;
          description_de?: string | null;
          description_en?: string | null;
          developer_name?: string | null;
          estimated_delivery_date?: string | null;
          featured?: boolean;
          id?: string;
          is_investment_opportunity?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          name_de?: string | null;
          name_en?: string | null;
          neighborhood?: string | null;
          published?: boolean;
          section_order?: number | null;
          slug: string;
          video_url?: string | null;
          city?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          advisor_id?: string | null;
          construction_status?: "presale" | "construction" | "ready_delivery" | "immediate_occupancy";
          created_at?: string;
          department?: string | null;
          description?: string | null;
          description_de?: string | null;
          description_en?: string | null;
          developer_name?: string | null;
          estimated_delivery_date?: string | null;
          featured?: boolean;
          id?: string;
          is_investment_opportunity?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          name_de?: string | null;
          name_en?: string | null;
          neighborhood?: string | null;
          published?: boolean;
          section_order?: number | null;
          slug?: string;
          video_url?: string | null;
          city?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string | null;
          advisor_id: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          built_area: number | null;
          city: string | null;
          construction_year: number | null;
          created_at: string;
          currency: "USD" | "UYU" | "EUR" | null;
          department: string | null;
          description: string | null;
          description_de: string | null;
          description_en: string | null;
          disposition: string | null;
          expenses: number | null;
          featured: boolean;
          floor: string | null;
          garages: number | null;
          has_balcony: boolean;
          has_terrace: boolean;
          hero_order: number | null;
          id: string;
          investment_opportunity: boolean;
          kitchen_type: string | null;
          land_area: number | null;
          latitude: number | null;
          longitude: number | null;
          neighborhood: string | null;
          operation_type: "sale" | "rent";
          orientation: string | null;
          price: number | null;
          project_id: string | null;
          property_type: string;
          published: boolean;
          section_order: number | null;
          slug: string;
          status: "draft" | "published" | "archived";
          title: string;
          title_de: string | null;
          title_en: string | null;
          total_area: number | null;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          address?: string | null;
          advisor_id?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          city?: string | null;
          construction_year?: number | null;
          created_at?: string;
          currency?: "USD" | "UYU" | "EUR" | null;
          department?: string | null;
          description?: string | null;
          description_de?: string | null;
          description_en?: string | null;
          disposition?: string | null;
          expenses?: number | null;
          featured?: boolean;
          floor?: string | null;
          garages?: number | null;
          has_balcony?: boolean;
          has_terrace?: boolean;
          hero_order?: number | null;
          id?: string;
          investment_opportunity?: boolean;
          kitchen_type?: string | null;
          land_area?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          neighborhood?: string | null;
          operation_type: "sale" | "rent";
          orientation?: string | null;
          price?: number | null;
          project_id?: string | null;
          property_type: string;
          published?: boolean;
          section_order?: number | null;
          slug: string;
          status?: "draft" | "published" | "archived";
          title: string;
          title_de?: string | null;
          title_en?: string | null;
          total_area?: number | null;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          address?: string | null;
          advisor_id?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          city?: string | null;
          construction_year?: number | null;
          created_at?: string;
          currency?: "USD" | "UYU" | "EUR" | null;
          department?: string | null;
          description?: string | null;
          description_de?: string | null;
          description_en?: string | null;
          disposition?: string | null;
          expenses?: number | null;
          featured?: boolean;
          floor?: string | null;
          garages?: number | null;
          has_balcony?: boolean;
          has_terrace?: boolean;
          hero_order?: number | null;
          id?: string;
          investment_opportunity?: boolean;
          kitchen_type?: string | null;
          land_area?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          neighborhood?: string | null;
          operation_type?: "sale" | "rent";
          orientation?: string | null;
          price?: number | null;
          project_id?: string | null;
          property_type?: string;
          published?: boolean;
          section_order?: number | null;
          slug?: string;
          status?: "draft" | "published" | "archived";
          title?: string;
          title_de?: string | null;
          title_en?: string | null;
          total_area?: number | null;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      property_features: {
        Row: {
          feature_id: string;
          property_id: string;
        };
        Insert: {
          feature_id: string;
          property_id: string;
        };
        Update: {
          feature_id?: string;
          property_id?: string;
        };
        Relationships: [];
      };
      property_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_cover: boolean;
          property_id: string;
          public_id: string | null;
          sort_order: number;
          url: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_cover?: boolean;
          property_id: string;
          public_id?: string | null;
          sort_order?: number;
          url: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_cover?: boolean;
          property_id?: string;
          public_id?: string | null;
          sort_order?: number;
          url?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          address: string | null;
          company_name: string | null;
          created_at: string;
          email: string | null;
          facebook_url: string | null;
          hero_description: string | null;
          hero_title: string | null;
          id: string;
          instagram_url: string | null;
          phone: string | null;
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          address?: string | null;
          company_name?: string | null;
          created_at?: string;
          email?: string | null;
          facebook_url?: string | null;
          hero_description?: string | null;
          hero_title?: string | null;
          id?: string;
          instagram_url?: string | null;
          phone?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          address?: string | null;
          company_name?: string | null;
          created_at?: string;
          email?: string | null;
          facebook_url?: string | null;
          hero_description?: string | null;
          hero_title?: string | null;
          id?: string;
          instagram_url?: string | null;
          phone?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      set_section_order: {
        Args: {
          p_entity_id: string;
          p_entity_type: "property" | "project";
          p_section_order: number | null;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
