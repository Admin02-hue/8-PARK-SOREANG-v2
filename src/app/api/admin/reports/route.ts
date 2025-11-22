/**
 * GET /api/admin/reports - Fetch reports data
 * Menggunakan service role untuk bypass RLS
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
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

    // Fetch semua data yang diperlukan
    const [salesResult, leadsResult, unitsResult, eventsResult, allUnitsResult] = await Promise.all([
      supabase.from('sales').select('id,unit_id,sale_price,status,created_at,buyer_name'),
      supabase.from('leads').select('id,status'),
      supabase.from('units').select('status'),
      supabase.from('marketing_events').select('id'),
      supabase.from('units').select('harga'),
    ])

    return NextResponse.json({
      sales: salesResult.data || [],
      leads: leadsResult.data || [],
      units: unitsResult.data || [],
      events: eventsResult.data || [],
      allUnits: allUnitsResult.data || [],
      errors: {
        sales: salesResult.error,
        leads: leadsResult.error,
        units: unitsResult.error,
        events: eventsResult.error,
        allUnits: allUnitsResult.error,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
