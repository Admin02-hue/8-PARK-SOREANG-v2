'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface Promotion {
  id: string
  title: string
  description: string
  terms?: string[]
  is_active: boolean
  created_at: string
}

export default function AdminPromotionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
      fetchPromotions()

      // Subscribe to realtime changes
      const subscription = (supabase as any)
        .channel('promotions_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'promotions' },
          (payload: any) => {
            fetchPromotions()
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

  const fetchPromotions = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await (supabase as any)
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (promoId: string, currentStatus: boolean) => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('promotions')
        .update({ is_active: !currentStatus })
        .eq('id', promoId)

      if (error) throw error
      toast.success('Status promo diperbarui')
      fetchPromotions()
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const deletePromo = async (promoId: string) => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('promotions')
        .delete()
        .eq('id', promoId)

      if (error) throw error
      toast.success('Promo dihapus')
      fetchPromotions()
    } catch (error) {
      toast.error('Gagal menghapus promo')
    }
  }

  const filteredPromotions = promotions.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat data promo...</p>
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
            <h1 className="text-2xl font-bold text-white">Kelola Promo</h1>
            <p className="text-sm text-gray-300">Total: {filteredPromotions.length} promo</p>
          </div>
          <Button
            variant="gold"
            onClick={() => router.push('/admin/promotions/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Promo
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari promo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.length > 0 ? (
            filteredPromotions.map((promo) => (
              <div key={promo.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:border-white/40 transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white flex-1 pr-2">{promo.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      promo.is_active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                    }`}
                  >
                    {promo.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{promo.description}</p>

                {promo.terms && promo.terms.length > 0 && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Syarat & Ketentuan:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {promo.terms.slice(0, 2).map((term, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-gold-400">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                      {promo.terms.length > 2 && (
                        <li className="text-gray-400">+{promo.terms.length - 2} lainnya</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(promo.id, promo.is_active)}
                    className="flex-1 p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-300 text-sm flex items-center justify-center gap-2"
                  >
                    {promo.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => router.push(`/admin/promotions/edit/${promo.id}`)}
                    className="p-2 hover:bg-yellow-500/20 rounded-lg transition text-yellow-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePromo(promo.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Tidak ada promo ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
