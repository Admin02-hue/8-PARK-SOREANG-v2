/**
 * Home Page - 8 Park Soreang
 * ==========================
 * Halaman utama dengan hero, highlight units, keunggulan, dan promo
 */

import { Suspense } from 'react'
import Script from 'next/script'
import { HeroSection } from '@/components/HeroSection'
import { HighlightUnitsSection } from '@/components/HighlightUnitsSection'
import { AksesibilitasSlider } from '@/components/AksesibilitasSlider'
import { RequestBrochureSection } from '@/components/RequestBrochureSection'
import { ContactCTASection } from '@/components/ContactCTASection'
import { SEOContentSection } from '@/components/SEOContentSection'
import { ExpandableFAQSection } from '@/components/ExpandableFAQSection'

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

export default async function Home() {
  return (
    <main className="min-h-screen w-full bg-white">
      <Script
        id="residence-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Residence',
            'name': 'Cluster 8 Park Soreang',
          })
        }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Highlight Units - test only */}
      <div className="py-32 text-center">Sections here...</div>
    </main>
  )
}

