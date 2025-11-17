/**
 * Supabase Client Utilities
 * ========================
 * 
 * File ini menyediakan instance Supabase client untuk berbagai konteks:
 * - Browser (client-side rendering)
 * - Server (Server Actions dan Route Handlers)
 * 
 * ATURAN KEAMANAN PENTING:
 * - ANON_KEY hanya untuk browser/public (NEXT_PUBLIC_*)
 * - SERVICE_ROLE_KEY hanya untuk server, JANGAN expose ke client
 * - Semua operasi auth-sensitive harus di server actions atau route handlers
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Browser Client - Untuk Client Side Rendering
 * Menggunakan NEXT_PUBLIC_SUPABASE_ANON_KEY yang aman
 */
export function createBrowserSupabaseClient() {
  'use client'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL atau ANON_KEY tidak tersedia. Periksa .env.local'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Server Client - Untuk Server Actions dan Route Handlers
 * Menggunakan SERVICE_ROLE_KEY yang lebih powerful (server-only)
 * 
 * PENTING: Hanya gunakan di:
 * - Server Components
 * - Server Actions
 * - Route Handlers (middleware endpoint)
 * 
 * JANGAN gunakan di:
 * - Client Components
 * - Browser-side code
 * - Public API endpoints
 */
export function createServerSupabaseClientSimple() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase URL atau SERVICE_ROLE_KEY tidak tersedia. Periksa .env.local'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
}

