/**
 * Script untuk menambahkan gambar detail unit ke semua blok A
 * ============================================================
 * Script ini akan update semua unit dengan blok A untuk menambahkan
 * gallery dari folder public/detail-units-a
 */

// Pastikan env variables tersedia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan')
  console.log('💡 Tips: Pastikan .env.local atau .env file sudah ada dengan variabel yang diperlukan')
  process.exit(1)
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Array gambar detail unit (6 gambar per unit)
const detailUnitImages = [
  '/detail-units-a/slide-1.jpeg',
  '/detail-units-a/slide-2.jpeg',
  '/detail-units-a/slide-3.jpeg',
  '/detail-units-a/slide-4.jpeg',
  '/detail-units-a/slide-5.jpeg',
  '/detail-units-a/slide-6.jpeg',
]

async function addGalleryToBlockA() {
  try {
    console.log('🔍 Mencari semua unit dengan blok A...')

    // Get semua unit dengan blok A
    const { data: units, error: fetchError } = await supabase
      .from('units')
      .select('*')
      .eq('blok', 'A')

    if (fetchError) {
      console.error('❌ Error mengambil data unit:', fetchError)
      process.exit(1)
    }

    if (!units || units.length === 0) {
      console.log('⚠️  Tidak ada unit dengan blok A')
      process.exit(0)
    }

    console.log(`✅ Ditemukan ${units.length} unit dengan blok A`)
    console.log(`📸 Akan menambahkan ${detailUnitImages.length} gambar ke setiap unit\n`)

    // Update setiap unit
    let successCount = 0
    let errorCount = 0

    for (const unit of units) {
      const { error: updateError } = await supabase
        .from('units')
        .update({
          gallery: detailUnitImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', unit.id)

      if (updateError) {
        console.error(`❌ Error update unit ${unit.code}:`, updateError.message)
        errorCount++
      } else {
        console.log(`✅ Unit ${unit.code} berhasil di-update dengan ${detailUnitImages.length} gambar`)
        successCount++
      }
    }

    console.log(`\n📊 Hasil Update:`)
    console.log(`   ✅ Berhasil: ${successCount}`)
    console.log(`   ❌ Gagal: ${errorCount}`)
    console.log(`\n✨ Selesai! Semua unit blok A sekarang memiliki gallery detail unit.`)
  } catch (error) {
    console.error('❌ Error tidak terduga:', error)
    process.exit(1)
  }
}

addGalleryToBlockA()
