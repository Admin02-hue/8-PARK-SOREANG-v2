/**
 * Root Layout
 * ===========
 * Layout utama aplikasi dengan providers dan global styles
 */

import type { Metadata } from 'next'
import './globals.css'
import LayoutClient from './layout-client'

export const metadata: Metadata = {
  title: 'Cluster 8 Park Soreang — Perumahan Modern di Jantung Kabupaten Bandung',
  description:
    'Cluster 8 Park Soreang adalah perumahan modern di Bandung Selatan dengan akses 2 menit ke Tol Soroja. Dekat Alun-Alun Soreang, lingkungan eksklusif, unit premium dengan cicilan KPR ringan.',
  keywords: [
    'cluster di bandung',
    'cluster soreang',
    'cluster bandung selatan',
    'rumah cluster soreang',
    'perumahan dekat tol soroja',
    'cluster murah bandung',
    'rumah baru soreang',
    'cluster modern bandung selatan',
    'rumah impian bandung',
    'cicilan kpr bandung',
    'perumahan eksklusif soreang'
  ],
  authors: [{ name: 'Cluster 8 Park Soreang' }],
  openGraph: {
    title: 'Cluster 8 Park Soreang — Perumahan Modern di Jantung Kabupaten Bandung',
    description: 'Cluster eksklusif di Jantung Kabupaten Bandung dengan akses cepat, cicilan KPR ringan, dan lingkungan premium.',
    type: 'website',
    locale: 'id_ID',
  },
  alternates: {
    canonical: 'https://8parksoreanq.com',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-white">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}

