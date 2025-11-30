'use client'

import React from 'react'
import { Lightbulb, Trees, Dumbbell, Utensils, Users, Shield, Wifi, Droplets } from 'lucide-react'

interface FasilitasItem {
  id: number
  title: string
  description: string
  icon: string
  color: string
}

interface FasilitasContentProps {
  fasilitas: FasilitasItem[]
}

const iconMap = {
  Lightbulb,
  Trees,
  Dumbbell,
  Utensils,
  Users,
  Shield,
  Wifi,
  Droplets,
}

export default function FasilitasContent({ fasilitas }: FasilitasContentProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 w-full">
          <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-12 border border-white/40 shadow-xl hover:bg-white/40 transition-all duration-300 animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              Fasilitas Premium
              <span className="block bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                8 Park Soreang
              </span>
            </h1>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Nikmati berbagai fasilitas kelas dunia yang dirancang untuk kenyamanan dan gaya hidup modern Anda
            </p>
          </div>
        </div>
      </section>

      {/* Fasilitas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fasilitas.map((item, index) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            return (
              <div
                key={item.id}
                className="group relative animate-fadeInUp"
                style={{ animationDelay: `${0.1 * (index % 4)}s` }}
              >
                <div className="relative backdrop-blur-xl bg-white/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/40 overflow-hidden hover:bg-white/40 hover:scale-105">
                  {/* Background accent */}
                  <div className={`absolute -top-8 -right-8 w-32 h-32 ${item.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {Icon && <Icon className="w-7 h-7 text-white" />}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-900 text-sm leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {/* Hover border */}
                  <div className="absolute inset-0 border-2 border-amber-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-12">
        <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-12 border border-white/40 shadow-xl hover:bg-white/40 transition-all duration-300 animate-fadeInUp">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">8</div>
              <p className="text-gray-900 font-medium">Fasilitas Utama</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
              <p className="text-gray-900 font-medium">Security</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <p className="text-gray-900 font-medium">Area Hijau</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">∞</div>
              <p className="text-gray-900 font-medium">Kenyamanan</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-12">
        <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-12 text-center border border-white/40 shadow-lg hover:bg-white/40 transition-all duration-300 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tertarik dengan Fasilitas Kami?
          </h2>
          <p className="text-gray-900 mb-8 max-w-2xl mx-auto">
            Hubungi tim marketing kami untuk mendapatkan informasi lebih lengkap dan penawaran eksklusif
          </p>
          <a
            href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 backdrop-blur-md bg-gray-400/40 hover:bg-gray-400/60 font-bold rounded-full border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-gray-400/40 transition-all duration-300 transform hover:scale-105 text-gray-900"
          >
            Hubungi Marketing
          </a>
        </div>
      </section>
    </>
  )
}
