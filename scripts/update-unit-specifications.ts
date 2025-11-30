/**
 * Script untuk update spesifikasi detail unit Blok A dan B
 * Jalankan: npx tsx scripts/update-unit-specifications.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read .env.local manually
const envPath = join(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=')
    const value = valueParts.join('=').replace(/^"/, '').replace(/"$/, '')
    if (key) {
      envVars[key.trim()] = value
    }
  }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || ''
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL atau SERVICE_ROLE_KEY tidak ditemukan')
  console.error('Pastikan file .env.local sudah dikonfigurasi')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Blok A Tipe 65 specifications
const blokaSpecifications = {
  '2 Kamar Tidur': true,
  '2 Kamar Mandi': true,
  'Dapur': true,
  'Ruang Tamu & Ruang Keluarga': true,
  'Carport': true,
  'Taman depan dan samping': true,
  'Ruang Terbuka Hijau': true,
  'Listrik 2200 Watt': true,
}

// Blok B Tipe 90 specifications
const blokbSpecifications = {
  '3 Kamar Tidur': true,
  '3 Kamar Mandi': true,
  'Dapur': true,
  'Ruang Tamu & Ruang Keluarga': true,
  'Carport': true,
  'Taman Depan': true,
  'Listrik 2200 Watt': true,
}

async function updateUnitSpecifications() {
  try {
    console.log('📝 Memulai update spesifikasi unit...')

    // Update Blok A units
    console.log('🔄 Mengupdate Blok A...')
    const { data: blokaUnits, error: blokaError } = await supabase
      .from('units')
      .select('id, code, tipe')
      .ilike('code', 'A%')

    if (blokaError) {
      console.error('❌ Error fetching Blok A units:', blokaError)
    } else if (blokaUnits) {
      for (const unit of blokaUnits) {
        const { error: updateError } = await supabase
          .from('units')
          .update({ spesifikasi: blokaSpecifications })
          .eq('id', unit.id)

        if (updateError) {
          console.error(`❌ Error updating unit ${unit.code}:`, updateError)
        } else {
          console.log(`✅ Updated ${unit.code} (Blok A)`)
        }
      }
    }

    // Update Blok B units
    console.log('🔄 Mengupdate Blok B...')
    const { data: blokbUnits, error: blokbError } = await supabase
      .from('units')
      .select('id, code, tipe')
      .ilike('code', 'B%')

    if (blokbError) {
      console.error('❌ Error fetching Blok B units:', blokbError)
    } else if (blokbUnits) {
      for (const unit of blokbUnits) {
        const { error: updateError } = await supabase
          .from('units')
          .update({ spesifikasi: blokbSpecifications })
          .eq('id', unit.id)

        if (updateError) {
          console.error(`❌ Error updating unit ${unit.code}:`, updateError)
        } else {
          console.log(`✅ Updated ${unit.code} (Blok B)`)
        }
      }
    }

    console.log('✅ Selesai update spesifikasi unit!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

updateUnitSpecifications()
