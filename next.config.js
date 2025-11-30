/**
 * Next.js Configuration
 * =====================
 * Optimasi untuk production dan deployment ke Vercel
 * Dioptimasi untuk Core Web Vitals dan Performance
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Streaming & Optimization */
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
    qualities: [60, 70, 75, 80, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 tahun
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /* Environment Variables */
  env: {
    NEXT_PUBLIC_SITE_NAME: '8 Park Soreang',
  },

  /* Headers for Performance */
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          /* Cache Static Assets */
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
            source: '/static/:path*',
          },
          /* Cache Images */
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
            source: '/_next/image/:path*',
          },
          /* Cache JS/CSS */
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
            source: '/_next/static/:path*',
          },
        ],
      },
    ]
  },

  /* Redirects */
  redirects: async () => {
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

  /* Webpack Configuration */
  webpack: (config, { isServer }) => {
    // Optimize webpack bundling
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // React library
            react: {
              name: 'chunk-react',
              test: /[\/]node_modules[\/](react|react-dom)[\/]/,
              priority: 50,
              reuseExistingChunk: true,
            },
            // UI libraries
            ui: {
              name: 'chunk-ui',
              test: /[\/]node_modules[\/](lucide-react|embla-carousel|swiper)[\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Common dependencies
            common: {
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },

  /* Experimental Features untuk Performance */
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hook-form', 'clsx'],
    
    
    
  },

  /* SWR - Stale While Revalidate */
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },

  /* Skip Validasi untuk Build Lebih Cepat */
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}

module.exports = nextConfig
