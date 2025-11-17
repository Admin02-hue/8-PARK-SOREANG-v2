/**
 * Units Listing Page
 * ==================
 * Halaman untuk melihat semua unit dengan filter dan sorting
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Unit } from '@/types/database.types'
import { UnitCard } from '@/components/UnitCard'
import { Button } from '@/components/Button'
import { Filter, X } from 'lucide-react'

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
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
        const supabase = createBrowserSupabaseClient()
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setUnits(data || [])
        setFilteredUnits(data || [])
      } catch (error) {
        console.error('Error fetching units:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  // Apply filters dan sorting
  useEffect(() => {
    let result = [...units]

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

    setFilteredUnits(result)
  }, [units, selectedType, selectedStatus, priceRange, sortBy])

  const clearFilters = () => {
    setSelectedType('')
    setSelectedStatus('')
    setPriceRange([0, 10000000000])
    setSortBy('price-asc')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-900 font-semibold">Loading unit...</p>
        </div>
      </div>
    )
  }

  return (
    <main 
      className="min-h-screen scroll-mt-16 relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/page-units-background.jpg')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay untuk kontras */}
      <div className="absolute inset-0 bg-black/20" />
      {/* Header */}
      <section className="py-12 border-b border-gray-200 relative z-10 pt-28 bg-cover bg-center" style={{ backgroundImage: "url('/page-units-background.jpg')" }}>
        <div className="absolute inset-0 bg-black/30" />
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white bg-white/10 backdrop-blur"
              >
                <option value="price-asc">Harga Rendah ke Tinggi</option>
                <option value="price-desc">Harga Tinggi ke Rendah</option>
                <option value="luas">Luas Terbesar</option>
              </select>
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
                  {filteredUnits.map((unit, index) => (
                    <UnitCard key={unit.id} unit={unit} delay={index * 0.05} />
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
                  <p className="text-gray-600 text-lg">
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
    </main>
  )
}
