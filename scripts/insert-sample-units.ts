/**
 * Script untuk insert sample units data ke Supabase
 * Jalankan: npx tsx scripts/insert-sample-units.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL atau SERVICE_ROLE_KEY tidak ditemukan')
  console.error('Pastikan file .env.local sudah dikonfigurasi')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleUnits = [
  {
    name: 'Rumah Tipe 65 - Blok A',
    code: 'A-001',
    blok: 'A',
    tipe: '65',
    luas_bangunan: 65,
    luas_tanah: 120,
    harga: 450000000,
    status: 'tersedia',
    thumbnail: null,
    gallery: null,
    fasilitas: 'Garasi, Taman Minimalis',
    spesifikasi: {
      kamar_tidur: 2,
      kamar_mandi: 1,
      parkir: 1,
    },
  },
  {
    name: 'Rumah Tipe 90 - Blok B',
    code: 'B-001',
    blok: 'B',
    tipe: '90',
    luas_bangunan: 90,
    luas_tanah: 150,
    harga: 650000000,
    status: 'tersedia',
    thumbnail: null,
    gallery: null,
    fasilitas: 'Garasi, Taman, Ruang Keluarga Luas',
    spesifikasi: {
      kamar_tidur: 3,
      kamar_mandi: 2,
      parkir: 1,
    },
  },
  {
    name: 'Rumah Tipe 120 - Blok C',
    code: 'C-001',
    blok: 'C',
    tipe: '120',
    luas_bangunan: 120,
    luas_tanah: 200,
    harga: 850000000,
    status: 'booking',
    thumbnail: null,
    gallery: null,
    fasilitas: 'Garasi 2, Taman Luas, Ruang Kerja',
    spesifikasi: {
      kamar_tidur: 4,
      kamar_mandi: 3,
      parkir: 2,
    },
  },
  {
    name: 'Rumah Tipe 150 - Blok D',
    code: 'D-001',
    blok: 'D',
    tipe: '150',
    luas_bangunan: 150,
    luas_tanah: 250,
    harga: 1200000000,
    status: 'terjual',
    thumbnail: null,
    gallery: null,
    fasilitas: 'Garasi 2, Kolam Renang, Taman Besar',
    spesifikasi: {
      kamar_tidur: 5,
      kamar_mandi: 4,
      parkir: 2,
    },
  },
]

async function insertSampleUnits() {
  try {
    console.log('📝 Memulai insert sample units...')
    
    // First, delete existing units to avoid duplicates
    const { error: deleteError } = await supabase
      .from('units')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.warn('⚠️ Warning saat menghapus units lama:', deleteError.message)
    }

    // Insert sample units
    const { data, error } = await supabase
      .from('units')
      .insert(sampleUnits)
      .select()

    if (error) {
      console.error('❌ Error inserting units:', error)
      process.exit(1)
    }

    console.log('✅ Berhasil insert', data?.length, 'units')
    console.log('📋 Data yang diinsert:')
    data?.forEach((unit: any) => {
      console.log(`   - ${unit.code}: ${unit.name} (${unit.status})`)
    })

    console.log('\n✨ Sample units berhasil ditambahkan!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

insertSampleUnits()
