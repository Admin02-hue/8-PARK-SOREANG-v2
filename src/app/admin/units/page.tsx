'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { formatRupiah, formatLuas } from '@/lib/formatters'
import { Plus, Edit2, Trash2, Search, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Unit } from '@/types/database.types'

export default function AdminUnitsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: sessionData } = await (supabase as any).auth.getSession()
      
      if (!sessionData.session) {
        router.push('/admin/login')
        return
      }

      setUser(sessionData.session.user)
      fetchUnits()

      // Subscribe to realtime changes
      const subscription = (supabase as any)
        .channel('units_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'units' },
          (payload: any) => {
            fetchUnits()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchUnits = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await (supabase as any)
        .from('units')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUnits(data || [])
      applyFilters(data || [], searchTerm, statusFilter)
    } catch (error) {
      console.error('Error fetching units:', error)
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

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(units, value, statusFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    applyFilters(units, searchTerm, value)
  }

  const handleDelete = async () => {
    if (!selectedUnit) return

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('units')
        .delete()
        .eq('id', selectedUnit.id)

      if (error) throw error
      toast.success('Unit berhasil dihapus')
      setShowDeleteModal(false)
      fetchUnits()
    } catch (error) {
      toast.error('Gagal menghapus unit')
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
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat data unit...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Kelola Unit</h1>
            <p className="text-sm text-gray-300">Total: {filteredUnits.length} unit</p>
          </div>
          <Button
            variant="gold"
            onClick={() => router.push('/admin/units/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Unit
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau kode unit..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="booking">Booking</option>
            <option value="terjual">Terjual</option>
          </select>
        </div>

        {/* Units Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nama Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kode</th>
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
                      <td className="px-6 py-4 text-gray-300 text-sm">{unit.tipe}</td>
                      <td className="px-6 py-4 text-gold-300 text-sm font-medium">{formatRupiah(unit.harga)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(unit.status)}`}>
                          {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => router.push(`/admin/units/edit/${unit.id}`)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUnit(unit)
                            setShowDeleteModal(true)
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      Tidak ada unit ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Hapus Unit?</h3>
            <p className="text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus unit <strong>{selectedUnit?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
