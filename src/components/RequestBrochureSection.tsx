'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { submitLead } from '@/lib/actions'
import toast from 'react-hot-toast'

export function RequestBrochureSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    productType: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format nomor WhatsApp
      let whatsapp = formData.phone.replace(/\D/g, '')
      if (!whatsapp.startsWith('62')) {
        if (whatsapp.startsWith('0')) {
          whatsapp = '62' + whatsapp.slice(1)
        } else {
          whatsapp = '62' + whatsapp
        }
      }

      // Submit lead ke database
      const result = await submitLead({
        nama_lengkap: formData.fullName,
        nomor_whatsapp: whatsapp,
        email: formData.email || null,
        pesan: `Permintaan Brosur - Tipe: ${formData.productType || 'Tidak dipilih'}`,
      })

      if (result.success) {
        // Kirim ke WhatsApp dengan format yang rapi
        const message = `Permintaan Brosur%0A%0ANama: ${encodeURIComponent(formData.fullName)}%0AEmail: ${encodeURIComponent(formData.email)}%0ANo. Telepon: ${encodeURIComponent(formData.phone)}%0ATipe Produk: ${encodeURIComponent(formData.productType || 'Tidak dipilih')}%0A%0AMohon kirimkan brosur ke email/WhatsApp saya.`

        window.open(`https://wa.me/6281383315039?text=${message}`, '_blank')

        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          productType: '',
        })
        setSubmitStatus('success')
        toast.success('Data berhasil disimpan dan WhatsApp dibuka')

        // Reset status setelah 3 detik
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 3000)
      } else {
        throw new Error(result.error || 'Gagal menyimpan data')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative w-full py-2 sm:py-3 md:py-4 bg-cover bg-center bg-no-repeat"
    >
      {/* Background Image */}
      <Image
        src="/bg-permintaan-brosur.jpg"
        alt="Permintaan Brosur Background"
        fill
        quality={60}
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: -1
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/80 to-gold-600/80 z-0" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-4 sm:mb-6 md:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Permintaan Brosur</h2>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-white/30 backdrop-blur-md rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-white/40"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-white/30 text-gray-900 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-white/30 backdrop-blur-md"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-white/30 text-gray-900 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-white/30 backdrop-blur-md"
              />
            </div>

            {/* Row 2: Phone and Product Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nomor Telepon"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-white/30 text-gray-900 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-white/30 backdrop-blur-md"
              />

              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-white/30 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-white/30 backdrop-blur-md appearance-none"
              >
                <option value="" className="bg-gray-900 text-white">Pilih Tipe Produk</option>
                <option value="Blok A" className="bg-gray-900 text-white">Blok A</option>
                <option value="Blok B" className="bg-gray-900 text-white">Blok B</option>
                <option value="Informasi Umum" className="bg-gray-900 text-white">Informasi Umum</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg bg-gray-900 text-white font-bold text-xs sm:text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan Brosur'}
              </motion.button>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-green-600 font-semibold text-sm"
              >
                Permintaan brosur berhasil dikirim!
              </motion.div>
            )}
            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-red-600 font-semibold text-sm"
              >
                Terjadi kesalahan. Silakan coba lagi.
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </motion.section>
  )
}
