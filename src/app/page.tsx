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
      {/* JSON-LD Schema Markup - Residence */}
      <Script
        id="residence-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Residence',
            'name': 'Cluster 8 Park Soreang',
            'description': 'Cluster eksklusif di Bandung Selatan dekat Tol Soroja dengan unit premium dan cicilan KPR ringan',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Soreang',
              'addressRegion': 'Bandung Selatan',
              'addressCountry': 'ID'
            },
            'geo': {
              '@type': 'GeoCoordinates',
              'latitude': -7.024452,
              'longitude': 107.528099
            },
            'amenityFeature': [
              { '@type': 'LocationFeatureSpecification', 'name': 'Dekat Tol Soroja' },
              { '@type': 'LocationFeatureSpecification', 'name': 'Cluster Eksklusif' },
              { '@type': 'LocationFeatureSpecification', 'name': 'Lingkungan Premium' },
              { '@type': 'LocationFeatureSpecification', 'name': 'KPR Tersedia' },
              { '@type': 'LocationFeatureSpecification', 'name': 'One-Gate System' }
            ]
          })
        }}
      />

      {/* JSON-LD Schema Markup - FAQ */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'Di mana lokasi pasti Cluster 8 Park Soreang?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Berada di kawasan Soreang Bandung Selatan, 2 menit dari Tol Soroja dan dekat Alun-Alun Soreang. Lokasi ini sangat strategis dengan akses mudah ke berbagai pusat kegiatan di Bandung.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Apakah cluster ini bebas banjir?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Ya. Lokasi berada di zona aman, bukan area rawan banjir. Ketinggian lokasi dan sistem drainase yang baik menjamin keamanan dari banjir sepanjang tahun.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Berapa tipe rumah yang tersedia?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Ada Tipe A dan Tipe B dengan spesifikasi modern minimalis. Setiap tipe dirancang dengan efisiensi ruang, material berkualitas, dan finishing premium yang nyaman untuk keluarga.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Apakah bisa KPR?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Bisa, tersedia Bank rekanan dengan proses yang mudah dan cepat. Kami bekerja sama dengan berbagai bank terkemuka untuk memudahkan cicilan KPR Anda dengan bunga kompetitif.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Apakah dekat fasilitas umum?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Ya, dekat Pemda, Stadion Jalak Harupat, sekolah, pasar, rumah sakit, dan berbagai pusat belanja lainnya. Lokasi yang sempurna untuk kebutuhan sehari-hari keluarga Anda.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Apakah legalitas aman?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Sudah lengkap dan aman. Semua dokumen legalitas termasuk SHM, IMB, dan dokumen kepemilikan lainnya telah terverifikasi dan siap untuk transaksi jual-beli yang aman.'
                }
              }
            ]
          })
        }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Highlight Units Section */}
      <Suspense fallback={<div className="py-32 text-center text-gray-900 font-semibold">Loading units...</div>}>
        <HighlightUnitsSection />
      </Suspense>

      {/* Aksesibilitas Slider Section */}
      <AksesibilitasSlider />

      {/* SEO Content Section - Teks panjang + FAQ */}
      <SEOContentSection />

      {/* Expandable FAQ Section */}
      <ExpandableFAQSection />

      {/* Request Brochure Section */}
      <RequestBrochureSection />

      {/* Contact CTA Section (Footer) */}
      <ContactCTASection />
    </main>
  )
}

