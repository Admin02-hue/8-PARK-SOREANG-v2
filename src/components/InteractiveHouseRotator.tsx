'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface InteractiveHouseRotatorProps {
  blok: string // 'A' atau 'B'
}

export function InteractiveHouseRotator({ blok }: InteractiveHouseRotatorProps) {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [displayedFrame, setDisplayedFrame] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const rotationRef = useRef(0)
  const autoRotateRef = useRef<number | null>(null)
  const directionRef = useRef(1) // 1 untuk forward, -1 untuk backward

  // Tentukan jumlah frame berdasarkan blok (memoized)
  const { totalFrames, framePath } = useMemo(() => ({
    totalFrames: blok.toUpperCase() === 'A' ? 15 : 22,
    framePath: `/3d/block-${blok.toLowerCase()}`,
  }), [blok])

  // Hitung frame berdasarkan rotasi (memoized)
  const getFrameFromRotation = useCallback((rot: number) => {
    // Normalize rotasi ke range 0-180 untuk hasil optimal
    const normalizedRot = Math.min(Math.max(rot, 0), 180)
    
    // Calculate frame index (0 to totalFrames-1)
    let frameIndex = Math.floor((normalizedRot / 180) * totalFrames)
    
    // Ensure frameIndex always in valid range
    if (frameIndex >= totalFrames) {
      frameIndex = totalFrames - 1
    }
    if (frameIndex < 0) {
      frameIndex = 0
    }
    
    // Frame numbers start dari 1, bukan 0 (01, 02, 03, ...)
    const frameNumber = frameIndex + 1
    return String(frameNumber).padStart(2, '0')
  }, [totalFrames])

  // Update displayed frame
  useEffect(() => {
    const frame = getFrameFromRotation(rotation)
    setDisplayedFrame(frame)
  }, [rotation, getFrameFromRotation])

  // Initialize frame on mount (hanya sekali)
  useEffect(() => {
    setDisplayedFrame(getFrameFromRotation(0))
  }, [totalFrames]) // Remove getFrameFromRotation dari dependency untuk avoid infinite loops

  // Handle mouse drag dengan throttling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
    rotationRef.current = rotation

    if (autoRotateRef.current !== null) {
      cancelAnimationFrame(autoRotateRef.current)
    }
  }, [rotation])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    const delta = e.clientX - dragStart
    const degreesPerPixel = 0.3 // Lebih halus dari 0.5

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      let newRotation = rotationRef.current + delta * degreesPerPixel
      // Clamp rotation ke range 0-180
      newRotation = Math.min(Math.max(newRotation, 0), 180)
      setRotation(newRotation)
      rotationRef.current = newRotation
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isDragging])

  // Handle touch drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
    rotationRef.current = rotation

    if (autoRotateRef.current !== null) {
      cancelAnimationFrame(autoRotateRef.current)
    }
  }, [rotation])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return

    const delta = e.touches[0].clientX - dragStart
    const degreesPerPixel = 0.3

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      let newRotation = rotationRef.current + delta * degreesPerPixel
      // Clamp rotation ke range 0-180
      newRotation = Math.min(Math.max(newRotation, 0), 180)
      setRotation(newRotation)
      rotationRef.current = newRotation
    })
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Auto-rotate dengan interval yang lebih lambat
  useEffect(() => {
    if (isDragging) return

    // Sesuaikan kecepatan berdasarkan jumlah frame untuk hasil yang konsisten
    // Block A (15 frames): 0.3°/frame, Block B (22 frames): 0.2°/frame
    const baseSpeed = totalFrames === 15 ? 0.3 : 0.2

    const autoRotate = () => {
      rotationRef.current += baseSpeed * directionRef.current
      
      // Reverse direction ketika mencapai boundary
      if (rotationRef.current >= 180) {
        rotationRef.current = 180
        directionRef.current = -1
      } else if (rotationRef.current <= 0) {
        rotationRef.current = 0
        directionRef.current = 1
      }
      
      setRotation(rotationRef.current)
      autoRotateRef.current = requestAnimationFrame(autoRotate)
    }

    autoRotateRef.current = requestAnimationFrame(autoRotate)

    return () => {
      if (autoRotateRef.current !== null) {
        cancelAnimationFrame(autoRotateRef.current)
      }
    }
  }, [isDragging, totalFrames])

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      if (autoRotateRef.current !== null) {
        cancelAnimationFrame(autoRotateRef.current)
      }
    }
  }, [])

  const imagePath = displayedFrame ? `${framePath}/frame_${displayedFrame}.jpg` : `${framePath}/frame_01.jpg`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-6 w-full"
    >
      <h3 className="text-2xl font-bold text-white mb-2">
        Interactive 180° House Rotate Viewer
      </h3>
      <p className="text-gray-300 text-sm mb-4">
        Drag untuk merotasi 180° atau biarkan untuk auto-rotate
      </p>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full aspect-square bg-linear-to-b from-white/5 to-white/10 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 select-none transition-all ${
          isDragging ? 'grabbing' : ''
        }`}
      >
        {/* Background image dengan smooth transition */}
        {displayedFrame && (
          <Image
            src={imagePath}
            alt={`House rotation frame ${displayedFrame}`}
            fill
            className="object-cover select-none"
            priority
            loading="eager"
            quality={85}
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              // Fallback if image fails to load
              console.warn(`Failed to load frame: ${imagePath}`)
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

        {/* Info box */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
          <p className="text-white text-xs font-medium">
            Rotasi: {Math.round(rotation)}°
          </p>
          <p className="text-gray-400 text-xs">Frame {displayedFrame || '01'}/{String(totalFrames).padStart(2, '0')}</p>
        </div>

        {/* Drag hint */}
        {!isDragging && (
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-4 left-4 text-white/60 text-xs font-medium pointer-events-none"
          >
            ⬌ Drag untuk rotate
          </motion.div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            let newRot = rotationRef.current - 22.5
            if (newRot < 0) newRot = 0
            rotationRef.current = newRot
            setRotation(newRot)
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 active:scale-95"
        >
          ← Putar Kiri
        </button>
        <button
          onClick={() => {
            rotationRef.current = 90
            setRotation(90)
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 text-gold-300 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Tengah
        </button>
        <button
          onClick={() => {
            let newRot = rotationRef.current + 22.5
            if (newRot > 180) newRot = 180
            rotationRef.current = newRot
            setRotation(newRot)
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Putar Kanan →
        </button>
      </div>
    </motion.div>
  )
}
