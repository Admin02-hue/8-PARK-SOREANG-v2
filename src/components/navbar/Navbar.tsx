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

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    if (isOpen) {
      const handler = () => setIsOpen(false)
      window.addEventListener('scroll', handler)
      return () => window.removeEventListener('scroll', handler)
    }
  }, [isOpen])

  return (
    <>
      {/* NAVBAR FIXED */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-999 px-4 sm:px-6 lg:px-8 py-2"
      >
        <motion.div
          animate={{
            height: isScrolled ? 52 : 68,
            paddingTop: isScrolled ? 4 : 8,
            paddingBottom: isScrolled ? 4 : 8,
          }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="max-w-7xl mx-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-between px-6"
        >
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-8 text-gray-900">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-semibold text-sm text-gray-900 hover:text-gold-600 transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* DESKTOP CTA */}
          <a
            href="https://wa.me/6281383315039?text=Halo%2C%20saya%20tertarik%20dengan%20properti%20di%20Cluster%208%20Park%20Soreang.%20Mohon%20informasi%20terkait%3A%0A%E2%80%A2%20Ketersediaan%20unit%20terbaru%0A%E2%80%A2%20Harga%20%26%20simulasi%20KPR%0A%E2%80%A2%20Promo%20%26%20bonus%20yang%20sedang%20berlaku%0A%E2%80%A2%20Jadwal%20survei%20lokasi%0A%0ATerima%20kasih%20atas%20bantuannya."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:block px-6 py-2 rounded-full bg-linear-to-r from-gold-500 to-gold-600 font-bold text-sm text-black!"
          >
            Hubungi Marketing
          </a>

          {/* MOBILE HAMBURGER TRIGGER */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden h-10 w-10 z-50 flex items-center justify-center cursor-pointer"
          >
            <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} />
          </div>
        </motion.div>
      </motion.nav>
    </>
  )
}
