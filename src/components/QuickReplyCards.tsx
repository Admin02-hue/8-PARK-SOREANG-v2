'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface QuickReplyCardProps {
  message: string
  onClick: (message: string) => void
  isLoading?: boolean
  index?: number
}

const QuickReplyCard: React.FC<QuickReplyCardProps> = ({ message, onClick, isLoading, index = 0 }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(message)}
      disabled={isLoading}
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full px-3 py-2 text-left text-xs font-medium transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
      style={{
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative flex items-start gap-1.5">
        <MessageCircle className="w-3 h-3 mt-0.5 shrink-0 text-blue-400" />
        <span className="text-blue-100 group-hover:text-white transition-colors">{message}</span>
      </div>
    </motion.button>
  )
}

export const QUICK_REPLY_MESSAGES = [
  'Halo Pak/Ibu, ada yang bisa saya bantu terkait unit 8 Park Soreang?',
  'Untuk tipe unit mana yang Bapak/Ibu ingin lihat?',
  'Unit tersebut masih tersedia. Mau saya jadwalkan survey lokasi?',
  'Baik, saya kirimkan katalog dan denahnya ya.',
  'Jika berkenan, bisa bantu kirimkan nomor WhatsApp?',
  'Bapak/Ibu ingin booking atau cek ketersediaan unit lainnya?',
  'Terima kasih, nanti saya follow-up kembali ya.',
]

interface QuickReplyCardsProps {
  onSelectMessage: (message: string) => void
  isLoading?: boolean
}

export const QuickReplyCards: React.FC<QuickReplyCardsProps> = ({ onSelectMessage, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 1
  const totalItems = QUICK_REPLY_MESSAGES.length
  const maxIndex = Math.max(0, totalItems - itemsPerView)

  const handlePrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1))
  }

  const visibleMessages = QUICK_REPLY_MESSAGES.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 p-3 rounded-lg"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <MessageCircle className="w-3 h-3 text-blue-400" />
        <p className="text-xs font-semibold text-white/80">Pesan Cepat</p>
        <span className="text-xs text-white/50 ml-auto">{currentIndex + 1} / {totalItems}</span>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2">
        {/* Tombol Previous */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          disabled={currentIndex === 0 || isLoading}
          className="p-1.5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </motion.button>

        {/* Pesan */}
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-1.5">
            {visibleMessages.map((message, index) => (
              <motion.button
                key={currentIndex + index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => onSelectMessage(message)}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 min-w-0 px-2 py-1.5 text-left text-xs font-medium transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden whitespace-normal"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="relative flex items-start gap-0.5">
                  <MessageCircle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-blue-400" />
                  <span className="text-blue-100 group-hover:text-white transition-colors line-clamp-2 text-xs">{message}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tombol Next */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          disabled={currentIndex === maxIndex || isLoading}
          className="p-1.5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </motion.button>
      </div>

      {/* Indikator progress */}
      <div className="flex gap-1 px-1 justify-center">
        {Array.from({ length: totalItems }).map((_, index) => (
          <motion.div
            key={index}
            className="h-1 rounded-full"
            animate={{
              width: currentIndex === index ? 8 : 4,
              background: currentIndex === index ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.2)',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
