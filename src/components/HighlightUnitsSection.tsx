/**
 * Highlight Units Section
 * =======================
 * Menampilkan 3-6 unit terbaik dari Supabase
 * Fetching data langsung dari server component
 */

import React from 'react'
import Image from 'next/image'
import { createServerSupabaseClientSimple } from '@/lib/supabase'
import type { Unit } from '@/types/database.types'
import { UnitCard } from './UnitCard'
import { Button } from './Button'
import Link from 'next/link'

async function getHighlightUnits(): Promise<Unit[]> {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[HighlightUnits] Supabase credentials not configured')
      return []
    }

    const supabase = createServerSupabaseClientSimple()
    
    if (!supabase) {
      console.warn('[HighlightUnits] Gagal membuat Supabase client')
      return []
    }

    // Ambil 6 unit dengan status tersedia, urutkan by harga
    const { data: units, error } = await supabase
      .from('units')
      .select('id,name,code,luas_bangunan,luas_tanah,harga,status,thumbnail,fasilitas')
      .eq('status', 'tersedia')
      .order('harga', { ascending: false })
      .limit(6)

    if (error) {
      console.warn('[HighlightUnits] Supabase query error:', error.message)
      // Silently return empty array - database might not be ready yet
      return []
    }

    if (!units || units.length === 0) {
      console.log('[HighlightUnits] No available units found')
      return []
    }

    return units
  } catch (error) {
    console.warn('[HighlightUnits] Error fetching units:', error instanceof Error ? error.message : 'Unknown error')
    // Return empty array gracefully instead of crashing
    return []
  }
}

export async function HighlightUnitsSection() {
  const units = await getHighlightUnits()

  if (units.length === 0) {
    return (
      <section id="highlight-units" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600">
            Tidak ada unit yang tersedia saat ini
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="highlight-units"
      className="scroll-mt-16 py-20 sm:py-32 relative bg-cover bg-center"
    >
      {/* Background Image */}
      <Image
        src="/type-units-background.jpg"
        alt="Units Background"
        fill
        quality={60}
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0
        }}
      />

      {/* Overlay untuk kontras teks */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Unit Pilihan Terbaik
          </h2>
          <p className="mt-4 text-xl text-white">
            Pilihan unit terbaik dengan harga kompetitif dan lokasi strategis
          </p>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {units.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} delay={index * 0.1} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/units">
            <Button variant="primary" size="lg">
              Lihat Semua Unit ({units.length}+)
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
