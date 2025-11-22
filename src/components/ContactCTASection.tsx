/**
 * Contact CTA Section
 * ===================
 * Footer dengan informasi kontak dan copyright
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { MessageSquare, Phone, Mail, MapPin } from 'lucide-react'

export function ContactCTASection() {
  return (
    <footer className="bg-gray-400/10 backdrop-blur-md border-t border-gray-400/20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="text-lg font-bold text-black drop-shadow-lg mb-4 relative z-30">8 Park Soreang</h4>
            <p className="text-sm text-black font-semibold drop-shadow-lg mb-4 relative z-30">
              Cluster perumahan premium dengan lokasi strategis di Soreang, Bandung.
            </p>
            <p className="text-xs text-black font-semibold drop-shadow-lg relative z-30">Premium Residential Estate • Bandung, Indonesia</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-black drop-shadow-lg mb-4 relative z-30">Menu Cepat</h4>
            <ul className="space-y-2 text-sm relative z-30 text-black">
              <li><Link href="/" className="text-black font-medium drop-shadow-md hover:text-gray-900 transition-colors block">Beranda</Link></li>
              <li><Link href="/units" className="text-black font-medium drop-shadow-md hover:text-gray-900 transition-colors block">Unit</Link></li>
              <li><Link href="/fasilitas" className="text-black font-medium drop-shadow-md hover:text-gray-900 transition-colors block">Fasilitas</Link></li>
              <li><Link href="/lokasi" className="text-black font-medium drop-shadow-md hover:text-gray-900 transition-colors block">Lokasi</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-black drop-shadow-lg mb-4 relative z-30">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm relative z-30 text-black">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black drop-shadow-lg shrink-0" />
                <a href="tel:+6281383315039" className="text-black font-medium drop-shadow-md hover:text-gray-900 transition-colors">
                  +62 (813) 8331 5039
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-black drop-shadow-lg shrink-0" />
                <a href="mailto:8parksoreangcluster@gmail.com" className="text-black font-medium drop-shadow-md hover:text-gray-900 transition-colors">
                  8parksoreangcluster@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-lg font-bold text-black drop-shadow-lg mb-4 relative z-30">Lokasi</h4>
            <div className="flex items-start gap-2 text-sm text-black font-semibold drop-shadow-lg relative z-30">
              <MapPin className="h-4 w-4 text-black drop-shadow-lg mt-0.5 shrink-0" />
              <p>Jl. Cipatik - Soreang No.88, Parungserab,<br />Kec. Soreang, Kabupaten Bandung,<br />Jawa Barat 40914</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 py-6" />

        {/* Copyright */}
        <div className="text-center text-xs text-black font-bold drop-shadow-lg relative z-30">
          <p>© 2025 Cluster 8 Park Soreang</p>
          <p>Premium Residential Estate • Bandung, Indonesia</p>
        </div>
      </div>
    </footer>
  )
}
