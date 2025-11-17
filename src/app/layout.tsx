/**
 * Root Layout
 * ===========
 * Layout utama aplikasi dengan providers dan global styles
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutClient from './layout-client'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '8 Park Soreang - Rumah Impian Anda di Bandung',
  description:
    'Cluster perumahan modern dengan lokasi strategis, fasilitas lengkap, dan harga terjangkau. Cicilan ringan tanpa DP.',
  keywords: [
    'rumah',
    'soreang',
    'bandung',
    'cluster',
    'perumahan',
    'kpr',
    'cicilan',
  ],
  authors: [{ name: '8 Park Soreang' }],
  openGraph: {
    title: '8 Park Soreang',
    description: 'Rumah Impian Anda di Bandung',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}

