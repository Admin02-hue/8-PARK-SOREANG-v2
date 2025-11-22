# 🚀 Build Optimization untuk Production

## 📊 Overview

Panduan lengkap untuk mengoptimalkan build dan performance aplikasi **8 Park Soreang** sebelum deployment ke Vercel.

---

## 1️⃣ Production Build Optimization

### Disable Source Maps
✅ **Sudah ter-konfigurasi di `next.config.ts`**

```typescript
productionBrowserSourceMaps: false,
```

**Keuntungan:**
- Mengurangi ukuran bundle hingga 30-40%
- Faster deployment time
- Mengurangi bandwidth
- Server-side error tracking tetap berfungsi

**Untuk Development (local debugging):**
```bash
npm run dev
```
Source maps otomatis enable di development.

---

## 2️⃣ Image Optimization

### Preload Hero Images
Sudah dikonfigurasi di `src/components/HeroSection.tsx`:

```tsx
<Image
  src="/hero-section.jpg"
  alt="Cluster 8 Park Soreang"
  priority  // ← Preload di LCP (Largest Contentful Paint)
  width={1920}
  height={1080}
/>
```

### Image Formats & Quality
✅ **Next.js Image Optimization**

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  qualities: [75, 90],
  minimumCacheTTL: 60 * 60 * 24 * 365, // Cache 1 tahun
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### Best Practices

✅ Gunakan `priority` hanya untuk hero/LCP images
```tsx
<Image priority src="/hero.jpg" ... /> // ✓ Good
<Image priority src="/small-icon.png" ... /> // ✗ Bad
```

✅ Selalu set width & height untuk `<Image />`
```tsx
<Image width={1200} height={600} src="..." /> // ✓ Good
<Image src="..." /> // ✗ Bad (causes layout shift)
```

✅ Gunakan responsive images dengan `srcSet`
```tsx
<Image
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  src="/image.jpg"
/>
```

---

## 3️⃣ Dynamic Imports & SSR

### ✅ Server Components (Default)
Komponen yang tidak perlu interaktif:

```tsx
// ✓ Good - Render di server
export default function HeroSection() {
  return <section>...</section>
}
```

### ✅ Client Components (Use Sparingly)
Hanya untuk interaktif components:

```tsx
'use client'

import { useState } from 'react'

export function QuickReplyCards() {
  const [selected, setSelected] = useState(null)
  return <div>{selected}</div>
}
```

### ❌ Dynamic Imports - Hanya untuk Server Components

**WRONG:**
```tsx
'use client'

import dynamic from 'next/dynamic'

export function Page() {
  // ✗ Dynamic di client component = masalah SSR
  const Modal = dynamic(() => import('./Modal'), { ssr: false })
  return <Modal />
}
```

**CORRECT:**
```tsx
// Server component
import dynamic from 'next/dynamic'

const Modal = dynamic(() => import('./Modal'), { ssr: false })

export function Page() {
  return <Modal /> // ✓ Works correctly
}
```

### ✅ Suspended Components (Server)

```tsx
import { Suspense } from 'react'

export function HomePage() {
  return (
    <>
      <HeroSection /> {/* Renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <HighlightUnitsSection /> {/* Streams in background */}
      </Suspense>
    </>
  )
}
```

---

## 4️⃣ Bundle Size Optimization

### Analyze Bundle
```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.ts`:
```typescript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
```

Analyze:
```bash
ANALYZE=true npm run build
```

### Common Bundle Issues

❌ **Large Dependencies**
```tsx
// ✗ Bad - Large library for simple use
import * as lodash from 'lodash'
const uniq = lodash.uniq([1, 2, 1])
```

✅ **Tree Shaking**
```tsx
// ✓ Good - Only import what you need
import { uniq } from 'lodash'
const result = uniq([1, 2, 1])
```

✅ **Code Splitting**
```tsx
// ✓ Good - Lazy load heavy component
const HeavyChart = dynamic(() => import('./Chart'), {
  loading: () => <p>Loading...</p>,
})
```

---

## 5️⃣ API Routes Optimization

### Vercel Edge Functions
Gunakan Edge Runtime untuk API yang fast-path:

```typescript
// api/health/route.ts - Response dalam <100ms
export const runtime = 'edge'

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }))
}
```

### Database Connection Pooling
✅ Supabase connection sudah pooled

```typescript
// ✓ Efficient - reuse connection
const supabase = createClient<Database>(...)
const { data } = await supabase.from('units').select()
```

### API Response Caching
```typescript
export async function GET(req: Request) {
  // Cache for 1 hour
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

---

## 6️⃣ Font Optimization

### Google Fonts
```tsx
// src/app/layout.tsx
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap', // ← Prevent font flashing
})

export default function RootLayout() {
  return (
    <html className={`${inter.variable} ${poppins.variable}`}>
      <body />
    </html>
  )
}
```

---

## 7️⃣ CSS Optimization

### Tailwind CSS - Production
✅ Sudah ter-konfigurasi di `tailwind.config.ts`

**Automatic:**
- Hanya include CSS yang digunakan (tree-shaking)
- Minify dan compress otomatis
- Production build ~15KB gzipped

**Manual Optimization:**
```typescript
// tailwind.config.ts
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  // ✓ Only include used screens
  theme: {
    extend: {
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
}
```

---

## 8️⃣ JavaScript Optimization

### Minification
✅ **Automatic di Production**

Next.js otomatis minify semua JS di build time.

### Tree Shaking
```tsx
// ✓ Good - Unused exports akan di-shake
export function usedFunction() { }
export function unusedFunction() { }
```

### Unused Code Elimination
```tsx
// ✓ Good - Remove dead code
const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  console.log('Debug info') // Removed in production
}
```

---

## 9️⃣ Performance Metrics

### Lighthouse Scores Target
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 100

### Core Web Vitals
```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### Test Lokal
```bash
npm run build
npm run start
# Open browser DevTools → Lighthouse → Run audit
```

---

## 🔟 Build Checklist

Sebelum deploy ke production:

```bash
# 1. Clean build
rm -rf .next node_modules
npm install

# 2. Build dan test
npm run build
npm run start

# 3. Check bundle size
ANALYZE=true npm run build

# 4. Type checking
npm run type-check

# 5. Linting
npm run lint

# 6. Final verification
vercel --prod --target production
```

---

## 🎯 Deployment Checklist

- [ ] `npm run build` passes tanpa warning
- [ ] `npm run start` berjalan smooth
- [ ] Core Web Vitals all green
- [ ] Lighthouse score 90+
- [ ] No console errors in production
- [ ] Images load correctly
- [ ] API routes responding fast
- [ ] Database queries optimized
- [ ] Environment variables set di Vercel
- [ ] SSL certificate valid

---

## 📈 Monitoring Performance

### Vercel Analytics
```bash
vercel logs --tail
```

### Real User Monitoring (RUM)
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* Automatic RUM */}
      </body>
    </html>
  )
}
```

### Edge Function Performance
Dashboard → Edge Performance → View metrics

---

## 🚨 Common Issues & Solutions

### Issue: Build too slow
**Solution:**
```bash
# Check what's taking time
npm run build -- --debug
```

### Issue: Large bundle
**Solution:**
```bash
ANALYZE=true npm run build
# Identify and replace large dependencies
```

### Issue: API timeout
**Solution:**
Increase timeout di `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": { "maxDuration": 60 }
  }
}
```

---

**Last Updated**: November 22, 2025  
**Framework**: Next.js 16 + TypeScript + Tailwind CSS  
**Deployment**: Vercel (Singapore Region)
