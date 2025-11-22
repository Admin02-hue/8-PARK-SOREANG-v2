/**
 * KPR Simulator Component
 * ======================
 * Menampilkan simulasi cicilan KPR untuk unit
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { calculateKPRSimulation, formatRupiah } from '@/lib/formatters'

interface KPRSimulatorProps {
  harga: number
}

export function KPRSimulator({ harga }: KPRSimulatorProps) {
  const simulation = calculateKPRSimulation(harga, 10)

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Simulasi KPR</h3>

      {/* Simulation Results */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="rounded-lg bg-white/5 border border-white/20 p-4">
          <p className="text-xs text-white/70 mb-1">Harga Properti</p>
          <p className="text-lg font-bold text-white">
            {formatRupiah(harga)}
          </p>
        </div>

        <div className="rounded-lg bg-white/5 border border-white/20 p-4">
          <p className="text-xs text-white/70 mb-1">Cicilan/Bulan (20 Tahun)</p>
          <p className="text-lg font-bold text-white">
            {formatRupiah(simulation.monthlyPayment)}
          </p>
        </div>

        <div className="rounded-lg bg-white/5 border border-white/20 p-4">
          <p className="text-xs text-white/70 mb-1">Total Loan</p>
          <p className="text-lg font-bold text-white">
            {formatRupiah(simulation.loanAmount)}
          </p>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-xs text-white/70 border-l-2 border-white/40 pl-3">
        <strong>Catatan:</strong> Simulasi ini menggunakan asumsi bunga 4,30% per
        tahun dan tenor 20 tahun. Simulasi ini bersifat informatif dan bukan
        penawaran resmi dari pihak bank.
      </p>
    </div>
  )
}
