'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { BarChart3, Users, Home, TrendingUp, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUnits: number
  availableUnits: number
  totalLeads: number
  newLeads: number
  sales: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: sessionData } = await (supabase as any).auth.getSession()
        
        if (!sessionData.session) {
          router.push('/admin/login')
          return
        }

        setUser(sessionData.session.user)

        // Fetch statistics
        const fetchStats = async () => {
          try {
            const { count: unitCount } = await (supabase as any)
              .from('units')
              .select('*', { count: 'exact', head: true })

            const { count: leadCount } = await (supabase as any)
              .from('leads')
              .select('*', { count: 'exact', head: true })

            const { data: availableUnits } = await (supabase as any)
              .from('units')
              .select('*')
              .eq('status', 'tersedia')

            const { data: newLeads } = await (supabase as any)
              .from('leads')
              .select('*')
              .eq('status', 'baru')

            const { count: salesCount } = await (supabase as any)
              .from('sales')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'completed')

            setStats({
              totalUnits: unitCount || 0,
              availableUnits: availableUnits?.length || 0,
              totalLeads: leadCount || 0,
              newLeads: newLeads?.length || 0,
              sales: salesCount || 0,
            })
          } catch (error) {
            console.error('Error fetching stats:', error)
          }
        }

        await fetchStats()
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      await (supabase as any).auth.signOut()
      toast.success('Logout berhasil')
      router.push('/admin/login')
    } catch (error) {
      toast.error('Logout gagal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total Units */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Unit</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalUnits || 0}
                </p>
              </div>
              <Home className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Available Units */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tersedia</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.availableUnits || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-20" />
            </div>
          </div>

          {/* Total Leads */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Lead</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalLeads || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </div>

          {/* New Leads */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Lead Baru</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.newLeads || 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Sales */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gold-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Terjual</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.sales || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gold-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => router.push('/admin/units')}
          >
            Kelola Unit
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => router.push('/admin/leads')}
          >
            Lihat Leads
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => router.push('/admin/promotions')}
          >
            Kelola Promo
          </Button>
        </div>

        {/* Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Selamat Datang!</h3>
          <p className="text-blue-800 text-sm">
            Gunakan dashboard ini untuk mengelola unit properti, leads calon pembeli, dan promosi.
            Semua data real-time tersinkronisasi dengan Supabase.
          </p>
        </div>
      </div>
    </main>
  )
}
