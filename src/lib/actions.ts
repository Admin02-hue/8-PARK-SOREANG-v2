/**
 * Server Actions - Operasi Backend
 * ================================
 * 
 * File ini berisi semua Server Actions yang:
 * - Menggunakan SERVICE_ROLE_KEY (secure)
 * - Menangani lead submission
 * - Tracking marketing events
 * - Update status unit (admin only)
 * 
 * ATURAN:
 * - Selalu pakai "use server" di atas
 * - Validasi input ketat dengan Zod
 * - Jangan expose data sensitif
 * - Log semua operasi penting
 */

'use server'

import { createServerSupabaseClientSimple } from '@/lib/supabase'
import type { LeadInsert, MarketingEvent } from '@/types/database.types'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const SubmitLeadSchema = z.object({
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  nomor_whatsapp: z
    .string()
    .regex(/^62\d{9,12}$/, 'Format WhatsApp: 62812345678'),
  email: z.string().email().optional().or(z.literal('')),
  minat_unit: z.string().uuid().optional().or(z.literal('')),
  pesan: z.string().max(500).optional().or(z.literal('')),
})

const TrackEventSchema = z.object({
  event_type: z.enum(['whatsapp_click', 'call_click', 'lead_submit', 'unit_view']),
  unit_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
})

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Submit lead dari contact form
 * - Validasi input
 * - Simpan ke Supabase
 * - Track event marketing
 */
export async function submitLead(
  formData: unknown
): Promise<{
  success: boolean
  message: string
  leadId?: string
  error?: string
}> {
  try {
    // Validasi input
    const validatedData = SubmitLeadSchema.parse(formData)

    const supabase = createServerSupabaseClientSimple()

    // Insert lead ke database
    const { data: lead, error: insertError } = await ((supabase as any)
      .from('leads')
      .insert([
        {
          nama_lengkap: validatedData.nama_lengkap,
          nomor_whatsapp: validatedData.nomor_whatsapp,
          email: validatedData.email || null,
          minat_unit: validatedData.minat_unit || null,
          pesan: validatedData.pesan || null,
          status: 'baru',
        },
      ])
      .select('id')
      .single())

    if (insertError) {
      console.error('Error inserting lead:', insertError)
      return {
        success: false,
        message: 'Gagal menyimpan data lead',
        error: insertError.message,
      }
    }

    // Track event
    await trackMarketingEvent({
      event_type: 'lead_submit',
      lead_id: lead.id,
    })

    return {
      success: true,
      message: 'Lead berhasil disimpan. Tim marketing akan menghubungi Anda segera.',
      leadId: lead.id,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Data tidak valid',
        error: error.errors[0].message,
      }
    }

    console.error('Error in submitLead:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan internal',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Track marketing events
 * - WhatsApp clicks
 * - Call clicks
 * - Unit views
 * - Lead submissions
 */
export async function trackMarketingEvent(
  eventData: unknown
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Validasi input
    const validatedData = TrackEventSchema.parse(eventData)

    const supabase = createServerSupabaseClientSimple()

    const { error } = await ((supabase as any).from('marketing_events').insert({
      event_type: validatedData.event_type,
      unit_id: validatedData.unit_id || null,
      lead_id: validatedData.lead_id || null,
      user_agent: null, // Optional: bisa diambil dari headers
      ip_address: null, // Optional: bisa diambil dari headers
    }))

    if (error) {
      console.error('Error tracking event:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in trackMarketingEvent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update status unit (Admin Only)
 * - Validasi token admin
 * - Update status di database
 */
export async function updateUnitStatus(
  unitId: string,
  newStatus: 'tersedia' | 'booking' | 'terjual'
): Promise<{
  success: boolean
  message: string
  error?: string
}> {
  try {
    // TODO: Add admin authentication check
    // Validasi: pastikan ini dipanggil dari context admin

    const supabase = createServerSupabaseClientSimple()

    const { error } = await ((supabase as any)
      .from('units')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unitId))

    if (error) {
      console.error('Error updating unit status:', error)
      return {
        success: false,
        message: 'Gagal update status unit',
        error: error.message,
      }
    }

    return {
      success: true,
      message: `Status unit berhasil diubah menjadi ${newStatus}`,
    }
  } catch (error) {
    console.error('Error in updateUnitStatus:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan internal',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get lead statistics (untuk admin dashboard)
 */
export async function getLeadStatistics(): Promise<{
  total: number
  baru: number
  contacted: number
  interested: number
  closed: number
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClientSimple()

    // Query dengan aggregation
    const { data: leads, error } = await ((supabase as any)
      .from('leads')
      .select('status'))

    if (error) {
      throw error
    }

    const stats = {
      total: leads?.length || 0,
      baru: leads?.filter((l: any) => l.status === 'baru').length || 0,
      contacted: leads?.filter((l: any) => l.status === 'contacted').length || 0,
      interested: leads?.filter((l: any) => l.status === 'interested').length || 0,
      closed: leads?.filter((l: any) => l.status === 'closed').length || 0,
    }

    return stats
  } catch (error) {
    console.error('Error in getLeadStatistics:', error)
    return {
      total: 0,
      baru: 0,
      contacted: 0,
      interested: 0,
      closed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get unit statistics (untuk admin dashboard)
 */
export async function getUnitStatistics(): Promise<{
  total: number
  tersedia: number
  booking: number
  terjual: number
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClientSimple()

    const { data: units, error } = await ((supabase as any)
      .from('units')
      .select('status'))

    if (error) {
      throw error
    }

    const stats = {
      total: units?.length || 0,
      tersedia: units?.filter((u: any) => u.status === 'tersedia').length || 0,
      booking: units?.filter((u: any) => u.status === 'booking').length || 0,
      terjual: units?.filter((u: any) => u.status === 'terjual').length || 0,
    }

    return stats
  } catch (error) {
    console.error('Error in getUnitStatistics:', error)
    return {
      total: 0,
      tersedia: 0,
      booking: 0,
      terjual: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
