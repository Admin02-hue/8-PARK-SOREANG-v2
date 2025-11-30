'use client'

import { useEffect, useState } from 'react'
import { getBrowserSupabaseClient } from '@/lib/supabase'
import { MessageCircle, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database.types'

type Lead = Database['public']['Tables']['leads']['Row']

export default function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      if (isMounted) await fetchLeads()
      
      const supabase = getBrowserSupabaseClient()
      const sub = (supabase as any)
        .channel('leads_' + Math.random())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
          if (isMounted) fetchLeads()
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
    applyFilters(leads, searchTerm, statusFilter)
  }, [searchTerm, statusFilter])

  const fetchLeads = async () => {
    try {
      // Use API route yang bypass RLS via service role
      const response = await fetch('/api/admin/leads')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      setLeads(data || [])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Error fetching leads:', errorMsg)
      toast.error('Gagal memuat data leads')
      setLeads([])
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
          (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
          l.nomor_whatsapp.includes(search)
      )
    }

    if (status) {
      result = result.filter((l) => l.status === status)
    }

    setFilteredLeads(result)
  }

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: leadId,
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengubah status')
      }

      toast.success('Status berhasil diubah')
      fetchLeads()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal mengubah status'
      console.error('Error updating status:', errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleSendWhatsApp = (lead: Lead) => {
    if (!lead.nomor_whatsapp) {
      toast.error('Nomor telepon tidak tersedia')
      return
    }

    const message = encodeURIComponent(
      `Halo ${lead.nama_lengkap},\n\nTerima kasih telah menunjukkan minat terhadap Eight Park Soreang. Saya siap membantu Anda dengan informasi lebih lanjut tentang unit yang tersedia.\n\nSalam,\nEight Park Soreang Team`
    )
    window.open(`https://wa.me/${lead.nomor_whatsapp}?text=${message}`, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'baru':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'contacted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'interested':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
      case 'closed':
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
          <p className="mt-4 text-gray-300">Memuat data leads...</p>
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
            <h2 className="text-2xl font-bold text-white">Lihat Leads</h2>
            <p className="text-sm text-gray-300">Total: {filteredLeads.length} leads</p>
          </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau nomor..."
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
          <option value="baru">Baru</option>
          <option value="contacted">Terhubung</option>
          <option value="interested">Tertarik</option>
          <option value="closed">Ditutup</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20 border-b border-white/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Telepon</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/10 transition">
                    <td className="px-6 py-4 text-white text-sm">{lead.nama_lengkap}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{lead.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm font-mono">{lead.nomor_whatsapp}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)} bg-transparent cursor-pointer`}
                      >
                        <option value="baru">Baru</option>
                        <option value="contacted">Terhubung</option>
                        <option value="interested">Tertarik</option>
                        <option value="closed">Ditutup</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleSendWhatsApp(lead)}
                        className="p-2 hover:bg-green-500/20 rounded-lg transition text-green-300 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Tidak ada lead ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}
