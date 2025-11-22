/**
 * GET /api/admin/leads - Fetch leads data
 * Menggunakan service role untuk bypass RLS
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
    // Create admin client dengan service role
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    const { data, error } = await supabase
      .from('leads')
      .select('id,nama_lengkap,email,nomor_whatsapp,status,created_at,updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Error fetching leads:', error.message)
      // Return empty array instead of error - client will handle gracefully
      return NextResponse.json([], { status: 200 })
    }

    // Always ensure we return an array
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[API] Error in leads route:', error instanceof Error ? error.message : 'Unknown error')
    // Return empty array on error for graceful degradation
    return NextResponse.json([], { status: 200 })
  }
}

export async function PUT(request: Request) {
  try {
    // Create admin client dengan service role
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID dan status diperlukan' },
        { status: 400 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating lead status:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Status berhasil diubah',
      data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
