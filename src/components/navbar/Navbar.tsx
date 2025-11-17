/**
 * Navbar Component
 * ================
 * Navbar premium dengan glassmorphism, scroll animation, dan mobile menu
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Unit', href: '/units' },
  { label: 'Lokasi', href: '/lokasi' },
  { label: 'Fasilitas', href: '/fasilitas' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  // Detect scroll untuk shrink navbar
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  // Close mobile menu saat scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-2"
    >
      {/* Navbar Container dengan Fixed Height */}
      <motion.div
        animate={{
          height: isScrolled ? 52 : 68,
          paddingTop: isScrolled ? 4 : 8,
          paddingBottom: isScrolled ? 4 : 8,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="max-w-7xl mx-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-between px-6 overflow-visible relative"
      >
        
        {/* Logo Wrapper dengan Fixed Height */}
        <div className="h-full flex items-center overflow-hidden shrink-0">
          <Logo />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {menuItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={{ scale: 1.1 }}
              className="text-black! font-semibold transition-all duration-200 text-sm"
              style={{ color: '#000000' }}
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        {/* Desktop CTA Button */}
        <motion.a
          href="https://wa.me/628138331503?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden lg:block px-6 py-2 rounded-full bg-linear-to-r from-gold-500 to-gold-600 text-black! font-bold text-sm hover:shadow-lg transition-all duration-300 shrink-0"
          style={{ color: '#000000' }}
        >
          Hubungi Marketing
        </motion.a>

        {/* Mobile Menu Button - Absolute Positioned */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden z-40">
          <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} />
        </div>
      </motion.div>
    </motion.nav>
  )
}
