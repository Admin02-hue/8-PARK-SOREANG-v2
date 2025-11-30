'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Unit', href: '/units' },
  { label: 'Lokasi', href: '/lokasi' },
  { label: 'Fasilitas', href: '/fasilitas' },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <>
      {/* HAMBURGER BUTTON - Integrated with Navbar */}
      <button 
        onClick={() => onClose()}
        className="relative flex h-6 w-6 items-center justify-center lg:hidden"
      >
        {/* Top */}
        <motion.span
          className="absolute h-0.5 w-6 bg-black rounded-full"
          animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
          transition={{ duration: 0.25 }}
        />
        {/* Mid */}
        <motion.span
          className="absolute h-0.5 w-6 bg-black rounded-full"
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        {/* Bot */}
        <motion.span
          className="absolute h-0.5 w-6 bg-black rounded-full"
          animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
          transition={{ duration: 0.25 }}
        />
      </button>

      {/* DROPDOWN MENU - Positioned below navbar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
            
            {/* Dropdown menu - Matched with navbar styling */}
            <motion.div
              className="fixed top-16 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 z-50 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl lg:hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col divide-y divide-white/20 text-black">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-6 py-3 text-base font-semibold text-gray-900 hover:bg-white/20 transition-all duration-200"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="h-px bg-white/20" />

                {/* CTA Button */}
                <motion.a
                  href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="block m-3 px-6 py-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-white text-center font-bold shadow-lg hover:shadow-xl transition text-sm"
                >
                  Hubungi Marketing
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
