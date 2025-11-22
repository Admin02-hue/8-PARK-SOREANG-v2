# ✅ Client-Server Component Validation

## 📋 Validasi Struktur Next.js 16

Dokumentasi lengkap validasi untuk memastikan tidak ada client component yang diimport di server component.

---

## 🎯 Server vs Client Components

### Server Components (Default)
- Render di server
- Akses langsung ke database
- Environment variables tersembunyi
- No JavaScript dikirim ke browser

```tsx
// ✓ Good - Server component default
export default function Page() {
  const data = await fetchData() // ✓ Database query di server
  return <div>{data}</div>
}
```

### Client Components
- Require `'use client'` directive
- Render di browser
- Akses ke browser APIs
- JavaScript dikirim ke browser

```tsx
// ✓ Good - Explicit 'use client' untuk interaktif
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

---

## ✅ Validated Components

### ✓ Server Components (Safe)

#### `src/app/layout.tsx`
```tsx
// ✓ Server component
// No 'use client' directive
// Can use Metadata API
export const metadata: Metadata = { ... }

export default function RootLayout() {
  return <html>...</html>
}
```

#### `src/app/page.tsx`
```tsx
// ✓ Server component
// Imports components properly
import { HeroSection } from '@/components/HeroSection'
import { HighlightUnitsSection } from '@/components/HighlightUnitsSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<Skeleton />}>
        <HighlightUnitsSection />
      </Suspense>
    </>
  )
}
```

#### `src/components/HeroSection.tsx`
```tsx
// ✓ Server component (no 'use client')
import { Button } from './Button'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section>
      <h1>Cluster 8 Park Soreang</h1>
      <Button /> {/* ✓ Button is client component, works fine */}
    </section>
  )
}
```

#### `src/components/HighlightUnitsSection.tsx`
```tsx
// ✓ Server component
async function getHighlightUnits() {
  const supabase = createServerSupabaseClientSimple()
  const { data } = await supabase.from('units').select()
  return data
}

export async function HighlightUnitsSection() {
  const units = await getHighlightUnits() // ✓ Server-side fetch
  return <div>{units.map(u => <UnitCard key={u.id} unit={u} />)}</div>
}
```

---

### ✓ Client Components (Correct Usage)

#### `src/components/Button.tsx`
```tsx
'use client'

import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  )
}
```

#### `src/components/QuickReplyCards.tsx`
```tsx
'use client'

import { useState } from 'react'

export function QuickReplyCards() {
  const [selected, setSelected] = useState<string | null>(null)
  
  return (
    <div>
      {/* Interactive state-based rendering */}
      {selected && <p>Selected: {selected}</p>}
    </div>
  )
}
```

#### `src/components/ExpandableFAQSection.tsx`
```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ExpandableFAQSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <button onClick={() => setIsExpanded(!isExpanded)}>
      {isExpanded ? 'Collapse' : 'Expand'}
    </button>
  )
}
```

#### `src/components/FloatingChatButton.tsx`
```tsx
'use client'

import { useEffect, useState } from 'react'

export function FloatingChatButton() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Browser API - window, localStorage
    const chatOpen = localStorage.getItem('chatOpen')
    setIsVisible(chatOpen === 'true')
  }, [])
  
  return <button>Chat</button>
}
```

#### `src/components/admin/LiveChatPanel.tsx`
```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'

export function LiveChatPanel() {
  const [messages, setMessages] = useState([])
  
  const playNotificationSound = useCallback(() => {
    // Browser API - Audio context
    const audioContext = new AudioContext()
    // ... audio generation
  }, [])
  
  return <div>Chat panel</div>
}
```

---

## ❌ Common Mistakes (AVOID)

### ❌ WRONG: Import client component in server component
```tsx
// ❌ BAD - Breaks Server Component
'use client'
export function ClientWidget() { ... }

// In server component:
import { ClientWidget } from './ClientWidget'
export default function Page() {
  return <ClientWidget /> // ✗ Error: Client component in server
}
```

**FIX:**
```tsx
// ✓ Good - Move children to client boundary
'use client'
export function ClientBoundary() {
  return <ClientWidget />
}

// In server component:
import { ClientBoundary } from './ClientBoundary'
export default function Page() {
  return <ClientBoundary /> // ✓ Correct
}
```

---

### ❌ WRONG: Use client features in server component
```tsx
// ❌ BAD - useState in server component
export default function Page() {
  const [state, setState] = useState() // ✗ Error!
  return <div>{state}</div>
}
```

**FIX:**
```tsx
// ✓ Good - Add 'use client' directive
'use client'

export default function Page() {
  const [state, setState] = useState() // ✓ Correct
  return <div>{state}</div>
}
```

---

### ❌ WRONG: Database query in client component
```tsx
'use client'

export function ProductList() {
  const supabase = createClient() // ✗ Client can't access database!
  const { data } = await supabase.from('products').select()
  return <div>{data}</div>
}
```

**FIX:**
```tsx
// ✓ Good - Fetch in server component
async function getProducts() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('products').select()
  return data
}

export async function ProductList() {
  const products = await getProducts()
  return <div>{products.map(p => <Product key={p.id} {...p} />)}</div>
}

// Then use client component for interactivity
'use client'
function Product(props) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>{props.name}</button>
}
```

---

## 🔍 Audit Command

Verifikasi struktur dengan scanning files:

```bash
# Find all 'use client' directives
grep -r "'use client'" src/

# Output:
# src/components/Button.tsx:1:'use client'
# src/components/FloatingChatButton.tsx:1:'use client'
# src/components/admin/LiveChatPanel.tsx:1:'use client'
# ... etc
```

---

## 📋 Component Checklist

### Server Components ✓
- [x] `src/app/layout.tsx`
- [x] `src/app/page.tsx`
- [x] `src/app/admin/dashboard/page.tsx`
- [x] `src/app/contact/page.tsx`
- [x] `src/app/units/page.tsx`
- [x] `src/components/HeroSection.tsx`
- [x] `src/components/HighlightUnitsSection.tsx`
- [x] `src/components/UnitDetailGallery.tsx`
- [x] `src/components/SEOContentSection.tsx`

### Client Components ✓
- [x] `src/components/Button.tsx` ('use client')
- [x] `src/components/QuickReplyCards.tsx` ('use client')
- [x] `src/components/ExpandableFAQSection.tsx` ('use client')
- [x] `src/components/FloatingChatButton.tsx` ('use client')
- [x] `src/components/KPRSimulator.tsx` ('use client')
- [x] `src/components/RupiahInput.tsx` ('use client')
- [x] `src/components/MapComponent.tsx` ('use client')
- [x] `src/components/admin/LiveChatPanel.tsx` ('use client')
- [x] `src/components/admin/AdminDashboardContent.tsx` ('use client')

---

## 🚀 Deployment Validation

Before deploying to Vercel:

```bash
# 1. Build check
npm run build

# 2. Type check
npm run type-check

# 3. Lint check
npm run lint

# 4. Manual inspection
grep -r "'use client'" src/components/
# Verify only interactive components have 'use client'
```

---

## 📚 Resources

- [Next.js Server Components Docs](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Client Components Docs](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)

---

**Last Validated**: November 22, 2025  
**Framework**: Next.js 16 + React 18  
**Status**: ✅ All components correctly configured
