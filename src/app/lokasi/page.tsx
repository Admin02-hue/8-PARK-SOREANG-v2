/**
 * Lokasi Page
 * ===========
 * Halaman informasi lokasi dan peta 8 Park Soreang dengan Mapbox
 */

import React from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { MapComponent } from '@/components/MapComponent'

export const metadata = {
  title: 'Lokasi | 8 Park Soreang',
  description: 'Lokasi strategis 8 Park Soreang di Soreang, Bandung',
  openGraph: {
    title: 'Lokasi | 8 Park Soreang',
    description: 'Lokasi strategis 8 Park Soreang di Soreang, Bandung',
  },
}

export default function LokasPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Lokasi Strategis
            </h1>
            <p className="text-lg text-gray-600">
              8 Park Soreang berada di lokasi yang sangat strategis dengan akses mudah ke berbagai fasilitas
            </p>
          </div>
        </div>
      </section>

      {/* Lokasi Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Map Component Premium */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <MapComponent className="h-96 w-full rounded-2xl" />
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Akses Mudah & Strategis
                </h2>
                <p className="text-gray-600 mb-4">
                  8 Park Soreang terletak di Jl. Cipatik - Soreang No.88, Parungserab, Kec. Soreang, Kabupaten Bandung dengan lokasi yang sangat strategis dan mudah diakses dari berbagai titik kota.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
              {[
                {
                  title: 'Alamat',
                  icon: MapPin,
                  content: 'Jl. Cipatik - Soreang No.88, Parungserab, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40914',
                },
                {
                  title: 'Telepon',
                  icon: Phone,
                  content: '+62 (813) 8331 5039',
                },
                {
                  title: 'Email',
                  icon: Mail,
                  content: '8parksoreangcluster@gmail.com',
                },
                {
                  title: 'Jam Operasional',
                  icon: Clock,
                  content: 'Senin - Minggu: 09:00 - 17:00',
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gold-100">
                      <item.icon className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Lokasi */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Keunggulan Lokasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '🛣 1. Exit Tol Soroja – Gerbang Soreang',
                description: 'Jarak: ± 6–7 menit / 3.8 km\n\nKeunggulan: Akses tercepat langsung ke Bandung, Cimahi, dan Tol Purbaleunyi. Nilai jual paling kuat karena cluster dekat pintu tol itu magnet konsumen.',
              },
              {
                title: '🏟 2. Stadion Si Jalak Harupat',
                description: 'Jarak: ± 5–7 menit / 3.5 km\n\nKeunggulan: Ikon olahraga nasional, venue event besar, dan pusat aktivitas publik. Cocok buat angle "hidup dekat fasilitas kota modern".',
              },
              {
                title: '🌲 3. Wisata Ciwidey',
                description: 'Jarak: ± 20–25 menit\n\nKeunggulan: Akses wisata terbaik Bandung Selatan dengan Ranca Upas, Kawah Putih, dan Glamping Lakeside.',
              },
              {
                title: '🏢 4. Kantor Pemerintahan Kabupaten Bandung',
                description: 'Jarak: ± 10 menit\n\nKeunggulan: Dekat pusat administrasi – mempengaruhi value properti.',
              },
              {
                title: '🏥 5. RSUD Otista Soreang',
                description: 'Jarak: ± 8–10 menit\n\nKeunggulan: Fasilitas kesehatan besar → ini wajib ada untuk website cluster premium.',
              },
              {
                title: '🛒 6. Area Komersial Soreang',
                description: 'Jarak: 2–10 menit\n\nKeunggulan: Akses kebutuhan harian, makanan, perbelanjaan dengan Pasar, Alfamart, Indomaret, dan Ruko.',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-900 whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tertarik dengan Lokasi Kami?
          </h2>
          <p className="text-lg text-gray-900 mb-8">
            Hubungi marketing kami untuk informasi lebih detail tentang lokasi dan unit tersedia
          </p>
          <a
            href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full bg-white font-bold hover:shadow-lg transition-all duration-300"
            style={{ color: '#1f2937' }}
          >
            Hubungi Marketing Sekarang
          </a>
        </div>
      </section>
    </main>
  )
}
