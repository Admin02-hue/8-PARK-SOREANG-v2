/**
 * Unit Detail Page
 * ================
 * Halaman detail unit dengan gallery, spesifikasi, harga, dan CTA
 */

import React from 'react'
import { notFound } from 'next/navigation'
import { createServerSupabaseClientSimple } from '@/lib/supabase'
import type { Unit } from '@/types/database.types'
import {
  generateUnitDescription,
  generateUnitDescriptionParagraph,
  formatRupiah,
  formatLuas,
} from '@/lib/formatters'
import { UnitDetailGallery } from '@/components/UnitDetailGallery'
import { KPRSimulator } from '@/components/KPRSimulator'
import { UnitCard } from '@/components/UnitCard'
import { Button } from '@/components/Button'
import Link from 'next/link'
import { Phone, MessageSquare } from 'lucide-react'

interface UnitDetailPageProps {
  params: {
    code: string
  }
}

async function getUnitByCode(code: string): Promise<Unit | null> {
  try {
    const supabase = createServerSupabaseClientSimple()

    const { data: unit, error } = await supabase
      .from('units')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !unit) {
      return null
    }

    return unit
  } catch (error) {
    console.error('Error fetching unit:', error)
    return null
  }
}

async function getOtherUnits(
  excludeId: string,
  limit: number = 3
): Promise<Unit[]> {
  try {
    const supabase = createServerSupabaseClientSimple()

    const { data: units, error } = await supabase
      .from('units')
      .select('*')
      .neq('id', excludeId)
      .eq('status', 'tersedia')
      .limit(limit)

    if (error) {
      return []
    }

    return units || []
  } catch (error) {
    console.error('Error fetching other units:', error)
    return []
  }
}

export async function generateMetadata({ params }: UnitDetailPageProps) {
  const resolvedParams = await params
  const unit = await getUnitByCode(resolvedParams.code)

  if (!unit) {
    return {
      title: 'Unit Tidak Ditemukan',
    }
  }

  return {
    title: `${unit.name} (${unit.code}) - 8 Park Soreang`,
    description: generateUnitDescriptionParagraph(unit),
  }
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const resolvedParams = await params
  const unit = await getUnitByCode(resolvedParams.code)

  if (!unit) {
    notFound()
  }

  const otherUnits = await getOtherUnits(unit.id)
  const description = generateUnitDescription(unit)
  const descriptionParagraph = generateUnitDescriptionParagraph(unit)
  const whatsappLink = `https://wa.me/628138331503?text=Halo%2C%20saya%20tertarik%20dengan%20unit%20${unit.code}%20%28${encodeURIComponent(unit.name)}%29%20dengan%20harga%20${formatRupiah(unit.harga)}.%0A%0AMohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20ini%0A%E2%80%A2%20Simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya.`

  return (
    <main 
      className="min-h-screen scroll-mt-16 relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/page-units-background.jpg')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay untuk kontras */}
      <div className="absolute inset-0 bg-black/20" />
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-cover bg-center relative z-10" style={{ backgroundImage: "url('/page-units-background.jpg')" }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
          <div className="flex gap-2 text-sm text-white">
            <Link href="/" className="hover:text-gray-200">
              Home
            </Link>
            <span>/</span>
            <Link href="/units" className="hover:text-gray-200">
              Units
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{unit.code}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            {unit.name}
          </h1>
          <p className="text-lg text-white">{description}</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Left Column - Gallery & Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery */}
            <UnitDetailGallery
              thumbnail={unit.thumbnail}
              gallery={unit.gallery}
              unitName={unit.name}
            />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Tentang Unit
              </h2>
              <p className="text-white leading-relaxed">
                {descriptionParagraph}
              </p>
            </div>

            {/* Spesifikasi */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Spesifikasi Teknis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Luas Tanah',
                    value: formatLuas(unit.luas_tanah),
                  },
                  {
                    label: 'Luas Bangunan',
                    value: formatLuas(unit.luas_bangunan),
                  },
                  {
                    label: 'Blok',
                    value: unit.code,
                  },
                  {
                    label: 'Status',
                    value: unit.status.charAt(0).toUpperCase() + unit.status.slice(1),
                  },
                ].map((spec, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-4 text-center"
                  >
                    <p className="text-xs font-medium text-white mb-1">
                      {spec.label}
                    </p>
                    <p className="text-lg font-bold text-white">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fasilitas */}
            {unit.fasilitas && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Fasilitas
                </h2>
                <p className="text-white">{unit.fasilitas}</p>
              </div>
            )}
          </div>

          {/* Right Column - CTA & KPR */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="sticky top-4 space-y-6">
              <div className="rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-md p-6">
                <p className="text-sm text-white mb-2">Harga</p>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  {formatRupiah(unit.harga)}
                </p>

                {/* CTA Buttons */}
                <div className="space-y-3 mb-6">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="gold" fullWidth size="lg">
                      <MessageSquare className="h-5 w-5" />
                      Chat WhatsApp
                    </Button>
                  </a>

                  <a href="tel:+628138331503">
                    <Button variant="secondary" fullWidth size="lg">
                      <Phone className="h-5 w-5" />
                      Hubungi
                    </Button>
                  </a>

                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" fullWidth size="lg">
                      <MessageSquare className="h-5 w-5" />
                      Chat WhatsApp
                    </Button>
                  </a>
                </div>

                {/* Info Box */}
                <div className="rounded-lg bg-white/10 backdrop-blur-md border border-white/20 p-3 text-sm text-white">
                  <p>
                    <strong>Bonus:</strong> Promo tanpa DP, cukup booking 10 juta!
                  </p>
                </div>
              </div>

              {/* KPR Simulator */}
              <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-6">
                <KPRSimulator harga={unit.harga} />
              </div>
            </div>
          </div>
        </div>

        {/* Other Units Section */}
        {otherUnits.length > 0 && (
          <div className="pt-16 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-white mb-8">
              Unit Lainnya yang Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherUnits.map((u, index) => (
                <UnitCard key={u.id} unit={u} delay={index * 0.1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
