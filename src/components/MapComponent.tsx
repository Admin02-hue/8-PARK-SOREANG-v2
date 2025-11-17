/**
 * Map Component - Premium Real Estate Map
 * =======================================
 * Komponen peta dengan Leaflet untuk lokasi 8 Park Soreang
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
  className?: string
}

export function MapComponent({ className = 'h-96 w-full rounded-2xl shadow-lg' }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Koordinat 8 Park Soreang - dari Google Maps
  const latitude = -7.01349
  const longitude = 107.52686
  const zoom = 15

  useEffect(() => {
    if (!mapContainerRef.current || isLoaded) return

    const initializeMap = async () => {
      try {
        // Dynamic import dengan delay untuk ensure DOM ready
        const leaflet = await import('leaflet')
        const L = leaflet.default

        // Small delay untuk DOM rendering
        await new Promise(resolve => setTimeout(resolve, 100))

        const container = mapContainerRef.current
        if (!container || (container as any)._leaflet_map) return

        // Initialize map
        const map = L.map(container).setView([latitude, longitude], zoom)

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 1,
        }).addTo(map)

        // Invalidate size multiple times untuk ensure proper rendering
        map.invalidateSize()
        setTimeout(() => map.invalidateSize(), 200)
        setTimeout(() => map.invalidateSize(), 500)

        // Add custom marker with icon-marker.png
        const customIcon = L.icon({
          iconUrl: '/icon-marker.png',
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40],
        })

        L.marker([latitude, longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="width: 160px; min-width: 160px; max-width: 160px; font-family: system-ui, -apple-system, sans-serif; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.3); text-align: center; display: flex; flex-direction: column; align-items: center;">
              <div style="margin-bottom: 12px; display: flex; justify-content: center; width: 100%;">
                <img src="/logo-popup.png" alt="8 Park Soreang" style="max-width: 110px; height: auto;">
              </div>
              <a href="https://www.google.com/maps/place/-7.01349,107.52686" target="_blank" rel="noopener noreferrer" style="display: block; padding: 8px 12px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); color: #000; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.3); transition: all 0.3s ease; width: 100%; box-sizing: border-box;">
                Google Maps
              </a>
            </div>
          `)
          .openPopup()

        setIsLoaded(true)
      } catch (error) {
        console.error('Map initialization error:', error)
      }
    }

    initializeMap()
  }, [latitude, longitude, zoom, isLoaded])

  return (
    <div className="relative w-full">
      <div 
        ref={mapContainerRef} 
        className={`${className} bg-blue-200 border-2 border-blue-300`}
        style={{ minHeight: '400px' }}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        © OpenStreetMap contributors | Leaflet
      </div>
    </div>
  )
}