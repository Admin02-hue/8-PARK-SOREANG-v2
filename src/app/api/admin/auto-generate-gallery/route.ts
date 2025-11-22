/**
 * API Route untuk auto-generate gallery unit berdasarkan blok
 * ===========================================================
 * Ketika admin tambah unit baru, otomatis generate detail UI 
 * dengan gallery dari folder detail-units-a atau detail-units-b
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { unitId, blok } = body

    // Validasi input
    if (!unitId || !blok) {
      return NextResponse.json(
        { error: 'unitId dan blok harus disediakan' },
        { status: 400 }
      )
    }

    // Setup Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Environment variables tidak tersedia' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Tentukan folder gallery berdasarkan blok
    let galleryFolder = 'detail-units-a' // Default ke blok A
    
    if (blok.toUpperCase() === 'B') {
      galleryFolder = 'detail-units-b'
    }

    // Array gambar untuk masing-masing folder
    // Blok A: 6 gambar (slide-1 hingga slide-6)
    // Blok B: 6 gambar (Type-B-1 hingga Type-B-6)
    const galleryImages = blok.toUpperCase() === 'B'
      ? [
          '/detail-units-b/Type-B-1.jpeg',
          '/detail-units-b/Type-B-2.jpeg',
          '/detail-units-b/Type-B-3.jpeg',
          '/detail-units-b/Type-B-4.jpeg',
          '/detail-units-b/Type-B-5.jpeg',
          '/detail-units-b/Type-B-6.jpeg',
        ]
      : [
          '/detail-units-a/slide-1.jpeg',
          '/detail-units-a/slide-2.jpeg',
          '/detail-units-a/slide-3.jpeg',
          '/detail-units-a/slide-4.jpeg',
          '/detail-units-a/slide-5.jpeg',
          '/detail-units-a/slide-6.jpeg',
        ]

    console.log(`🎨 Auto-generating gallery untuk unit ID ${unitId} (Blok ${blok})...`)
    console.log(`📁 Menggunakan folder: ${galleryFolder}`)
    console.log(`📸 Gambar yang akan ditambahkan:`, galleryImages)

    // Update unit dengan gallery
    const { data, error } = await supabase
      .from('units')
      .update({
        gallery: galleryImages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unitId)
      .select()

    if (error) {
      console.error('❌ Error auto-generate gallery:', error.message)
      return NextResponse.json(
        { error: `Gagal auto-generate gallery: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Unit tidak ditemukan atau tidak ter-update')
      return NextResponse.json(
        { error: 'Unit tidak ditemukan' },
        { status: 404 }
      )
    }

    console.log(`✅ Gallery berhasil di-generate untuk unit: ${data[0].code}`)

    return NextResponse.json({
      success: true,
      message: `Gallery auto-generated untuk Blok ${blok}`,
      unitId,
      blok,
      galleryFolder,
      imageCount: galleryImages.length,
      images: galleryImages,
    })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/auto-generate-gallery
 * Untuk test/debug - lihat folder yang tersedia
 */
export async function GET() {
  return NextResponse.json({
    message: 'Auto-generate gallery API',
    usage: 'POST dengan { unitId, blok }',
    supportedBlocks: ['A', 'B'],
    folders: {
      A: '/detail-units-a/',
      B: '/detail-units-b/',
    },
  })
}
