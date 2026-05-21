// TypeScript mirror of supabase/migrations/001_initial_schema.sql
// Re-generate with: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MultilingualText = {
  en: string;
  es: string;
  fr: string;
  de: string;
  it: string;
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PriceUnit = "per_hour" | "per_session" | "flat" | "per_item";

// ── Row types ───────────────────────────────────────────────────
type GuestSessionRow = {
  id: string;
  access_token: string;
  guest_name: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  notes: string | null;
  welcome_message: string | null;
  created_at: string;
};
type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: MultilingualText;
  icon: string;
  sort_order: number;
  is_active: boolean;
};
type ServiceRow = {
  id: string;
  category_id: string;
  slug: string;
  name: MultilingualText;
  description: MultilingualText | null;
  base_price: number;
  price_unit: PriceUnit;
  min_duration_hours: number | null;
  max_duration_hours: number | null;
  requires_scheduling: boolean;
  is_active: boolean;
  sort_order: number;
};
type ProviderRow = {
  id: string;
  user_id: string | null;
  name: string;
  bio: MultilingualText | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
};
type ProviderServiceRow = {
  id: string;
  provider_id: string;
  service_id: string;
  custom_price: number | null;
  is_available: boolean;
};
type AvailabilitySlotRow = {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  created_at: string;
};
type BookingRow = {
  id: string;
  guest_session_id: string;
  provider_service_id: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  quantity: number;
  special_requests: string | null;
  status: BookingStatus;
  total_amount: number;
  provider_amount: number;
  platform_amount: number;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: PaymentStatus;
  cancelled_by: "guest" | "provider" | "admin" | null;
  created_at: string;
  updated_at: string;
};

// ── Database interface ─────────────────────────────────────────
// Supabase's postgrest-js requires each table entry to have Row, Insert,
// Update, AND Relationships. Omitting Relationships resolves the table
// type to `never`, breaking all .insert() / .update() calls.
export interface Database {
  public: {
    Tables: {
      stripe_webhook_events: {
        Row:           { id: string; processed_at: string };
        Insert:        { id: string; processed_at?: string };
        Update:        { processed_at?: string };
        Relationships: [];
      };
      guest_sessions: {
        Row: GuestSessionRow;
        Insert: Omit<GuestSessionRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<GuestSessionRow, "id">>;
        Relationships: [];
      };
      service_categories: {
        Row: ServiceCategoryRow;
        Insert: Omit<ServiceCategoryRow, "id"> & { id?: string };
        Update: Partial<Omit<ServiceCategoryRow, "id">>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, "id"> & { id?: string };
        Update: Partial<Omit<ServiceRow, "id">>;
        Relationships: [];
      };
      providers: {
        Row: ProviderRow;
        Insert: {
          id?: string;
          user_id?: string | null;   // optional FK to auth.users
          name: string;
          bio?: MultilingualText | null;
          photo_url?: string | null;
          phone?: string | null;
          email?: string | null;
          commission_rate?: number;  // has DEFAULT 0.850
          is_active?: boolean;       // has DEFAULT true
          created_at?: string;
        };
        Update: Partial<Omit<ProviderRow, "id">>;
        Relationships: [];
      };
      provider_services: {
        Row: ProviderServiceRow;
        Insert: {
          id?: string;
          provider_id: string;
          service_id: string;
          custom_price?: number | null;  // overrides base_price; nullable
          is_available?: boolean;        // DEFAULT true
        };
        Update: Partial<Omit<ProviderServiceRow, "id">>;
        Relationships: [];
      };
      availability_slots: {
        Row: AvailabilitySlotRow;
        Insert: Omit<AvailabilitySlotRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<AvailabilitySlotRow, "id">>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: {
          id?: string;
          guest_session_id: string;
          provider_service_id: string;
          booking_date: string;
          start_time?: string | null;
          end_time?: string | null;
          quantity?: number;                    // DEFAULT 1
          special_requests?: string | null;
          status?: BookingStatus;               // DEFAULT 'pending'
          total_amount: number;
          provider_amount: number;
          platform_amount: number;
          stripe_payment_intent_id?: string | null;
          stripe_payment_status?: PaymentStatus; // DEFAULT 'pending'
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BookingRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience aliases
export type GuestSession     = GuestSessionRow;
export type ServiceCategory  = ServiceCategoryRow;
export type Service          = ServiceRow;
export type Provider         = ProviderRow;
export type ProviderService  = ProviderServiceRow;
export type AvailabilitySlot = AvailabilitySlotRow;
export type Booking          = BookingRow;
