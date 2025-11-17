/**
 * Script untuk menambahkan gambar detail unit ke semua blok B
 * ============================================================
 * Script ini akan update semua unit dengan blok B untuk menambahkan
 * gallery dari folder public/detail-units-b
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan')
  console.log('💡 Tips: Pastikan .env.local atau .env file sudah ada dengan variabel yang diperlukan')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Array gambar detail unit B (6 gambar per unit)
const detailUnitImages = [
  '/detail-units-b/Type-B-1.jpeg',
  '/detail-units-b/Type-B-2.jpeg',
  '/detail-units-b/Type-B-3.jpeg',
  '/detail-units-b/Type-B-4.jpeg',
  '/detail-units-b/Type-B-5.jpeg',
  '/detail-units-b/Type-B-6.jpeg',
]

async function addGalleryToBlockB() {
  try {
    console.log('🔍 Mencari semua unit dengan blok B...')

    // Get semua unit dengan blok B
    const { data: units, error: fetchError } = await supabase
      .from('units')
      .select('*')
      .eq('blok', 'B')

    if (fetchError) {
      console.error('❌ Error mengambil data unit:', fetchError)
      process.exit(1)
    }

    if (!units || units.length === 0) {
      console.log('⚠️  Tidak ada unit dengan blok B')
      process.exit(0)
    }

    console.log(`✅ Ditemukan ${units.length} unit dengan blok B`)
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
    console.log(`\n✨ Selesai! Semua unit blok B sekarang memiliki gallery detail unit.`)
  } catch (error) {
    console.error('❌ Error tidak terduga:', error)
    process.exit(1)
  }
}

addGalleryToBlockB()
