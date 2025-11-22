'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { formatRupiah } from '@/lib/formatters'
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'
import type { Unit } from '@/types/database.types'

interface ReportStats {
  totalUnitViews: number
  totalLeads: number
  totalSales: number
  totalRevenue: number
  conversionRate: number
  averageUnitPrice: number
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('30days')

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
      fetchReports()

      // Subscribe to realtime changes
      const subscription = (supabase as any)
        .channel('reports_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
          fetchReports()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
          fetchReports()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchReports = async () => {
    try {
      const supabase = createBrowserSupabaseClient()

      // Fetch units
      const { data: unitsData } = await (supabase as any)
        .from('units')
        .select('*')

      setUnits(unitsData || [])

      // Fetch leads
      const { count: leadsCount } = await (supabase as any)
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Fetch sales
      const { data: salesData, count: salesCount } = await (supabase as any)
        .from('sales')
        .select('*', { count: 'exact' })
        .eq('status', 'completed')

      // Calculate stats
      const totalRevenue = (salesData || []).reduce((sum: number, sale: any) => sum + (sale.sale_price || 0), 0)
      const averageUnitPrice = unitsData && unitsData.length > 0
        ? unitsData.reduce((sum: number, unit: Unit) => sum + unit.harga, 0) / unitsData.length
        : 0

      // Fetch marketing events
      const { count: viewsCount } = await (supabase as any)
        .from('marketing_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'unit_view')

      const conversionRate = leadsCount && leadsCount > 0 
        ? ((salesCount || 0) / leadsCount * 100)
        : 0

      setStats({
        totalUnitViews: viewsCount || 0,
        totalLeads: leadsCount || 0,
        totalSales: salesCount || 0,
        totalRevenue,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageUnitPrice: Math.round(averageUnitPrice),
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Laporan & Analytics</h1>
              <p className="text-sm text-gray-300">Ringkasan performa penjualan</p>
            </div>
            <div className="flex gap-2">
              {(['7days', '30days', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition ${
                    timeRange === range
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50'
                      : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {range === '7days' ? '7 Hari' : range === '30days' ? '30 Hari' : 'Semua Waktu'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Views */}
          <div className="bg-linear-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-200">Total Views</p>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalUnitViews || 0}</p>
            <p className="text-xs text-blue-300 mt-2">Tampilan unit</p>
          </div>

          {/* Total Leads */}
          <div className="bg-linear-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-200">Total Leads</p>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalLeads || 0}</p>
            <p className="text-xs text-purple-300 mt-2">Calon pembeli</p>
          </div>

          {/* Total Sales */}
          <div className="bg-linear-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-emerald-200">Total Penjualan</p>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalSales || 0}</p>
            <p className="text-xs text-emerald-300 mt-2">Unit terjual</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-linear-to-br from-gold-500/20 to-gold-600/20 backdrop-blur-md border border-gold-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gold-200">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-gold-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatRupiah(stats?.totalRevenue || 0, { prefix: '' })}</p>
            <p className="text-xs text-gold-300 mt-2">Pendapatan</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-linear-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-cyan-200">Conversion Rate</p>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.conversionRate || 0}%</p>
            <p className="text-xs text-cyan-300 mt-2">Lead ke penjualan</p>
          </div>

          {/* Average Price */}
          <div className="bg-linear-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-md border border-pink-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-pink-200">Harga Rata-rata</p>
              <DollarSign className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatRupiah(stats?.averageUnitPrice || 0, { prefix: '' })}</p>
            <p className="text-xs text-pink-300 mt-2">Per unit</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Ringkasan</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              • Dari <strong className="text-white">{stats?.totalLeads || 0}</strong> leads yang masuk, 
              <strong className="text-white"> {stats?.totalSales || 0}</strong> telah berhasil ditutup.
            </p>
            <p>
              • Conversion rate saat ini <strong className="text-gold-300">{stats?.conversionRate || 0}%</strong>, 
              dengan total revenue mencapai <strong className="text-emerald-300">{formatRupiah(stats?.totalRevenue || 0)}</strong>.
            </p>
            <p>
              • Rata-rata harga unit adalah <strong className="text-cyan-300">{formatRupiah(stats?.averageUnitPrice || 0)}</strong>, 
              dengan total <strong className="text-white">{units.length}</strong> unit tersedia.
            </p>
            <p>
              • Website telah dikunjungi sebanyak <strong className="text-blue-300">{stats?.totalUnitViews || 0}</strong> kali 
              untuk melihat detail unit.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
