/**
 * UnitCard Component - OPTIMIZED
 * ==============================
 * Card untuk unit di listing dan home page
 * Menampilkan: foto, kode, tipe, luas tanah, luas bangunan, harga, status
 * 
 * Optimizations:
 * - React.memo untuk prevent unnecessary re-renders
 * - useMemo untuk expensive calculations (thumbnail, description)
 * - Dynamic import Framer Motion untuk performance
 */

'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Unit } from '@/types/database.types'
import { Badge } from './Badge'
import { Button } from './Button'
import {
  formatRupiah,
  formatStatus,
  getStatusColorClass,
  generateUnitDescription,
} from '@/lib/formatters'

// Lazy load Framer Motion untuk unit cards (non-critical animation)
const MotionDiv = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <div className="group" />,
})

interface UnitCardProps {
  unit: Unit
  delay?: number
  showViewDetails?: boolean
}

function UnitCardComponent({
  unit,
  delay = 0,
  showViewDetails = true,
}: UnitCardProps) {
  // Memoize expensive calculations
  const memoizedData = useMemo(() => {
    const description = generateUnitDescription(unit)
    const statusColor = getStatusColorClass(unit.status)
    
    // Tentukan thumbnail: gunakan yang ada, atau gunakan default berdasarkan blok
    const getThumbnail = () => {
      if (unit.thumbnail) return unit.thumbnail
      // Jika blok A dan tidak ada thumbnail, gunakan blok-a-new.jpg
      if (unit.code.startsWith('A')) return '/blok-a-new.jpg'
      // Jika blok B dan tidak ada thumbnail, gunakan blok-b-new.jpg
      if (unit.code.startsWith('B')) return '/blok-b-new.jpg'
      return null
    }

    return {
      thumbnail: getThumbnail(),
      description,
      statusColor,
      formattedStatus: formatStatus(unit.status),
      formattedPrice: formatRupiah(unit.harga),
    }
  }, [unit])

  // Determine badge variant based on status color
  const badgeVariant = useMemo(() => {
    if (memoizedData.statusColor.includes('green')) return 'success'
    if (memoizedData.statusColor.includes('yellow')) return 'warning'
    return 'danger'
  }, [memoizedData.statusColor])

  return (
    <div className="group animate-fadeInScale" style={{ animationDelay: `${delay * 0.1}s` }}>
      <Link href={`/units/${unit.code}`}>
        <div className="overflow-hidden rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl shadow-black/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:bg-white/15">
          {/* Image Container */}
          <div className="relative h-48 w-full overflow-hidden bg-gray-200">
            {memoizedData.thumbnail ? (
              <Image
                src={memoizedData.thumbnail}
                alt={unit.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                quality={70}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gold-50 to-gold-100">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute right-3 top-3">
              <Badge variant={badgeVariant as any}>
                {memoizedData.formattedStatus}
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
              {memoizedData.description}
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
                {memoizedData.formattedPrice}
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
    </div>
  )
}

// Memoize component untuk prevent unnecessary re-renders ketika props tidak berubah
export const UnitCard = memo(UnitCardComponent, (prevProps, nextProps) => {
  // Return true jika props sama (skip render), false jika berbeda (render)
  return (
    prevProps.unit.id === nextProps.unit.id &&
    prevProps.delay === nextProps.delay &&
    prevProps.showViewDetails === nextProps.showViewDetails
  )
})

UnitCard.displayName = 'UnitCard'
