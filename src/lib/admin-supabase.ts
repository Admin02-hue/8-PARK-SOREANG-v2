/**
 * Admin Supabase Client
 * =====================
 * Client khusus untuk admin queries yang memerlukan bypass RLS
 * Menggunakan service role key dari server-side environment
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Admin client untuk server-side queries yang memerlukan bypass RLS
// ⚠️ PENTING: Jangan gunakan di browser! Hanya di server actions/route handlers
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    console.warn('⚠️ Admin Supabase client tidak ter-config dengan benar')
    // Fallback ke browser client
    return createBrowserSupabaseClientForAdmin()
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Fallback ke client biasa dengan workaround RLS
export function createBrowserSupabaseClientForAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase URL dan anon key harus di-config')
  }

  return createClient<Database>(url, anonKey)
}
