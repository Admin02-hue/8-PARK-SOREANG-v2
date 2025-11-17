/**
 * Unit Detail Gallery
 * ===================
 * Gallery carousel untuk unit detail page
 */

'use client'

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

interface UnitDetailGalleryProps {
  thumbnail?: string | null
  gallery?: string[] | null
  unitName: string
}

export function UnitDetailGallery({
  thumbnail,
  gallery,
  unitName,
}: UnitDetailGalleryProps) {
  const images = gallery && gallery.length > 0 ? gallery : thumbnail ? [thumbnail] : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Autoplay effect
  useEffect(() => {
    if (!isAutoPlay || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 5000) // 5 detik interval

    return () => clearInterval(interval)
  }, [isAutoPlay, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setIsAutoPlay(false) // Pause autoplay saat manual
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setIsAutoPlay(false) // Pause autoplay saat manual
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-linear-to-br from-gold-50 to-gold-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Tidak ada gambar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <motion.div
        className="relative w-full h-96 rounded-lg overflow-hidden bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt={`${unitName} - ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Autoplay Toggle Button */}
            <button
              onClick={toggleAutoPlay}
              className="absolute bottom-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label={isAutoPlay ? 'Pause autoplay' : 'Play autoplay'}
            >
              {isAutoPlay ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlay(false) // Pause autoplay saat klik thumbnail
              }}
              className={`relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-gold-600 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 bg-gold-600/20" />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
