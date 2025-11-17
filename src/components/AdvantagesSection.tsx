/**
 * Advantages Section Component
 * =============================
 * Menampilkan aksesibilitas 8 Park Soreang
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Train,
  Building2,
  ShoppingCart,
  Heart,
  GraduationCap,
} from 'lucide-react'

interface Advantage {
  icon: React.ElementType
  title: string
  description: string
}

const advantages: Advantage[] = []

export function AdvantagesSection() {
  return (
    <section className="py-20 bg-gray-50 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Aksesibilitas 8 Park Soreang
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Lokasi strategis dengan akses mudah ke berbagai fasilitas dan pusat kota
          </p>
        </div>

        {/* Advantages Grid */}
        {advantages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: '-50px' }}
                className="rounded-lg border border-gray-200 bg-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex rounded-lg bg-gold-100 p-3">
                  <Icon className="h-6 w-6 text-gold-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {advantage.title}
                </h3>
                <p className="mt-2 text-gray-600">{advantage.description}</p>
              </motion.div>
            )
          })}
        </div>
        )}
      </div>
    </section>
  )
}
