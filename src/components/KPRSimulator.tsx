/**
 * KPR Simulator Component
 * ======================
 * Menampilkan simulasi cicilan KPR untuk unit
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { calculateKPRSimulation, formatRupiah } from '@/lib/formatters'

interface KPRSimulatorProps {
  harga: number
}

export function KPRSimulator({ harga }: KPRSimulatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(10)

  const simulation = calculateKPRSimulation(harga, downPaymentPercent)

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Simulasi KPR</h3>

      {/* DP Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-white">
            Down Payment (DP)
          </label>
          <span className="text-lg font-bold text-white">
            {downPaymentPercent}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-xs text-white/70 mt-1">
          <span>0%</span>
          <span>50%</span>
        </div>
      </div>

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
          <p className="text-xs text-white/70 mb-1">Down Payment</p>
          <p className="text-lg font-bold text-white">
            {formatRupiah(simulation.downPayment)}
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
        <strong>Catatan:</strong> Simulasi ini menggunakan asumsi bunga 5% per
        tahun dan tenor 20 tahun. Simulasi ini bersifat informatif dan bukan
        penawaran resmi dari pihak bank.
      </p>
    </div>
  )
}
