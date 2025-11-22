'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import UnitsPanel from '@/components/admin/UnitsPanel'
import LeadsPanel from '@/components/admin/LeadsPanel'
import PromotionsPanel from '@/components/admin/PromotionsPanel'
import ReportsPanel from '@/components/admin/ReportsPanel'
import SettingsPanel from '@/components/admin/SettingsPanel'
import LiveChatPanel from '@/components/admin/LiveChatPanel'
import { 
  BarChart3, 
  Users, 
  Home, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X,
  Settings,
  FileText,
  Megaphone,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRupiah } from '@/lib/formatters'

interface DashboardStats {
  totalUnits: number
  availableUnits: number
  totalLeads: number
  newLeads: number
  sales: number
  totalRevenue: number
  conversionRate: number
  averagePrice: number
}

type PanelType = 'dashboard' | 'units' | 'leads' | 'promotions' | 'reports' | 'settings' | 'livechat'

export function AdminDashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePanel, setActivePanel] = useState<PanelType>('dashboard')

  // Debounce timer untuk real-time updates
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true
    let unitsSub: any
    let leadsSub: any
    let salesSub: any

    const checkAuth = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: sessionData } = await (supabase as any).auth.getSession()
        
        if (!sessionData.session) {
          router.push('/admin/login')
          return
        }

        if (isMounted) setUser(sessionData.session.user)

        // Fetch statistics
        const fetchStats = async () => {
          try {
            const { count: unitCount } = await (supabase as any)
              .from('units')
              .select('id', { count: 'exact', head: true })

            // Fetch leads dari API route (bypass RLS)
            const leadsResponse = await fetch('/api/admin/leads')
            const leadsPayload = await leadsResponse.json()
            
            // Ensure leadsData is always an array
            const leadsData = Array.isArray(leadsPayload) ? leadsPayload : []
            const leadCount = leadsData.length

            const { data: availableUnits } = await (supabase as any)
              .from('units')
              .select('id', { count: 'exact' })
              .eq('status', 'tersedia')

            // Count new leads (status = 'baru') - safely handle filter on array
            const newLeadsCount = Array.isArray(leadsData) 
              ? leadsData.filter((l: any) => l.status === 'baru').length 
              : 0

            const { count: salesCount, data: salesData } = await (supabase as any)
              .from('sales')
              .select('id,sale_price', { count: 'exact' })
              .eq('status', 'completed')

            const { data: allUnits } = await (supabase as any)
              .from('units')
              .select('harga')

            // Hitung Total Revenue
            const totalRevenue = salesData?.reduce((sum: number, s: any) => sum + (s.sale_price || 0), 0) || 0

            // Hitung Conversion Rate (sales / leads * 100)
            const conversionRate = leadCount > 0 ? (salesCount / leadCount) * 100 : 0

            // Hitung Harga Rata-rata
            const totalPrice = allUnits?.reduce((sum: number, u: any) => sum + (u.harga || 0), 0) || 0
            const averagePrice = allUnits && allUnits.length > 0 ? totalPrice / allUnits.length : 0

            if (isMounted) {
              setStats({
                totalUnits: unitCount || 0,
                availableUnits: availableUnits?.length || 0,
                totalLeads: leadCount,
                newLeads: newLeadsCount,
                sales: salesCount || 0,
                totalRevenue: totalRevenue,
                conversionRate: conversionRate,
                averagePrice: averagePrice,
              })
            }
          } catch (error) {
            console.error('Error fetching stats:', error)
          }
        }

        await fetchStats()

        // Helper: Debounced fetchStats untuk real-time updates (avoid too many requests)
        const debouncedFetchStats = () => {
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
          }
          fetchTimeoutRef.current = setTimeout(() => {
            if (isMounted) fetchStats()
          }, 500) // Tunggu 500ms sebelum fetch
        }

        // Setup real-time subscriptions
        unitsSub = (supabase as any)
          .channel('dashboard_units_' + Math.random())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
            debouncedFetchStats()
          })
          .subscribe()

        leadsSub = (supabase as any)
          .channel('dashboard_leads_' + Math.random())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
            debouncedFetchStats()
          })
          .subscribe()

        salesSub = (supabase as any)
          .channel('dashboard_sales_' + Math.random())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
            debouncedFetchStats()
          })
          .subscribe()

      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkAuth()
    
    return () => {
      isMounted = false
      // Clear debounce timer
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
      // Unsubscribe from real-time channels
      if (unitsSub) unitsSub.unsubscribe()
      if (leadsSub) leadsSub.unsubscribe()
      if (salesSub) salesSub.unsubscribe()
    }
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
      <div className="min-h-screen bg-cover bg-center bg-fixed relative overflow-hidden" style={{
        backgroundImage: 'url(/background-panel-admin.png)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />
        
        {/* Loading Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          {/* Glassmorphism Loading Card */}
          <div className="relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl animate-pulse"></div>
            
            {/* Main card */}
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 w-full max-w-md shadow-2xl">
              {/* Animated top border accent */}
              <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-linear-to-r from-transparent via-gold-400 to-transparent rounded-full blur-lg animate-pulse"></div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Premium Spinner */}
                {/* Logo Container - Independent size with Ultra Premium Animation */}
                <div className="mb-8 flex justify-center">
                  <div className="logo-ultra-glow" style={{
                    animation: 'smoothPremiumRotate 5s linear infinite, ultraGlowPulse 3s ease-in-out infinite',
                    display: 'inline-block'
                  }}>
                    <div className="w-40 h-40 flex items-center justify-center">
                      <img 
                        src="/logo-loading.png" 
                        alt="Loading Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Loading text */}
                <div className="space-y-3 text-center">
                  <p className="text-xl font-semibold text-white tracking-wide">
                    Memuat Dashboard
                  </p>
                  
                  {/* Animated dots */}
                  <div className="flex justify-center gap-1 pt-2">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  
                  {/* Subtitle */}
                  <p className="text-sm text-gray-300 font-light pt-2">
                    Cluster 8 Park Soreang
                  </p>
                </div>
              </div>
              
              {/* Bottom glow effect */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-linear-to-t from-gold-400/20 to-transparent rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard', active: activePanel === 'dashboard' },
    { icon: Home, label: 'Kelola Unit', id: 'units', active: activePanel === 'units' },
    { icon: MessageCircle, label: 'Live Chat', id: 'livechat', active: activePanel === 'livechat' },
    { icon: Users, label: 'Lihat Leads', id: 'leads', active: activePanel === 'leads' },
    { icon: Megaphone, label: 'Kelola Promo', id: 'promotions', active: activePanel === 'promotions' },
    { icon: FileText, label: 'Laporan', id: 'reports', active: activePanel === 'reports' },
    { icon: Settings, label: 'Pengaturan', id: 'settings', active: activePanel === 'settings' },
  ]

  return (
    <main className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
      backgroundImage: 'url(/background-panel-admin.png)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition text-white lg:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-300">{user.email}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="hidden lg:block w-64 bg-white/5 backdrop-blur-md border-r border-white/20 p-6 space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id as PanelType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  item.active
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Dashboard Home Panel */}
          {activePanel === 'dashboard' && (
            <div className="px-4 sm:px-6 lg:px-8 py-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Units */}
                <div className="bg-linear-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200 mb-1">Total Unit</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.totalUnits || 0}
                      </p>
                    </div>
                    <Home className="w-8 h-8 text-blue-400 opacity-40" />
                  </div>
                </div>

                {/* Available Units */}
                <div className="bg-linear-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-200 mb-1">Tersedia</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.availableUnits || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-400 opacity-40" />
                  </div>
                </div>

                {/* Total Leads */}
                <div className="bg-linear-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-200 mb-1">Total Lead</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.totalLeads || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-400 opacity-40" />
                  </div>
                </div>

                {/* Sales */}
                <div className="bg-linear-to-br from-gold-500/20 to-gold-600/20 backdrop-blur-md border border-gold-500/30 rounded-xl p-6 hover:border-gold-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gold-200 mb-1">Terjual</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.sales || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-gold-400 opacity-40" />
                  </div>
                </div>
              </div>

              {/* Extended Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* New Leads */}
                <div className="bg-linear-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-200 mb-1">Lead Baru</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.newLeads || 0}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-yellow-400 opacity-40" />
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-linear-to-br from-rose-500/20 to-rose-600/20 backdrop-blur-md border border-rose-500/30 rounded-xl p-6 hover:border-rose-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-rose-200 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        {formatRupiah(stats?.totalRevenue || 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-rose-400 opacity-40" />
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-linear-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-200 mb-1">Conversion Rate</p>
                      <p className="text-3xl font-bold text-white">
                        {(stats?.conversionRate || 0).toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-cyan-400 opacity-40" />
                  </div>
                </div>

                {/* Average Price */}
                <div className="bg-linear-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-md border border-indigo-500/30 rounded-xl p-6 hover:border-indigo-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-200 mb-1">Harga Rata-rata</p>
                      <p className="text-2xl font-bold text-white">
                        {formatRupiah(stats?.averagePrice || 0)}
                      </p>
                    </div>
                    <Home className="w-8 h-8 text-indigo-400 opacity-40" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button
                  onClick={() => setActivePanel('units')}
                  className="bg-linear-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition text-left group"
                >
                  <Home className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition" />
                  <h3 className="font-semibold text-white mb-1">Kelola Unit</h3>
                  <p className="text-sm text-gray-300">Tambah, edit, atau hapus unit</p>
                </button>

                <button
                  onClick={() => setActivePanel('livechat')}
                  className="bg-linear-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/50 transition text-left group"
                >
                  <MessageCircle className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition" />
                  <h3 className="font-semibold text-white mb-1">Live Chat</h3>
                  <p className="text-sm text-gray-300">Kelola percakapan dengan pelanggan</p>
                </button>

                <button
                  onClick={() => setActivePanel('leads')}
                  className="bg-linear-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition text-left group"
                >
                  <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
                  <h3 className="font-semibold text-white mb-1">Lihat Leads</h3>
                  <p className="text-sm text-gray-300">Kelola data calon pembeli</p>
                </button>

                <button
                  onClick={() => setActivePanel('promotions')}
                  className="bg-linear-to-br from-gold-500/20 to-gold-600/20 backdrop-blur-md border border-gold-500/30 rounded-xl p-6 hover:border-gold-500/50 transition text-left group"
                >
                  <Megaphone className="w-8 h-8 text-gold-400 mb-3 group-hover:scale-110 transition" />
                  <h3 className="font-semibold text-white mb-1">Kelola Promo</h3>
                  <p className="text-sm text-gray-300">Buat dan kelola promosi</p>
                </button>
              </div>

              {/* Welcome Section */}
              <div className="bg-linear-to-r from-gold-500/20 to-yellow-500/20 backdrop-blur-md border border-gold-500/30 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Selamat Datang! 👋</h3>
                <p className="text-gray-300 mb-4">
                  Gunakan dashboard ini untuk mengelola unit properti, leads calon pembeli, dan promosi.
                  Semua data tersinkronisasi real-time dengan sistem kami.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="gold"
                    onClick={() => setActivePanel('units')}
                  >
                    Mulai Kelola Unit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setActivePanel('leads')}
                    className="text-white hover:bg-white/10"
                  >
                    Lihat Leads
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Units Panel */}
          {activePanel === 'units' && <UnitsPanel />}

          {/* Live Chat Panel */}
          {activePanel === 'livechat' && <LiveChatPanel />}

          {/* Leads Panel */}
          {activePanel === 'leads' && <LeadsPanel />}

          {/* Promotions Panel */}
          {activePanel === 'promotions' && <PromotionsPanel />}

          {/* Reports Panel */}
          {activePanel === 'reports' && <ReportsPanel />}

          {/* Settings Panel */}
          {activePanel === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </main>
  )
}
