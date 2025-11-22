'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'

// Custom Marker Icon (biru premium)
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
})

export function LocationSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full py-12 sm:py-16 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* MAP PREMIUM */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-xl border border-black/10"
          >
            <MapContainer
              center={[-7.0098357, 107.4985065]}
              zoom={15}
              scrollWheelZoom={false}
              className="h-[380px] w-full grayscale"
            >
              <TileLayer
                attribution="&copy; podomoro-premium-map"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={[-7.0098357, 107.4985065]} icon={markerIcon}>
                <Popup>
                  <div className="text-center p-1">
                    <h4 className="font-bold text-gray-900">8 Park Soreang</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Lokasi Strategis • Hunian Premium
                    </p>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=-7.0098357,107.4985065"
                      target="_blank"
                      className="inline-block px-3 py-1 rounded-lg bg-black text-white text-xs"
                    >
                      Get Direction
                    </a>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </motion.div>

          {/* INFORMASI LOKASI */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-8"
          >
            {/* Alamat */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alamat</h3>
              <p className="text-gray-600">
                Jl. Cipatik - Soreang No.88, Cipamenan, Kec. Banjaran, Bandung 40376
              </p>
            </div>

            {/* Aksesibilitas */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Aksesibilitas</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 15 menit dari Bandara Internasional Husein Sastranegara</li>
                <li>• Dekat dengan akses tol Padaleunyi</li>
                <li>• Mudah diakses dari pusat kota Bandung</li>
              </ul>
            </div>

            {/* Fasilitas */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fasilitas Terdekat</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Sekolah dan universitas terkemuka</li>
                <li>• Pusat perbelanjaan dan restoran</li>
                <li>• Rumah sakit dan pusat kesehatan</li>
              </ul>
            </div>

            {/* BUTTON */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://www.google.com/maps/search/8+Park+Soreang"
              target="_blank"
              className="inline-block px-6 py-3 bg-black text-white text-sm font-bold rounded-lg shadow-md"
            >
              Lihat di Maps
            </motion.a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
