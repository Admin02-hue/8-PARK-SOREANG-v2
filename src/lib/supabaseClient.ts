'use client'

/**
 * ⚠️ DEPRECATED: Gunakan './supabase.ts' sebagai gantinya
 * 
 * File ini hanya untuk backward compatibility.
 * Semua browser clients sekarang menggunakan singleton pattern dari supabase.ts
 * untuk menghindari multiple GoTrueClient instances
 */

export { createBrowserSupabaseClient as supabase } from './supabase'

