/**
 * Fasilitas Page
 * ==============
 * Halaman yang menampilkan semua fasilitas di 8 Park Soreang
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Trees, Dumbbell, Utensils, Users, Shield, Wifi, Droplets } from 'lucide-react'

const fasilitas = [
  {
    id: 1,
    title: 'Smart Lighting',
    description: 'Sistem pencahayaan otomatis hemat energi di seluruh kompleks',
    icon: Lightbulb,
    color: 'bg-yellow-500',
  },
  {
    id: 2,
    title: 'Taman Hijau',
    description: 'Area hijau yang luas dengan taman bermain dan jogging track',
    icon: Trees,
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Fitness Center',
    description: 'Pusat kebugaran modern lengkap dengan peralatan terkini',
    icon: Dumbbell,
    color: 'bg-red-500',
  },
  {
    id: 4,
    title: 'Community Center',
    description: 'Ruang komunitas untuk gathering dan acara keluarga',
    icon: Utensils,
    color: 'bg-orange-500',
  },
  {
    id: 5,
    title: 'Kids Playground',
    description: 'Area bermain anak yang aman dan dilengkapi standar internasional',
    icon: Users,
    color: 'bg-pink-500',
  },
  {
    id: 6,
    title: 'Security 24/7',
    description: 'Sistem keamanan berlapis dengan CCTV dan security profesional',
    icon: Shield,
    color: 'bg-blue-500',
  },
  {
    id: 7,
    title: 'High-Speed Internet',
    description: 'WiFi berkecepatan tinggi tersedia di seluruh area kompleks',
    icon: Wifi,
    color: 'bg-cyan-500',
  },
  {
    id: 8,
    title: 'Water Management',
    description: 'Sistem pengelolaan air dengan teknologi ramah lingkungan',
    icon: Droplets,
    color: 'bg-teal-500',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function FasilitasPage() {
  return (
    <main className="pt-24 pb-16 bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-gold-500/20 via-emerald-500/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Fasilitas Premium
              <span className="block bg-linear-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                8 Park Soreang
              </span>
            </h1>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto">
              Nikmati berbagai fasilitas kelas dunia yang dirancang untuk kenyamanan dan gaya hidup modern Anda
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fasilitas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {fasilitas.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 overflow-hidden">
                  {/* Background accent */}
                  <div className={`absolute -top-8 -right-8 w-32 h-32 ${item.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-900 text-sm leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {/* Hover border */}
                  <div className="absolute inset-0 border-2 border-gold-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-12">
        <div className="bg-linear-to-r from-gold-500 to-gold-600 rounded-3xl p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          >
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
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-lg"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tertarik dengan Fasilitas Kami?
          </h2>
          <p className="text-gray-900 mb-8 max-w-2xl mx-auto">
            Hubungi tim marketing kami untuk mendapatkan informasi lebih lengkap dan penawaran eksklusif
          </p>
          <motion.a
            href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-linear-to-r from-gold-500 to-gold-600 font-bold rounded-full hover:shadow-lg hover:shadow-gold-500/50 transition-all duration-300"
            style={{ color: '#1f2937' }}
          >
            Hubungi Marketing
          </motion.a>
        </motion.div>
      </section>
    </main>
  )
}
