/**
 * Units Listing Page
 * ==================
 * Halaman untuk melihat semua unit dengan filter dan sorting
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getBrowserSupabaseClient } from '@/lib/supabase'
import type { Unit } from '@/types/database.types'
import { UnitCard } from '@/components/UnitCard'
import { Button } from '@/components/Button'
import { Filter, X } from 'lucide-react'

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000000])
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'luas'>('price-asc')

  // Fetch units dari Supabase
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const supabase = getBrowserSupabaseClient()
        if (!supabase) {
          throw new Error('Supabase client tidak tersedia')
        }
        
        console.log('Fetching units from Supabase...')
        const startTime = performance.now()
        
        // Test connection
        const { data: testData, error: testError } = await supabase
          .from('units')
          .select('count', { count: 'exact', head: true })

        if (testError) {
          console.error('Supabase connection test failed:', testError)
          throw testError
        }

        console.log('Supabase connection OK')
        
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        const loadTime = performance.now() - startTime
        console.log(`Units fetched (${loadTime.toFixed(2)}ms):`, data?.length || 0, 'units')
        setUnits(data || [])
      } catch (error) {
        console.error('Error fetching units:', error)
        setUnits([])
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  // Optimize filters with useMemo
  const filteredUnits = useMemo(() => {
    let result = units

    // Filter by type
    if (selectedType) {
      result = result.filter((u) => u.name.includes(selectedType))
    }

    // Filter by status
    if (selectedStatus) {
      result = result.filter((u) => u.status === selectedStatus)
    }

    // Filter by price range
    result = result.filter(
      (u) => u.harga >= priceRange[0] && u.harga <= priceRange[1]
    )

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.harga - b.harga)
        break
      case 'price-desc':
        result.sort((a, b) => b.harga - a.harga)
        break
      case 'luas':
        result.sort((a, b) => b.luas_tanah - a.luas_tanah)
        break
    }

    return result
  }, [units, selectedType, selectedStatus, priceRange, sortBy])

  const clearFilters = useCallback(() => {
    setSelectedType('')
    setSelectedStatus('')
    setPriceRange([0, 10000000000])
    setSortBy('price-asc')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-semibold">Loading unit...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen scroll-mt-16 relative">
      {/* Background Image */}
      <Image
        src="/page-units-background.jpg"
        alt="Units Background"
        fill
        quality={60}
        priority
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: -2
        }}
      />

      {/* Overlay untuk kontras */}
      <div className="absolute inset-0 bg-black/20 z-0" />
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <section className="py-12 border-b border-gray-200 relative pt-28 bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold text-white">Unit Tersedia</h1>
          <p className="mt-2 text-gray-200">
            Total: {filteredUnits.length} unit dari {units.length} unit
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <motion.div
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-white" />
                Filter
              </h2>
              {(selectedType || selectedStatus || sortBy !== 'price-asc') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Tipe Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3">Tipe Rumah</h3>
              <div className="space-y-2">
                {['Tipe 65', 'Tipe 90'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={selectedType === type}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="rounded"
                    />
                    <span className="text-white">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3">Status</h3>
              <div className="space-y-2">
                {['tersedia', 'booking', 'terjual'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="rounded"
                    />
                    <span className="text-white capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3">Urutkan</h3>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-white/30 rounded-lg text-white bg-white/15 backdrop-blur-md appearance-none pr-10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <option value="price-asc" className="bg-gray-800 text-white">Harga Terendah</option>
                  <option value="price-desc" className="bg-gray-800 text-white">Harga Tertinggi</option>
                  <option value="luas" className="bg-gray-800 text-white">Luas Terbesar</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Close button for mobile */}
            {showFilters && (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowFilters(false)}
                className="lg:hidden"
              >
                Tutup Filter
              </Button>
            )}
          </motion.div>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            {/* Filter Toggle Button (Mobile) */}
            <div className="mb-6 lg:hidden">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
                {showFilters ? 'Tutup' : 'Buka'} Filter
              </Button>
            </div>

            {/* Units Grid */}
            <AnimatePresence mode="wait">
              {filteredUnits.length > 0 ? (
                <motion.div
                  key="units"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {filteredUnits.map((unit) => (
                    <UnitCard key={unit.id} unit={unit} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <p className="text-white text-lg">
                    Tidak ada unit yang sesuai dengan filter Anda
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                    onClick={clearFilters}
                  >
                    Reset Filter
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </div>
    </main>
  )
}
