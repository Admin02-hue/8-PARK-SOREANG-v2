/**
 * Promo Section Component
 * =======================
 * Menampilkan promosi akhir tahun untuk 8 Park Soreang
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, CheckCircle } from 'lucide-react'

const promoDetails = [
  'Rumah Tanpa DP - Cukup Booking 10 Juta',
  'Harga sudah termasuk AJB, Balik Nama, BPHTB',
  'Biaya Akad Kredit dan PPN sudah included',
  'Cicilan ringan dengan bunga kompetitif',
  'Proses persetujuan KPR cepat & mudah',
]

export function PromoSection() {
  return (
    <section className="py-20 sm:py-32 bg-linear-to-r from-gold-600 to-gold-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Promo Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-white" />
              <span className="text-lg font-semibold text-white">
                Promo Spesial
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Promo Akhir Tahun
            </h2>

            <p className="text-lg text-white/90 mb-8">
              Kesempatan terbatas! Dapatkan penawaran istimewa untuk rumah impian
              Anda sebelum akhir tahun berakhir.
            </p>

            {/* Promo List */}
            <ul className="space-y-4">
              {promoDetails.map((detail, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-white shrink-0 mt-0.5" />
                  <span className="text-white">{detail}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Side - Visual/Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: 'Booking', value: '10 Juta' },
              { label: 'Cicilan', value: 'Mulai dari' },
              { label: 'Tenor', value: '20 Tahun' },
              { label: 'Bunga', value: 'KPR Bank' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-lg bg-blue-600 backdrop-blur border border-blue-700 p-6 text-center"
              >
                <p className="text-sm font-medium text-white">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-white mb-4">
            Jangan lewatkan kesempatan emas ini!
          </p>
          <a
            href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
            className="inline-block px-8 py-3 rounded-lg bg-white text-gold-600 font-bold transition-all duration-300 hover:bg-gray-100 hover:shadow-lg"
          >
            Hubungi Marketing Sekarang
          </a>
        </motion.div>
      </div>
    </section>
  )
}
