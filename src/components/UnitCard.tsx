/**
 * UnitCard Component
 * ==================
 * Card untuk unit di listing dan home page
 * Menampilkan: foto, kode, tipe, luas tanah, luas bangunan, harga, status
 */

'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Unit } from '@/types/database.types'
import { Badge } from './Badge'
import { Button } from './Button'
import {
  formatRupiah,
  formatStatus,
  getStatusColorClass,
  generateUnitDescription,
} from '@/lib/formatters'

interface UnitCardProps {
  unit: Unit
  delay?: number
  showViewDetails?: boolean
}

export function UnitCard({
  unit,
  delay = 0,
  showViewDetails = true,
}: UnitCardProps) {
  const description = generateUnitDescription(unit)
  const statusColor = getStatusColorClass(unit.status)
  
  // Tentukan thumbnail: gunakan yang ada, atau gunakan default berdasarkan blok
  const getThumbnail = () => {
    if (unit.thumbnail) return unit.thumbnail
    // Jika blok A dan tidak ada thumbnail, gunakan blok-a.png
    if (unit.code.startsWith('A')) return '/blok-a.png'
    // Jika blok B dan tidak ada thumbnail, gunakan blok-b.jpg
    if (unit.code.startsWith('B')) return '/blok-b.jpg'
    return null
  }
  
  const thumbnail = getThumbnail()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: '-50px' }}
      className="group"
    >
      <Link href={`/units/${unit.code}`}>
        <div className="overflow-hidden rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl shadow-black/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:bg-white/15">
          {/* Image Container */}
          <div className="relative h-48 w-full overflow-hidden bg-gray-200">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={unit.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-linear-to-br from-gold-50 to-gold-100">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute right-3 top-3">
              <Badge variant={statusColor.includes('green') ? 'success' : statusColor.includes('yellow') ? 'warning' : 'danger'}>
                {formatStatus(unit.status)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Kode & Tipe */}
            <h3 className="text-lg font-semibold text-white">
              Blok {unit.code}
            </h3>

            {/* Deskripsi */}
            <p className="mt-2 text-sm text-white line-clamp-2">
              {description}
            </p>

            {/* Spesifikasi */}
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white">Luas Tanah:</span>
                <span className="font-medium text-white">
                  {unit.luas_tanah} m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Luas Bangunan:</span>
                <span className="font-medium text-white">
                  {unit.luas_bangunan} m²
                </span>
              </div>
            </div>

            {/* Harga */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs text-white">Harga</p>
              <p className="text-2xl font-bold text-white">
                {formatRupiah(unit.harga)}
              </p>
            </div>

            {/* CTA */}
            {showViewDetails && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                className="mt-4"
              >
                Lihat Detail
              </Button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
