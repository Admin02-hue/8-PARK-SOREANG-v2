/**
 * Home Page - 8 Park Soreang
 * ==========================
 * Halaman utama dengan hero, highlight units, keunggulan, dan promo
 */

import { Suspense } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { HighlightUnitsSection } from '@/components/HighlightUnitsSection'
import { AksesibilitasSlider } from '@/components/AksesibilitasSlider'
import { ContactCTASection } from '@/components/ContactCTASection'

export const metadata = {
  title: '8 Park Soreang - Rumah Impian Anda di Bandung',
  description:
    'Cluster perumahan modern dengan lokasi strategis, fasilitas lengkap, dan harga terjangkau. Cicilan ringan tanpa DP.',
  openGraph: {
    title: '8 Park Soreang',
    description: 'Rumah Impian Anda di Bandung',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Highlight Units Section */}
            <Suspense fallback={<div className="py-32 text-center text-gray-900 font-semibold">Loading units...</div>}>
        <HighlightUnitsSection />
      </Suspense>

      {/* Aksesibilitas Slider Section */}
      <AksesibilitasSlider />

      {/* Contact CTA Section */}
      <ContactCTASection />
    </main>
  )
}

