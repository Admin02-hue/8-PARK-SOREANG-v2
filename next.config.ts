/**
 * Next.js Configuration
 * =====================
 * Optimasi untuk production dan deployment ke Vercel
 */

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* Compression & Performance */
  compress: true,
  productionBrowserSourceMaps: false,

  /* Image Optimization */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '8park-soreang.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 tahun
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* Environment Variables */
  env: {
    NEXT_PUBLIC_SITE_NAME: '8 Park Soreang',
  },

  /* Headers */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  /* Redirects */
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },

  /* Turbopack Configuration */
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },

  /* React Compiler */
  reactCompiler: true,
}

export default nextConfig


