'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function SEOContentSection() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Header - Clickable */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between bg-linear-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
              Cluster Paling Strategis di Soreang — Akses 2 Menit ke Tol Soroja
            </h2>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="shrink-0 ml-4"
            >
              <ChevronDown className="h-6 w-6 text-gray-500" />
            </motion.div>
          </button>

          {/* Content - Expandable */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-6 bg-white border-t border-gray-100 space-y-6">
              {/* SEO Rich Paragraph 1 */}
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>Cluster 8 Park Soreang</strong> merupakan perumahan modern di <strong>Bandung Selatan</strong> yang dirancang khusus untuk keluarga yang mengutamakan kenyamanan, lokasi strategis, dan akses transportasi cepat. Berada hanya <strong>2 menit dari Gerbang Tol Soroja</strong>, memudahkan Anda menuju Kota Bandung, Cimahi, Kopo, dan area metropolitan Bandung Raya.
              </p>

              {/* SEO Rich Paragraph 2 */}
              <p className="text-lg text-gray-700 leading-relaxed">
                Dengan lingkungan yang tertata rapi, <strong>one-gate system</strong> yang terjamin keamanannya, dan udara sejuk khas Soreang, 8 Park menjadi pilihan ideal bagi keluarga maupun investor yang mencari <strong>rumah cluster premium dengan harga terbaik</strong> di pasarnya. Lokasi kami strategis, dekat dengan <strong>Alun-Alun Soreang</strong>, fasilitas umum, sekolah, rumah sakit, dan pusat perbelanjaan.
              </p>

              {/* Informasi Tambahan */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Rumah cluster terbaru di Soreang Bandung Selatan dengan akses cepat
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Dengan akses strategis ke pusat kota, Pemda, Stadion Jalak Harupat, dan area komersial. Kami menawarkan berbagai tipe unit modern dengan desain minimalis, fasilitas lengkap, dan cicilan KPR ringan yang terjangkau untuk semua kalangan.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
