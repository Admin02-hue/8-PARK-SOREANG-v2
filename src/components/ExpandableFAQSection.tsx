'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Apakah cluster ini bebas banjir?',
    answer: 'Ya. Lokasi berada di zona aman, bukan area rawan banjir. Ketinggian lokasi dan sistem drainase yang baik menjamin keamanan dari banjir sepanjang tahun.'
  },
  {
    id: 'faq-2',
    question: 'Berapa tipe rumah yang tersedia?',
    answer: 'Ada Tipe A dan Tipe B dengan spesifikasi modern minimalis. Setiap tipe dirancang dengan efisiensi ruang, material berkualitas, dan finishing premium yang nyaman untuk keluarga.'
  },
  {
    id: 'faq-3',
    question: 'Apakah bisa KPR?',
    answer: 'Bisa, tersedia Bank rekanan dengan proses yang mudah dan cepat. Kami bekerja sama dengan berbagai bank terkemuka untuk memudahkan cicilan KPR Anda dengan bunga kompetitif.'
  },
  {
    id: 'faq-4',
    question: 'Apakah dekat fasilitas umum?',
    answer: 'Ya, dekat Pemda, Stadion Jalak Harupat, sekolah, pasar, rumah sakit, dan berbagai pusat belanja lainnya. Lokasi yang sempurna untuk kebutuhan sehari-hari keluarga Anda.'
  },
  {
    id: 'faq-5',
    question: 'Apakah legalitas aman?',
    answer: 'Sudah lengkap dan aman. Semua dokumen legalitas termasuk SHM, IMB, dan dokumen kepemilikan lainnya telah terverifikasi dan siap untuk transaksi jual-beli yang aman.'
  }
]

export function ExpandableFAQSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-linear-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">
                    {item.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 ml-4"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </button>

                {/* Answer */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedId === item.id ? 'auto' : 0,
                    opacity: expandedId === item.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 bg-white border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
