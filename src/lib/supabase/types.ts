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
          slug: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string | null;
          project_id: string | null;
          project_unit_id: string | null;
          property_id: string | null;
          source: string | null;
          status: "new" | "contacted" | "closed";
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
          project_id?: string | null;
          project_unit_id?: string | null;
          property_id?: string | null;
          source?: string | null;
          status?: "new" | "contacted" | "closed";
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
          project_id?: string | null;
          project_unit_id?: string | null;
          property_id?: string | null;
          source?: string | null;
          status?: "new" | "contacted" | "closed";
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
          construction_status: "planned" | "under_construction" | "finished";
          created_at: string;
          department: string | null;
          description: string | null;
          developer_name: string | null;
          estimated_delivery_date: string | null;
          featured: boolean;
          id: string;
          is_investment_opportunity: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          neighborhood: string | null;
          published: boolean;
          slug: string;
          city: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          construction_status?: "planned" | "under_construction" | "finished";
          created_at?: string;
          department?: string | null;
          description?: string | null;
          developer_name?: string | null;
          estimated_delivery_date?: string | null;
          featured?: boolean;
          id?: string;
          is_investment_opportunity?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          neighborhood?: string | null;
          published?: boolean;
          slug: string;
          city?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          construction_status?: "planned" | "under_construction" | "finished";
          created_at?: string;
          department?: string | null;
          description?: string | null;
          developer_name?: string | null;
          estimated_delivery_date?: string | null;
          featured?: boolean;
          id?: string;
          is_investment_opportunity?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          neighborhood?: string | null;
          published?: boolean;
          slug?: string;
          city?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          built_area: number | null;
          city: string | null;
          construction_year: number | null;
          created_at: string;
          currency: "USD" | "UYU" | "EUR" | null;
          department: string | null;
          description: string | null;
          expenses: number | null;
          featured: boolean;
          garages: number | null;
          id: string;
          investment_opportunity: boolean;
          land_area: number | null;
          latitude: number | null;
          longitude: number | null;
          neighborhood: string | null;
          operation_type: "sale" | "rent";
          price: number | null;
          property_type: string;
          published: boolean;
          slug: string;
          status: "draft" | "published" | "archived";
          title: string;
          total_area: number | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          city?: string | null;
          construction_year?: number | null;
          created_at?: string;
          currency?: "USD" | "UYU" | "EUR" | null;
          department?: string | null;
          description?: string | null;
          expenses?: number | null;
          featured?: boolean;
          garages?: number | null;
          id?: string;
          investment_opportunity?: boolean;
          land_area?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          neighborhood?: string | null;
          operation_type: "sale" | "rent";
          price?: number | null;
          property_type: string;
          published?: boolean;
          slug: string;
          status?: "draft" | "published" | "archived";
          title: string;
          total_area?: number | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          city?: string | null;
          construction_year?: number | null;
          created_at?: string;
          currency?: "USD" | "UYU" | "EUR" | null;
          department?: string | null;
          description?: string | null;
          expenses?: number | null;
          featured?: boolean;
          garages?: number | null;
          id?: string;
          investment_opportunity?: boolean;
          land_area?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          neighborhood?: string | null;
          operation_type?: "sale" | "rent";
          price?: number | null;
          property_type?: string;
          published?: boolean;
          slug?: string;
          status?: "draft" | "published" | "archived";
          title?: string;
          total_area?: number | null;
          updated_at?: string;
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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
