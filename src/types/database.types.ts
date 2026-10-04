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
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: 'RENTER' | 'HOST' | 'ADMIN';
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role?: 'RENTER' | 'HOST' | 'ADMIN';
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: 'RENTER' | 'HOST' | 'ADMIN';
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      properties: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string;
          property_type: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'PG' | 'HOSTEL' | 'VILLA' | 'BUNGALOW' | 'COMMERCIAL' | 'SHOP' | 'OFFICE' | 'OTHER';
          rent_amount: number;
          deposit_amount: number;
          maintenance_amount: number;
          maintenance_included: boolean;
          address: string;
          city: string;
          locality: string;
          state: string;
          zip_code: string;
          latitude: number | null;
          longitude: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqft: number | null;
          furnishing_status: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED' | null;
          available_from: string | null;
          status: 'AVAILABLE' | 'RENTED' | 'PAUSED' | 'DRAFT';
          verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description: string;
          property_type: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'PG' | 'HOSTEL' | 'VILLA' | 'BUNGALOW' | 'COMMERCIAL' | 'SHOP' | 'OFFICE' | 'OTHER';
          rent_amount: number;
          deposit_amount: number;
          maintenance_amount?: number;
          maintenance_included?: boolean;
          address: string;
          city: string;
          locality: string;
          state: string;
          zip_code: string;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqft?: number | null;
          furnishing_status?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED' | null;
          available_from?: string | null;
          status?: 'AVAILABLE' | 'RENTED' | 'PAUSED' | 'DRAFT';
          verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string;
          property_type?: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'PG' | 'HOSTEL' | 'VILLA' | 'BUNGALOW' | 'COMMERCIAL' | 'SHOP' | 'OFFICE' | 'OTHER';
          rent_amount?: number;
          deposit_amount?: number;
          maintenance_amount?: number;
          maintenance_included?: boolean;
          address?: string;
          city?: string;
          locality?: string;
          state?: string;
          zip_code?: string;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqft?: number | null;
          furnishing_status?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED' | null;
          available_from?: string | null;
          status?: 'AVAILABLE' | 'RENTED' | 'PAUSED' | 'DRAFT';
          verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      amenities: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      property_amenities: {
        Row: {
          property_id: string;
          amenity_id: string;
        };
        Insert: {
          property_id: string;
          amenity_id: string;
        };
        Update: {
          property_id?: string;
          amenity_id?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      enquiries: {
        Row: {
          id: string;
          property_id: string;
          renter_id: string;
          message: string;
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          renter_id: string;
          message: string;
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          renter_id?: string;
          message?: string;
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      saved_properties: {
        Row: {
          renter_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          renter_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          renter_id?: string;
          property_id?: string;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          property_id: string | null;
          reason: string;
          description: string | null;
          status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          property_id?: string | null;
          reason: string;
          description?: string | null;
          status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          property_id?: string | null;
          reason?: string;
          description?: string | null;
          status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Relationships: any[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
      is_suspended: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'RENTER' | 'HOST' | 'ADMIN';
      property_category: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'PG' | 'HOSTEL' | 'VILLA' | 'BUNGALOW' | 'COMMERCIAL' | 'SHOP' | 'OFFICE' | 'OTHER';
      property_status: 'AVAILABLE' | 'RENTED' | 'PAUSED' | 'DRAFT';
      verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
      furnishing_status: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
      enquiry_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
      report_status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}


