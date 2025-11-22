'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { formatRupiah } from '@/lib/formatters'
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import RupiahInput from '@/components/RupiahInput'
import type { Unit } from '@/types/database.types'

type FormData = {
  name: string
  code: string
  blok: string
  tipe: string
  luas_bangunan: number
  luas_tanah: number
  harga: number
  status: 'tersedia' | 'booking' | 'terjual'
  fasilitas: string
}

export default function UnitsPanel() {
  const [units, setUnits] = useState<Unit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    blok: '',
    tipe: '',
    luas_bangunan: 0,
    luas_tanah: 0,
    harga: 0,
    status: 'tersedia',
    fasilitas: '',
  })

  useEffect(() => {
    let isMounted = true
    let subscription: any

    const init = async () => {
      if (isMounted) await fetchUnits()

      try {
        const supabase = createBrowserSupabaseClient()
        if (!supabase) return

        subscription = supabase
          .channel('units-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'units' },
            (payload: any) => {
              console.log('Unit change detected:', payload)
              if (isMounted) fetchUnits()
            }
          )
          .subscribe((status: string) => {
            console.log('Subscription status:', status)
          })
      } catch (error) {
        console.error('Error setting up subscription:', error)
      }
    }

    init()

    return () => {
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    applyFilters(units, searchTerm, statusFilter)
  }, [units, searchTerm, statusFilter])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserSupabaseClient()
      if (!supabase) throw new Error('Supabase client not initialized')

      const { data, error } = await (supabase as any)
        .from('units')
        .select('id, code, name, harga, status, tipe, luas_bangunan, blok, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      console.log('✅ Units fetched successfully:', data)
      const typedData = (data || []) as Unit[]
      setUnits(typedData)
      applyFilters(typedData, searchTerm, statusFilter)
    } catch (error) {
      console.error('❌ Error fetching units:', error)
      toast.error('Gagal memuat data unit: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setUnits([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data: Unit[], search: string, status: string) => {
    let result = data

    if (search) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.code.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      result = result.filter((u) => u.status === status)
    }

    setFilteredUnits(result)
  }

  const handleDelete = async (unitId: string) => {
    if (!confirm('Hapus unit ini?')) return

    try {
      const response = await fetch('/api/admin/units', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: unitId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus unit')
      }

      toast.success('Unit berhasil dihapus')
      fetchUnits()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal menghapus unit'
      toast.error(errorMsg)
    }
  }

  const handleQuickStatusUpdate = async (unitId: string, newStatus: 'tersedia' | 'booking' | 'terjual') => {
    try {
      console.log('🔄 Updating unit status...', { unitId, newStatus })

      // Use API endpoint instead of direct Supabase client
      const response = await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: unitId,
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Update gagal')
      }

      console.log('✅ Status updated successfully:', result)
      toast.success(`Status berhasil diubah menjadi ${newStatus}`)
      
      // Wait a bit then refresh to ensure data is synced
      setTimeout(() => {
        fetchUnits()
      }, 500)
    } catch (error) {
      console.error('❌ Error updating status:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Gagal mengubah status: ' + errorMsg)
    }
  }

  const openModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit)
      setFormData({
        name: unit.name,
        code: unit.code,
        blok: unit.blok,
        tipe: unit.tipe,
        luas_bangunan: unit.luas_bangunan,
        luas_tanah: unit.luas_tanah,
        harga: unit.harga,
        status: unit.status,
        fasilitas: unit.fasilitas || '',
      })
    } else {
      setEditingUnit(null)
      setFormData({
        name: '',
        code: '',
        blok: '',
        tipe: '',
        luas_bangunan: 0,
        luas_tanah: 0,
        harga: 0,
        status: 'tersedia',
        fasilitas: '',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUnit(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validasi required fields
      if (!formData.name || !formData.code || !formData.blok || !formData.tipe) {
        toast.error('Nama, Kode, Blok, dan Tipe harus diisi')
        setSubmitting(false)
        return
      }

      // Normalize code (uppercase, no spaces)
      const normalizedCode = formData.code.toUpperCase().trim().replace(/\s+/g, '')
      
      // Validasi code format (harus 1-20 karakter, alphanumeric)
      if (!/^[A-Z0-9]{1,20}$/.test(normalizedCode)) {
        toast.error('Kode harus alphanumeric (A-Z, 0-9) tanpa spasi, max 20 karakter')
        setSubmitting(false)
        return
      }

      const updatedFormData = {
        ...formData,
        code: normalizedCode
      }

      // Use API endpoint instead of direct Supabase client
      const requestBody = {
        ...(editingUnit ? { id: editingUnit.id } : {}),
        name: updatedFormData.name,
        code: updatedFormData.code,
        blok: updatedFormData.blok,
        tipe: updatedFormData.tipe,
        luas_bangunan: updatedFormData.luas_bangunan,
        luas_tanah: updatedFormData.luas_tanah,
        harga: updatedFormData.harga,
        status: updatedFormData.status,
        fasilitas: updatedFormData.fasilitas,
      }

      const response = await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan unit')
      }

      if (editingUnit) {
        toast.success(`Unit berhasil diperbarui! Detail: /units/${updatedFormData.code}`)
      } else {
        const newUnit = result
        console.log(`🎨 Calling auto-generate-gallery API untuk unit ${newUnit.id}...`)
        
        try {
          const galleryResponse = await fetch('/api/admin/auto-generate-gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              unitId: newUnit.id,
              blok: updatedFormData.blok,
            }),
          })

          const galleryResult = await galleryResponse.json()
          
          if (!galleryResponse.ok) {
            console.warn('⚠️ Gallery auto-generate warning:', galleryResult.error)
          } else {
            console.log('✅ Gallery auto-generated:', galleryResult.message)
          }
        } catch (galleryError) {
          console.error('⚠️ Gallery auto-generate error (non-critical):', galleryError)
        }
        
        // Show success with direct link to detail page
        toast.success(
          () => (
            <div className="space-y-1">
              <p>Unit berhasil ditambahkan!</p>
              <p className="text-xs opacity-80">Kode: {updatedFormData.code}</p>
              <p className="text-xs opacity-80">Link: /units/{updatedFormData.code}</p>
              <p className="text-xs opacity-80">Gallery auto-generated untuk Blok {updatedFormData.blok}</p>
            </div>
          ),
          { duration: 5000 }
        )
      }

      closeModal()
      fetchUnits()
    } catch (error) {
      console.error('Error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if it's a duplicate key error
      if (errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
        toast.error(`Kode unit "${formData.code}" sudah ada! Gunakan kode unik.`)
      } else {
        toast.error('Gagal menyimpan unit: ' + errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tersedia':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
      case 'booking':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'terjual':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat data unit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Kelola Unit</h2>
            <p className="text-sm text-gray-300">Total: {filteredUnits.length} unit</p>
          </div>
          <Button variant="gold" className="flex items-center gap-2" onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Tambah Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau kode unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="booking">Booking</option>
            <option value="terjual">Terjual</option>
          </select>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nama Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Blok</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tipe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-white/10 transition">
                      <td className="px-6 py-4 text-white text-sm">{unit.name}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm font-mono">{unit.code}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{unit.blok}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{unit.tipe}</td>
                      <td className="px-6 py-4 text-gold-300 text-sm font-medium">{formatRupiah(unit.harga)}</td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <button 
                            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition hover:opacity-80 ${getStatusColor(unit.status)}`}
                          >
                            {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                          </button>
                          
                          {/* Dropdown menu */}
                          <div className="absolute hidden group-hover:block right-0 mt-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg overflow-hidden z-10 min-w-max">
                            <button
                              onClick={() => handleQuickStatusUpdate(unit.id, 'tersedia')}
                              className="block w-full text-left px-4 py-2 text-white hover:bg-green-500/30 text-xs transition"
                            >
                              Tersedia
                            </button>
                            <button
                              onClick={() => handleQuickStatusUpdate(unit.id, 'booking')}
                              className="block w-full text-left px-4 py-2 text-white hover:bg-yellow-500/30 text-xs transition border-t border-white/10"
                            >
                              Booking
                            </button>
                            <button
                              onClick={() => handleQuickStatusUpdate(unit.id, 'terjual')}
                              className="block w-full text-left px-4 py-2 text-white hover:bg-red-500/30 text-xs transition border-t border-white/10"
                            >
                              Terjual
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => openModal(unit)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Tidak ada unit ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingUnit ? 'Edit Unit' : 'Tambah Unit'}
              </h3>
              <button onClick={closeModal} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">Nama Unit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                  placeholder="Contoh: Unit A-101"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Kode Unit * 
                    <span className="text-gold-400 ml-1">
                      (URL: /units/{formData.code.toUpperCase() || 'A101'})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm uppercase"
                    placeholder="A101"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Harus unik & alphanumeric (A-Z, 0-9)</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Blok *</label>
                  <input
                    type="text"
                    value={formData.blok}
                    onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                    placeholder="A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Tipe *</label>
                  <input
                    type="text"
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                    placeholder="65"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Luas Bangunan (m²)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.luas_bangunan}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, luas_bangunan: val ? Number(val) : 0 })
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                    placeholder="Contoh: 65"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Luas Tanah (m²)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.luas_tanah}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, luas_tanah: val ? Number(val) : 0 })
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                    placeholder="Contoh: 75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Harga *</label>
                  <RupiahInput
                    value={formData.harga}
                    onChange={(val) => setFormData({ ...formData, harga: val })}
                    placeholder="Contoh: 1250000000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      setFormData({ ...formData, status: e.target.value as any })
                      setIsStatusOpen(false)
                    }}
                    onFocus={() => setIsStatusOpen(true)}
                    onBlur={() => setIsStatusOpen(false)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm appearance-none cursor-pointer transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d4af37' d='M0 3l6 6 6-6z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.2em auto',
                      paddingRight: '2.5rem',
                      transform: isStatusOpen ? 'translateY(0)' : 'translateY(0)',
                      filter: isStatusOpen ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))' : 'none',
                    }}
                  >
                    <option style={{ backgroundColor: '#1e293b', color: 'white' }} value="tersedia">Tersedia</option>
                    <option style={{ backgroundColor: '#1e293b', color: 'white' }} value="booking">Booking</option>
                    <option style={{ backgroundColor: '#1e293b', color: 'white' }} value="terjual">Terjual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">Fasilitas</label>
                <textarea
                  value={formData.fasilitas}
                  onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                  placeholder="Deskripsi fasilitas..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/20">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 py-2 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition disabled:opacity-50 text-sm"
                >
                  {submitting ? '...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
