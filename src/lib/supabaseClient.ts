'use client'

import { createClient } from '@supabase/supabase-js'

/**
 * 📡 Supabase Client Setup untuk Live Chat Realtime
 * FILE: src/lib/supabaseClient.ts
 * GUNAKAN: Untuk koneksi ke database dan realtime listeners
 * 
 * Environment Variables yang diperlukan:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // Max events per second
      },
    },
  }
)
