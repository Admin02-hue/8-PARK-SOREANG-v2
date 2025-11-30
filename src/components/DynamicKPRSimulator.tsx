/**
 * Dynamic KPR Simulator
 * ====================
 * Wrapper untuk KPRSimulator dengan lazy loading
 * Mengurangi initial bundle karena calculator logic yang kompleks
 */

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const KPRSimulator = dynamic(
  () => import('./KPRSimulator').then(mod => ({ default: mod.KPRSimulator })),
  {
    loading: () => (
      <div className="h-96 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center justify-center animate-pulse">
        <span className="text-gray-400">Memuat kalkulator KPR...</span>
      </div>
    ),
    ssr: false, // KPR simulator menggunakan React hooks, lebih baik client-side only
  }
)

interface DynamicKPRSimulatorProps {
  harga?: number
}

export function DynamicKPRSimulator({ harga = 500000000 }: DynamicKPRSimulatorProps) {
  return (
    <Suspense
      fallback={
        <div className="h-96 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center justify-center animate-pulse">
          <span className="text-gray-400">Memuat kalkulator KPR...</span>
        </div>
      }
    >
      <KPRSimulator harga={harga} />
    </Suspense>
  )
}
