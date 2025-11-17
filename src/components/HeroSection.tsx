/**
 * Hero Section Component
 * ======================
 * Hero dengan background image, CTA, dan scroll indicator
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './Button'
import { ChevronDown, MapPin, Phone } from 'lucide-react'

export function HeroSection() {
  const scrollToNext = () => {
    const element = document.getElementById('highlight-units')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh', height: 'auto' }}>
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/hero-section.jpg"
          alt="8 Park Soreang Hero Background"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 lg:pt-48 pb-16 sm:pb-24 lg:pb-32">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subheading */}
          <motion.p
            className="mb-6 text-lg text-gold-400 font-medium tracking-wider uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Rumah Impian Anda
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            className="mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            8 Park Soreang
          </motion.h1>

          {/* Subheading Text */}
          <motion.p
            className="mx-auto mb-8 max-w-2xl text-base sm:text-lg md:text-xl text-gray-300 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Cluster perumahan modern yang menggabungkan kenyamanan hidup dengan
            akses strategis di Soreang, Bandung.
          </motion.p>

          {/* Highlights */}
          <motion.div
            className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-4 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="rounded-lg bg-white/10 backdrop-blur px-3 sm:px-4 py-2 text-xs sm:text-sm text-white border border-white/20">
              ✓ Unit Berkualitas Premium
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur px-3 sm:px-4 py-2 text-xs sm:text-sm text-white border border-white/20">
              ✓ Lokasi Strategis
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur px-3 sm:px-4 py-2 text-xs sm:text-sm text-white border border-white/20">
              ✓ Cicilan Ringan
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col gap-3 sm:gap-4 justify-center w-full sm:w-auto px-2 max-w-xs mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/units" className="w-full">
              <button className="w-full rounded-lg bg-white/10 backdrop-blur px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                Lihat Unit Tersedia
              </button>
            </Link>
            <a href="https://wa.me/628138331503?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya." className="w-full">
              <button className="w-full rounded-lg bg-white/10 backdrop-blur px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Hubungi Marketing
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-400">Scroll untuk lanjut</p>
            <ChevronDown className="h-6 w-6 text-gold-400" />
          </div>
        </motion.button>
      </div>
    </section>
  )
}
