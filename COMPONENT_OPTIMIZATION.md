# 💻 COMPONENT OPTIMIZATION GUIDE
## Best Practices untuk 8 Park Soreang

---

## 🎯 OPTIMIZATION STRATEGIES

### 1. Dynamic Imports untuk Komponen Berat
Gunakan untuk komponen yang tidak diperlukan di awal page load

```tsx
// ✅ RECOMMENDED: Dynamic import dengan loading fallback
import dynamic from 'next/dynamic'

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { 
    loading: () => <div className="h-96 bg-gray-200 rounded animate-pulse" />,
    ssr: false // Jika komponen hanya bisa di-render client-side
  }
)

// Usage di page
export default function Page() {
  return (
    <>
      <HeroSection /> {/* Critical - render langsung */}
      <Suspense fallback={<LoadingSpinner />}>
        <MapComponent /> {/* Heavy - dynamic load */}
      </Suspense>
    </>
  )
}
```

### 2. React.memo untuk Komponen yang Jarang Berubah
```tsx
// ✅ GOOD: Memoize komponen dengan static props
const UnitCard = React.memo(function UnitCard({ unit, onSelect }) {
  return (
    <div onClick={() => onSelect(unit)}>
      <h3>{unit.name}</h3>
      <p>{unit.price}</p>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison jika perlu
  return prevProps.unit.id === nextProps.unit.id
})

export default UnitCard
```

### 3. useCallback untuk Event Handlers
```tsx
// ✅ GOOD: Prevent unnecessary re-renders
export default function ContactForm() {
  const [formData, setFormData] = useState({})

  // Memoized callback - tidak dibuat ulang setiap render
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    await submitForm(formData)
  }, [formData])

  return <form onSubmit={handleSubmit}>...</form>
}

// ❌ AVOID: Fungsi baru setiap render
const handleClick = () => { /* ... */ } // Created every render!
```

### 4. useMemo untuk Computed Values
```tsx
// ✅ GOOD: Cache expensive calculations
export default function UnitsList({ units, filter }) {
  // Expensive calculation hanya dijalankan jika units/filter berubah
  const filteredUnits = useMemo(() => {
    return units.filter(unit => 
      unit.type === filter && 
      unit.price <= maxPrice
    )
  }, [units, filter, maxPrice])

  return <div>...</div>
}
```

### 5. Image Optimization
```tsx
// ✅ GOOD: Next/Image dengan proper sizing
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority={true}        // For above-the-fold
  loading="lazy"         // For below-the-fold
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={80}           // Default 75
/>

// ❌ AVOID: Regular <img> tag
<img src="/hero.jpg" alt="Hero" /> // No optimization
```

### 6. Suspense Boundaries untuk Code Splitting
```tsx
// ✅ GOOD: Load sections progressively
import { Suspense } from 'react'

export default function Home() {
  return (
    <>
      <HeroSection /> {/* Critical */}
      
      <Suspense fallback={<LoadingSkelet />}>
        <HighlightUnitsSection /> {/* Can be lazy */}
      </Suspense>

      <Suspense fallback={<LoadingSkelet />}>
        <MapSection /> {/* Can be lazy */}
      </Suspense>

      <Suspense fallback={<LoadingSkelet />}>
        <ContactForm /> {/* Can be lazy */}
      </Suspense>
    </>
  )
}
```

---

## 🎯 COMPONENTS YANG PERLU OPTIMASI

### High Priority (Heavy Components)
1. **InteractiveHouseRotator** - 3D rendering heavy
   ```tsx
   const InteractiveHouseRotator = dynamic(
     () => import('@/components/InteractiveHouseRotator'),
     { loading: () => <RotatorSkeleton />, ssr: false }
   )
   ```

2. **MapComponent** - Geolocation + leaflet heavy
   ```tsx
   const MapComponent = dynamic(
     () => import('@/components/MapComponent'),
     { loading: () => <MapSkeleton />, ssr: false }
   )
   ```

3. **KPRSimulator** - Complex calculations
   ```tsx
   const KPRSimulator = dynamic(
     () => import('@/components/KPRSimulator'),
     { loading: () => <CalculatorSkeleton /> }
   )
   ```

### Medium Priority (Conditional Rendering)
1. **FloatingChatButton** - Memoize jika tidak perlu update
   ```tsx
   export default React.memo(FloatingChatButton)
   ```

2. **QuickReplyCards** - Use useCallback untuk handlers
3. **UnitCard** - Memoize list items

### Low Priority (Always Visible)
1. **HeroSection** - Critical path, inline
2. **Navbar** - Use memo + useCallback
3. **Footer** - Static content

---

## 📋 IMPLEMENTATION CHECKLIST

### Current State
- [x] Image optimization configured
- [x] React Compiler enabled
- [x] Code splitting setup
- [x] Turbopack enabled
- [ ] Dynamic imports untuk heavy components
- [ ] React.memo applied to list items
- [ ] useCallback for event handlers
- [ ] useMemo for expensive calculations
- [ ] Suspense boundaries configured

### Recommended Next Steps
1. **Week 1**: Add dynamic imports for MapComponent & InteractiveHouseRotator
2. **Week 2**: Memoize list rendering components
3. **Week 3**: Monitor Vercel Analytics & adjust
4. **Week 4**: Performance review & document findings

---

## 🧪 TESTING PERFORMANCE

### Local Testing
```bash
# Check bundle size
npm run build

# Profile render performance
# Chrome DevTools → Performance tab → Record

# Monitor in dev mode
npm run dev
# Then open http://localhost:3000/admin/smoke-test
```

### Vercel Monitoring
1. Go to Vercel Dashboard
2. Select your project
3. Analytics → Web Vitals
4. Monitor:
   - LCP (< 2.5s good)
   - FID (< 100ms good)
   - CLS (< 0.1 good)

---

## 🔥 COMMON PITFALLS

### ❌ DON'T
```tsx
// Bad: Create object in render
const onClick = () => handleClick() // New function every render

// Bad: Filter in render without memo
const filtered = items.filter(x => x.type === type)

// Bad: Inline styles
<div style={{color: 'red'}} /> // New object every render

// Bad: Import everything
import * as lucideIcons from 'lucide-react' // Bundles ALL icons

// Bad: No width/height on images
<Image src="/photo.jpg" alt="..." /> // Layout shift!
```

### ✅ DO
```tsx
// Good: Memoize callback
const onClick = useCallback(() => handleClick(), [])

// Good: Use useMemo
const filtered = useMemo(
  () => items.filter(x => x.type === type),
  [items, type]
)

// Good: CSS classes
<div className="text-red-500" />

// Good: Named imports
import { Users, MapPin } from 'lucide-react' // Only imports used

// Good: Always specify dimensions
<Image 
  src="/photo.jpg" 
  alt="..." 
  width={400} 
  height={300}
/>
```

---

## 📊 EXPECTED IMPROVEMENTS

### After Implementation
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| LCP | ~3s | ~2s | ⬇️ 33% |
| TTI | ~4s | ~2.5s | ⬇️ 37% |
| CLS | ~0.15 | ~0 | ⬇️ 100% |
| Bundle | ~250KB | ~180KB | ⬇️ 28% |

---

## 🚀 DEPLOYMENT READY

✅ All configuration optimized  
✅ Component optimization guidelines ready  
✅ Monitoring setup complete  
✅ Next optimization cycle planned

**Ready to deploy to Vercel!**

---

Generated: 2025-11-26
