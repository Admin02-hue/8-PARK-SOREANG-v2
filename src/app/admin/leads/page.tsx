'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { MessageSquare, Phone, Search, Trash2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  nama_lengkap: string
  nomor_whatsapp: string
  email?: string
  minat_unit?: string
  pesan?: string
  status: string
  created_at: string
}

export default function AdminLeadsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

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
      fetchLeads()

      // Subscribe to realtime changes
      const subscription = (supabase as any)
        .channel('leads_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads' },
          (payload: any) => {
            fetchLeads()
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

  const fetchLeads = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
      applyFilters(data || [], searchTerm, statusFilter)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data: Lead[], search: string, status: string) => {
    let result = data

    if (search) {
      result = result.filter(
        (l) =>
          l.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
          l.nomor_whatsapp.includes(search) ||
          l.email?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      result = result.filter((l) => l.status === status)
    }

    setFilteredLeads(result)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(leads, value, statusFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    applyFilters(leads, searchTerm, value)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)

      if (error) throw error
      toast.success('Status lead diperbarui')
      fetchLeads()
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const deleteLead = async (leadId: string) => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await (supabase as any)
        .from('leads')
        .delete()
        .eq('id', leadId)

      if (error) throw error
      toast.success('Lead dihapus')
      fetchLeads()
    } catch (error) {
      toast.error('Gagal menghapus lead')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'baru':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'contacted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'interested':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
      case 'closed':
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
          <p className="mt-4 text-gray-300">Memuat data leads...</p>
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
            <h1 className="text-2xl font-bold text-white">Lihat Leads</h1>
            <p className="text-sm text-gray-300">Total: {filteredLeads.length} leads</p>
          </div>
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
              placeholder="Cari nama, email, atau nomor..."
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
            <option value="baru">Baru</option>
            <option value="contacted">Dihubungi</option>
            <option value="interested">Tertarik</option>
            <option value="closed">Ditutup</option>
          </select>
        </div>

        {/* Leads Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">WhatsApp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Unit Minat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/10 transition">
                      <td className="px-6 py-4 text-white text-sm">{lead.nama_lengkap}</td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://wa.me/${lead.nomor_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:underline text-sm"
                        >
                          {lead.nomor_whatsapp}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{lead.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{lead.minat_unit || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <a
                          href={`https://wa.me/${lead.nomor_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-green-500/20 rounded-lg transition text-green-300"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => updateLeadStatus(lead.id, lead.status === 'closed' ? 'baru' : 'closed')}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
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
                      Tidak ada leads ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
