/**
 * Database Type Definitions
 * =========================
 * 
 * File ini berisi type definitions untuk semua table di Supabase
 * Generate dari schema Supabase atau definisikan manual
 */

export interface Unit {
  id: string
  name: string // Contoh: "Tipe 65 – Blok A"
  code: string // Contoh: "A5", "B1"
  blok: string // Blok unit
  tipe: string // Tipe unit (65, 90, 120, dll)
  luas_bangunan: number // dalam m²
  luas_tanah: number // dalam m²
  harga: number // dalam Rupiah
  status: 'tersedia' | 'booking' | 'terjual' // Status unit
  thumbnail: string | null // URL gambar thumbnail
  gallery: string[] | null // Array URL gambar gallery
  fasilitas: string | null // Deskripsi fasilitas
  spesifikasi: Record<string, unknown> | null // JSON additional specs
  created_at: string
  updated_at: string
}

export interface UnitInsert {
  name: string
  code: string
  blok: string
  tipe: string
  luas_bangunan: number
  luas_tanah: number
  harga: number
  status: 'tersedia' | 'booking' | 'terjual'
  thumbnail: string | null
  gallery: string[] | null
  fasilitas: string | null
  spesifikasi: Record<string, unknown> | null
}

export interface Lead {
  id: string
  nama_lengkap: string
  nomor_whatsapp: string
  email: string | null
  minat_unit: string | null // code dari units
  pesan: string | null
  status: 'baru' | 'contacted' | 'interested' | 'closed' // Status lead
  created_at: string
  updated_at: string
}

export interface LeadInsert {
  nama_lengkap: string
  nomor_whatsapp: string
  email: string | null
  minat_unit: string | null
  pesan: string | null
  status: 'baru' | 'contacted' | 'interested' | 'closed'
}

export interface Promotion {
  id: string
  title: string // Contoh: "RUMAH TANPA DP"
  description: string
  terms: string[] // Array syarat dan ketentuan
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PromotionInsert {
  title: string
  description: string
  terms: string[]
  is_active: boolean
}

export interface MarketingEvent {
  id: string
  event_type: 'whatsapp_click' | 'call_click' | 'lead_submit' | 'unit_view' // Tipe event
  unit_id: string | null // Reference ke units
  lead_id: string | null // Reference ke leads
  user_agent: string | null
  ip_address: string | null
  created_at: string
}

export interface Sale {
  id: string
  unit_id: string
  lead_id: string | null
  buyer_name: string
  transaction_date: string
  sale_price: number
  status: 'pending' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string // FK to auth.users
  email: string // UNIQUE
  full_name: string | null
  phone_number: string | null
  role: 'admin' | 'manager' | 'staff' | 'user'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id: string
  email: string
  full_name?: string | null
  phone_number?: string | null
  role?: 'admin' | 'manager' | 'staff' | 'user'
  is_active?: boolean
}

export interface ChatRoom {
  id: string  // UUID primary key
  guest_id: string
  created_at: string
  updated_at: string
  last_message: string | null
  last_activity: string
  is_closed: boolean
  assigned_admin: string | null
}

export interface ChatMessage {
  id: string
  room_id: string
  guest_id: string | null
  sender: 'guest' | 'admin'
  message: string
  pending: boolean
  is_read: boolean
  created_at: string
}

export interface ChatMessageInsert {
  room_id: string
  guest_id?: string | null
  sender: 'guest' | 'admin'
  message: string
  pending?: boolean
  is_read?: boolean
}

export interface AdminStatus {
  id: string
  admin_id: string
  status: 'online' | 'offline' | 'away'
  last_activity: string
  created_at: string
  updated_at: string
}

export interface ChatTyping {
  id: string
  room_id: string
  sender: 'guest' | 'admin'
  typing: boolean
  created_at: string
}

// Untuk kompatibilitas dengan Supabase client generic
export interface Database {
  public: {
    Tables: {
      units: { Row: Unit; Insert: UnitInsert; Update: Partial<UnitInsert> }
      leads: { Row: Lead; Insert: LeadInsert; Update: Partial<LeadInsert> }
      promotions: { Row: Promotion; Insert: PromotionInsert; Update: Partial<PromotionInsert> }
      marketing_events: { Row: MarketingEvent; Insert: Omit<MarketingEvent, 'id' | 'created_at'>; Update: never }
      sales: { Row: Sale; Insert: Omit<Sale, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Sale, 'id' | 'created_at' | 'updated_at'>> }
      users: { Row: User; Insert: UserInsert; Update: Partial<UserInsert> }
      chat_rooms: { Row: ChatRoom; Insert: Omit<ChatRoom, 'id' | 'created_at' | 'updated_at' | 'last_activity'>; Update: Partial<Omit<ChatRoom, 'id' | 'created_at'>> }
      chat_messages: { Row: ChatMessage; Insert: ChatMessageInsert; Update: Partial<ChatMessageInsert> }
      admin_status: { Row: AdminStatus; Insert: Omit<AdminStatus, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<AdminStatus, 'id' | 'created_at'>> }
      chat_typing: { Row: ChatTyping; Insert: Omit<ChatTyping, 'id' | 'created_at'>; Update: Partial<ChatTyping> }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

