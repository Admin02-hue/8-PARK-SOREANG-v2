'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Edit2, Trash2, Search, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database.types'

type Promotion = Database['public']['Tables']['promotions']['Row']

export default function PromotionsPanel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      if (isMounted) await fetchPromotions()
      
      const supabase = createBrowserSupabaseClient()
      const sub = (supabase as any)
        .channel('promotions_' + Math.random())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
          if (isMounted) fetchPromotions()
        })
        .subscribe()
      
      return sub
    }

    init().then((sub: any) => {
      return () => {
        isMounted = false
        if (sub) sub.unsubscribe()
      }
    })
  }, [])

  useEffect(() => {
    applyFilters(promotions, searchTerm)
  }, [searchTerm])

  const fetchPromotions = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      if (!supabase) throw new Error('Supabase client not initialized')
      
      const { data, error } = await (supabase as any)
        .from('promotions')
        .select('id, title, description, is_active, terms, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        const errorMsg = error instanceof Error ? error.message : (error?.message || JSON.stringify(error))
        throw new Error(errorMsg)
      }
      setPromotions(data || [])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Error fetching promotions:', errorMsg)
      toast.error('Gagal memuat data promosi: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data: Promotion[], search: string) => {
    let result = data

    if (search) {
      result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    }

    setFilteredPromotions(result)
  }

  const handleToggleActive = async (promotionId: string, currentActive: boolean) => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('promotions')
        .update({ is_active: !currentActive })
        .eq('id', promotionId)

      if (error) throw error
      toast.success('Status promosi berhasil diubah')
      fetchPromotions()
    } catch (error) {
      toast.error('Gagal mengubah status promosi')
    }
  }

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Hapus promosi ini?')) return

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('promotions')
        .delete()
        .eq('id', promotionId)

      if (error) throw error
      toast.success('Promosi berhasil dihapus')
      fetchPromotions()
    } catch (error) {
      toast.error('Gagal menghapus promosi')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat data promosi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Panel Container with glass effect */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Kelola Promosi</h2>
          <p className="text-sm text-gray-300">Total: {filteredPromotions.length} promosi</p>
        </div>
        <Button variant="gold" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Promosi
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari promosi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.length > 0 ? (
          filteredPromotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4 hover:bg-white/20 transition"
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white flex-1">{promo.title}</h3>
                <button
                  onClick={() => handleToggleActive(promo.id, promo.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    promo.is_active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                  }`}
                >
                  {promo.is_active ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm line-clamp-3">{promo.description}</p>

              {/* Terms */}
              {promo.terms && (
                <div className="text-xs text-gray-400 border-t border-white/10 pt-3">
                  <p className="font-medium text-gray-300 mb-1">Syarat & Ketentuan:</p>
                  <p className="line-clamp-2">{promo.terms}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button className="flex-1 p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-300 flex items-center justify-center gap-1 text-sm">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex-1 p-2 hover:bg-red-500/20 rounded-lg transition text-red-300 flex items-center justify-center gap-1 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            Tidak ada promosi ditemukan
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
