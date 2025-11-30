/**
 * Dynamic Interactive House Rotator
 * ==================================
 * Wrapper untuk InteractiveHouseRotator dengan lazy loading
 * Mencegah blokir initial page render karena 22 frame images
 */

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const InteractiveHouseRotator = dynamic(
  () => import('./InteractiveHouseRotator').then(mod => ({ default: mod.InteractiveHouseRotator })),
  {
    loading: () => (
      <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-gray-500">Memuat rotator 3D...</span>
      </div>
    ),
    ssr: true,
  }
)

interface DynamicInteractiveHouseRotatorProps {
  blok: string
}

export function DynamicInteractiveHouseRotator({ blok }: DynamicInteractiveHouseRotatorProps) {
  return (
    <Suspense
      fallback={
        <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-gray-500">Memuat rotator 3D...</span>
        </div>
      }
    >
      <InteractiveHouseRotator blok={blok} />
    </Suspense>
  )
}
