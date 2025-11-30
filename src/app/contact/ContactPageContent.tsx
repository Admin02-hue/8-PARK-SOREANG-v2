'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { submitLead, trackMarketingEvent } from '@/lib/actions'
import { getBrowserSupabaseClient } from '@/lib/supabase'
import type { Unit } from '@/types/database.types'
import { Button } from '@/components/Button'
import { Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPageContent() {
  const searchParams = useSearchParams()
  const unitCode = searchParams.get('unit')

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nomor_whatsapp: '',
    email: '',
    minat_unit: unitCode || '',
    pesan: '',
  })

  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch available units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const supabase = getBrowserSupabaseClient()
        const { data, error } = await (supabase as any)
          .from('units')
          .select('id, code, name')
          .eq('status', 'tersedia')
          .order('code')

        if (error) throw error
        setUnits(data || [])
      } catch (error) {
        console.error('Error fetching units:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Format nomor WhatsApp
      let whatsapp = formData.nomor_whatsapp.replace(/\D/g, '')
      if (!whatsapp.startsWith('62')) {
        if (whatsapp.startsWith('0')) {
          whatsapp = '62' + whatsapp.slice(1)
        } else {
          whatsapp = '62' + whatsapp
        }
      }

      // Submit lead
      const result = await submitLead({
        nama_lengkap: formData.nama_lengkap,
        nomor_whatsapp: whatsapp,
        email: formData.email || null,
        minat_unit: formData.minat_unit || null,
        pesan: formData.pesan || null,
      })

      if (result.success) {
        setSubmitStatus('success')
        toast.success(result.message)
        setFormData({
          nama_lengkap: '',
          nomor_whatsapp: '',
          email: '',
          minat_unit: unitCode || '',
          pesan: '',
        })

        // Redirect ke home setelah 3 detik
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || result.message)
        toast.error(result.message)
      }
    } catch (error) {
      setSubmitStatus('error')
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      setErrorMessage(message)
      toast.error('Gagal mengirim form')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-50 py-12 border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Form Inquiry</h1>
          <p className="mt-2 text-gray-600">
            Isi form ini untuk mengetahui informasi lebih lanjut tentang unit
            pilihan Anda
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {submitStatus === 'success' ? (
          <motion.div
            className="rounded-lg border-2 border-emerald-600 bg-emerald-50 p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Terima Kasih!
            </h2>
            <p className="text-gray-700 mb-4">
              Data Anda telah kami terima. Tim marketing kami akan menghubungi
              Anda segera.
            </p>
            <p className="text-sm text-gray-600">
              Anda akan diarahkan ke halaman utama dalam 3 detik...
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="rounded-lg border-2 border-red-600 bg-red-50 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Error</p>
                  <p className="text-sm text-gray-700">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="Contoh: John Doe"
              />
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="nomor_whatsapp"
                value={formData.nomor_whatsapp}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="Contoh: 0812 3456 78"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 08xx atau +62xx
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Opsional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="Contoh: john@example.com"
              />
            </div>

            {/* Minat Unit */}
            {!loading && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit yang Diminati (Opsional)
                </label>
                <select
                  name="minat_unit"
                  value={formData.minat_unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                >
                  <option value="">-- Pilih Unit --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.code}>
                      {unit.code} - {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pesan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pesan Tambahan (Opsional)
              </label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="Tulis pertanyaan atau pesan Anda di sini..."
              />
            </div>

            {/* Submit Button */}
            <Button
              variant="gold"
              fullWidth
              size="lg"
              type="submit"
              isLoading={submitting}
            >
              Kirim Inquiry
            </Button>

            {/* Info */}
            <p className="text-sm text-gray-500 text-center">
              Dengan mengirim form ini, Anda setuju dengan syarat dan ketentuan
              kami.
            </p>
          </motion.form>
        )}
      </div>
    </main>
  )
}
