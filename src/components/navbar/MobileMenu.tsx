/**
 * Mobile Menu Component
 * ====================
 * Menu mobile dengan animasi smooth hamburger icon
 * Dropdown biasa dari navbar, bukan floating
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
    <div className="lg:hidden relative">
      {/* Hamburger Button */}
      <motion.button
        onClick={() => onClose()}
        className="relative w-10 h-10 flex flex-col justify-center items-center"
        aria-label="Toggle menu"
      >
        {/* Top Line */}
        <motion.div
          animate={isOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hamburger-line"
        />
        {/* Middle Line */}
        <motion.div
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="hamburger-line mt-1.5"
        />
        {/* Bottom Line */}
        <motion.div
          animate={isOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hamburger-line mt-1.5"
        />
      </motion.button>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-20 left-0 right-0 w-full bg-white/70 backdrop-blur-2xl shadow-2xl flex flex-col gap-6 md:hidden z-50"
          >
            <div className="px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block text-gray-900 font-semibold hover:text-gold-600 transition-colors duration-200 py-2 text-lg"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="pt-4 border-t border-gray-300 pb-6"
              >
                <a
                  href="https://wa.me/628138331503?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="block w-full px-4 py-3 rounded-full bg-linear-to-r from-gold-500 to-gold-600 text-white font-bold text-center hover:shadow-lg transition-all duration-300"
                >
                  Hubungi Marketing
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
