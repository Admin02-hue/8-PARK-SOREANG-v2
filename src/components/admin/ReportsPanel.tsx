'use client'

import { useEffect, useState } from 'react'
import { Eye, Users, ShoppingCart, TrendingUp, Home, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRupiah } from '@/lib/formatters'
import type { Database } from '@/types/database.types'

type Sale = Database['public']['Tables']['sales']['Row']
type Lead = Database['public']['Tables']['leads']['Row']

export default function ReportsPanel() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLeads: 0,
    totalSales: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averagePrice: 0,
  })
  const [unitStats, setUnitStats] = useState({
    tersedia: 0,
    booking: 0,
    terjual: 0,
  })
  const [leadStats, setLeadStats] = useState({
    baru: 0,
    terhubung: 0,
    tertarik: 0,
    ditutup: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      if (isMounted) await fetchStats()
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  const fetchStats = async () => {
    try {
      // Gunakan API endpoint instead of direct client queries untuk bypass RLS recursion issue
      const response = await fetch('/api/admin/reports')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.errors && Object.values(data.errors).some((err: any) => err)) {
        console.warn('⚠️ Some data fetch errors:', data.errors)
      }

      const sales = data.sales || []
      const leads = data.leads || []
      const unitsData = data.units || []
      const events = data.events || []
      const allUnits = data.allUnits || []

      // Calculate stats with fallbacks
      const salesCount = sales?.length || 0
      const totalRevenue = sales?.reduce((sum: number, s: any) => sum + (s.sale_price || 0), 0) || 0
      
      // Hitung harga rata-rata dari semua units (sama seperti Dashboard)
      const totalPrice = allUnits?.reduce((sum: number, u: any) => sum + (u.harga || 0), 0) || 0
      const avgPrice = allUnits && allUnits.length > 0 ? totalPrice / allUnits.length : 0
      
      const leadsCount = leads?.length || 0
      const totalViews = events?.length || 0

      // Count unit status breakdown
      const unitStatusCount = unitsData?.reduce((acc: any, u: any) => {
        if (u.status === 'tersedia') acc.tersedia++
        else if (u.status === 'booking') acc.booking++
        else if (u.status === 'terjual') acc.terjual++
        return acc
      }, { tersedia: 0, booking: 0, terjual: 0 }) || { tersedia: 0, booking: 0, terjual: 0 }

      // Count lead status breakdown
      const leadStatusCount = leads?.reduce((acc: any, l: any) => {
        if (l.status === 'baru') acc.baru++
        else if (l.status === 'terhubung') acc.terhubung++
        else if (l.status === 'interested') acc.tertarik++
        else if (l.status === 'closed') acc.ditutup++
        return acc
      }, { baru: 0, terhubung: 0, tertarik: 0, ditutup: 0 }) || { baru: 0, terhubung: 0, tertarik: 0, ditutup: 0 }

      setStats({
        totalViews: totalViews,
        totalLeads: leadsCount,
        totalSales: salesCount,
        totalRevenue: totalRevenue,
        conversionRate: leadsCount > 0 ? parseFloat(((salesCount / leadsCount) * 100).toFixed(2)) : 0,
        averagePrice: avgPrice,
      })

      setUnitStats(unitStatusCount)
      setLeadStats(leadStatusCount)
    } catch (error) {
      console.error('❌ Error in fetchStats:', error)
      toast.error('Terjadi kesalahan saat memuat data laporan')
      setStats({
        totalViews: 0,
        totalLeads: 0,
        totalSales: 0,
        totalRevenue: 0,
        conversionRate: 0,
        averagePrice: 0,
      })
      setUnitStats({
        tersedia: 0,
        booking: 0,
        terjual: 0,
      })
      setLeadStats({
        baru: 0,
        terhubung: 0,
        tertarik: 0,
        ditutup: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gray-300">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      label: 'Total Kunjungan',
      value: stats.totalViews.toLocaleString('id-ID'),
      icon: Eye,
      color: 'bg-blue-500/20 text-blue-300',
      borderColor: 'border-blue-500/50',
    },
    {
      label: 'Total Leads',
      value: stats.totalLeads.toLocaleString('id-ID'),
      icon: Users,
      color: 'bg-purple-500/20 text-purple-300',
      borderColor: 'border-purple-500/50',
    },
    {
      label: 'Penjualan',
      value: stats.totalSales.toLocaleString('id-ID'),
      icon: ShoppingCart,
      color: 'bg-emerald-500/20 text-emerald-300',
      borderColor: 'border-emerald-500/50',
    },
    {
      label: 'Total Revenue',
      value: formatRupiah(stats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-gold-500/20 text-gold-300',
      borderColor: 'border-gold-500/50',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: BarChart3,
      color: 'bg-cyan-500/20 text-cyan-300',
      borderColor: 'border-cyan-500/50',
    },
    {
      label: 'Harga Rata-rata',
      value: formatRupiah(stats.averagePrice),
      icon: Home,
      color: 'bg-pink-500/20 text-pink-300',
      borderColor: 'border-pink-500/50',
    },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Panel Container with glass effect */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 space-y-8 shadow-2xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan & Analitik</h2>
          <p className="text-sm text-gray-300">Ringkasan performa Eight Park Soreang</p>
        </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div
              key={idx}
              className={`${kpi.color} border ${kpi.borderColor} bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">{kpi.label}</p>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      {/* Summary Narrative */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Ringkasan Performa</h3>

        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
          <p>
            Eight Park Soreang telah menerima{' '}
            <span className="text-white font-semibold">{stats.totalViews.toLocaleString('id-ID')}</span> kunjungan
            dalam periode ini. Dari total kunjungan tersebut, kami berhasil mengumpulkan{' '}
            <span className="text-white font-semibold">{stats.totalLeads.toLocaleString('id-ID')}</span> lead
            terintegrasi.
          </p>

          <p>
            Conversion rate kami mencapai{' '}
            <span className="text-white font-semibold">{stats.conversionRate}%</span>, dengan total{' '}
            <span className="text-white font-semibold">{stats.totalSales.toLocaleString('id-ID')}</span> penjualan
            berhasil. Revenue yang dihasilkan mencapai{' '}
            <span className="text-gold-300 font-semibold">{formatRupiah(stats.totalRevenue)}</span>.
          </p>

          <p>
            Harga rata-rata unit yang terjual adalah{' '}
            <span className="text-white font-semibold">{formatRupiah(stats.averagePrice)}</span>, menunjukkan
            preferensi pembeli terhadap unit dengan spesifikasi premium.
          </p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Status Lead</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Leads Baru</span>
              <span className="text-blue-300 font-semibold">
                {leadStats.baru.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Terhubung</span>
              <span className="text-yellow-300 font-semibold">
                {leadStats.terhubung.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tertarik</span>
              <span className="text-emerald-300 font-semibold">
                {leadStats.tertarik.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Ditutup</span>
              <span className="text-red-300 font-semibold">
                {leadStats.ditutup.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Unit Status Breakdown */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Status Unit</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tersedia</span>
              <span className="text-emerald-300 font-semibold">{unitStats.tersedia.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Booking</span>
              <span className="text-yellow-300 font-semibold">{unitStats.booking.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Terjual</span>
              <span className="text-red-300 font-semibold">{unitStats.terjual.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
