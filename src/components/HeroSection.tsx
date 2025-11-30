/**
 * Hero Section Component - OPTIMIZED (Enterprise Grade)
 * ========================================================
 * • Fully responsive tanpa cropping di semua ukuran layar
 * • Pattern responsive: mobile (100vh), tablet (80vh), desktop (70vh)
 * • Background Image dengan fill + object-cover
 * • Gradient overlay untuk readability
 * • Semua elemen centered vertical dan horizontal
 * • CSS animations untuk performa optimal (tidak block main thread)
 * • Scroll indicator dengan CSS animation
 */

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Phone } from 'lucide-react'

export function HeroSection() {
  const scrollToNext = () => {
    const element = document.getElementById('highlight-units')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative w-full min-h-screen sm:min-h-[80vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden animate-fadeIn">
      {/* Background Image - Full Coverage */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/hero-section.jpg"
          alt="8 Park Soreang Hero Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
          quality={90}
        />
      </div>

      {/* Gradient Overlay - For Text Readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/40 to-black/50" />

      {/* Content Wrapper - Centered with Flex */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div
          className="w-full max-w-md text-center flex flex-col items-center animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Main Heading - SEO Optimized H1 */}
          <h1
            className="mb-4 sm:mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            8 Park Soreang<br />
            Exclusive Modern Residence
          </h1>

          {/* Description - SEO Long-Tail Keywords */}
          <p
            className="mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}
          >
            Cluster prestisius dekat Tol Soroja dengan konsep hunian modern, akses strategis, dan lingkungan berkualitas tinggi. Hunian ideal bagi keluarga yang mencari kenyamanan dan nilai investasi terbaik di Bandung Selatan.
          </p>

          {/* Badges - SEO Keywords Optimized */}
          <div
            className="mb-6 sm:mb-8 flex flex-wrap justify-center gap-2 sm:gap-3 animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}
          >
            <div 
              className="rounded-full bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white border border-white/20 hover:bg-white/20 transition-all"
              aria-label="Rumah cluster premium dengan desain modern"
            >
              ✓ Rumah Cluster Premium
            </div>
            <div 
              className="rounded-full bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white border border-white/20 hover:bg-white/20 transition-all"
              aria-label="Dekat Tol Soroja dengan akses strategis"
            >
              ✓ Dekat Tol Soroja
            </div>
            <div 
              className="rounded-full bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white border border-white/20 hover:bg-white/20 transition-all"
              aria-label="Cicilan KPR ringan dengan kemudahan financing"
            >
              ✓ Cicilan KPR Ringan
            </div>
          </div>

          {/* CTA Buttons - SEO Smart */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto animate-fadeInUp"
            style={{ animationDelay: '0.5s' }}
          >
            <Link href="/units" className="flex-1 sm:flex-none">
              <button 
                className="w-full rounded-lg bg-white/15 backdrop-blur-sm px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white border border-white/30 hover:bg-white/25 transition-all duration-300"
                aria-label="Lihat rumah cluster tersedia di Soreang Bandung Selatan"
              >
                Lihat Unit Tersedia
              </button>
            </Link>
            <a
              href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
              className="flex-1 sm:flex-none"
              aria-label="Hubungi marketing rumah cluster dekat Tol Soroja"
            >
              <button 
                className="w-full rounded-lg bg-white/15 backdrop-blur-sm px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white border border-white/30 hover:bg-white/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Hubungi Marketing
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Bottom Position */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 sm:gap-2 group"
        aria-label="Scroll to next section"
      >
        <p className="text-xs sm:text-sm text-gray-300">Scroll untuk lanjut</p>
        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 animate-bounce" />
      </button>
    </section>
  )
}
