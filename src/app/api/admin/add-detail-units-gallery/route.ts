/**
 * API Route untuk menambahkan gambar detail unit ke blok A
 * =========================================================
 */

import { createClient } from '@supabase/supabase-js'
import type { Unit } from '@/types/database.types'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Verifikasi method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method tidak diperbolehkan' },
        { status: 405 }
      )
    }

    // Setup Supabase client dengan explicit typing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Environment variables tidak tersedia' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Array gambar detail unit (6 gambar)
    const detailUnitImages = [
      '/detail-units-a/slide-1.jpeg',
      '/detail-units-a/slide-2.jpeg',
      '/detail-units-a/slide-3.jpeg',
      '/detail-units-a/slide-4.jpeg',
      '/detail-units-a/slide-5.jpeg',
      '/detail-units-a/slide-6.jpeg',
    ]

    console.log('🔍 Mencari semua unit dengan blok A...')

    // Ambil semua unit dengan blok A dengan typing yang benar
    const { data: units, error: fetchError } = await supabase
      .from('units')
      .select('*')
      .eq('blok', 'A')
      .returns<Unit[]>()

    if (fetchError) {
      console.error('Error mengambil data unit:', fetchError)
      return NextResponse.json(
        { error: 'Gagal mengambil data unit: ' + fetchError.message },
        { status: 500 }
      )
    }

    if (!units || units.length === 0) {
      return NextResponse.json(
        { message: 'Tidak ada unit dengan blok A', updated: 0 },
        { status: 200 }
      )
    }

    console.log(`✅ Ditemukan ${units.length} unit dengan blok A`)

    // Update setiap unit
    let successCount = 0
    let failedUnits: Array<{ code: string; error: string }> = []

    for (const unit of units) {
      const updateData: Partial<Unit> = {
        gallery: detailUnitImages,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('units')
        .update(updateData)
        .eq('id', unit.id)

      if (updateError) {
        console.error(`❌ Error update unit ${unit.code}:`, updateError.message)
        failedUnits.push({
          code: unit.code,
          error: updateError.message,
        })
      } else {
        console.log(
          `✅ Unit ${unit.code} berhasil di-update dengan ${detailUnitImages.length} gambar`
        )
        successCount++
      }
    }

    return NextResponse.json(
      {
        message: 'Proses selesai',
        total: units.length,
        updated: successCount,
        failed: failedUnits.length,
        failedUnits: failedUnits,
        details: `${successCount} unit berhasil di-update, ${failedUnits.length} unit gagal`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error tidak terduga:', error)
    return NextResponse.json(
      { error: 'Error tidak terduga: ' + String(error) },
      { status: 500 }
    )
  }
}
