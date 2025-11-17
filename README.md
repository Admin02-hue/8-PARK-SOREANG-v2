# 8 Park Soreang - Premium Residential Cluster Platform

![8 Park Soreang](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-16.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

Platform real-estate modern untuk **Cluster 8 Park Soreang** - Perumahan premium strategis di Soreang, Bandung dengan teknologi enterprise-level.

## 🏢 Tentang Project

**8 Park Soreang** adalah platform digital untuk showcase dan penjualan unit perumahan modern dengan:
- ✨ UI/UX premium dengan glass morphism design
- 🏠 Database lengkap unit dengan spesifikasi & gallery
- 💰 Simulator KPR real-time
- 📍 Integrasi Mapbox untuk lokasi
- 📱 Fully responsive (mobile-first)
- ⚡ Performance optimized (Next.js App Router)
- 🔐 Enterprise-grade security

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components + Lucide Icons
- **Animations**: Framer Motion
- **Form**: React Hook Form + Zod validation

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **API**: Next.js API Routes (Server Side)

### Maps & Location
- **Mapbox GL**: Interactive maps
- **Leaflet**: Fallback maps library
- **Geocoding**: Mapbox Geocoder

### Deployment
- **Hosting**: Vercel
- **CI/CD**: Vercel Git Integration
- **Monitoring**: Vercel Analytics

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account (free tier available)
- Mapbox account (free tier available)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/8-park-soreang.git
cd 8-park-soreang
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` di root project:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Production (optional)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**⚠️ PENTING**: Jangan pernah commit `.env.local` ke repository!

### 4. Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🚀 Deployment ke Vercel

### Requirement
- Vercel account (free tier cukup)
- GitHub repository connected

### Step-by-step Deployment

#### Option 1: Via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Buka [vercel.com](https://vercel.com)
   - Sign in dengan GitHub
   - Click "Add New Project"
   - Select repository `8-park-soreang`
   - Click "Import"

2. **Configure Environment Variables**
   - Di "Environment Variables" section, tambahkan:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   NEXT_PUBLIC_MAPBOX_TOKEN = your_mapbox_token
   ```

3. **Deploy**
   - Click "Deploy"
   - Tunggu proses build selesai (~3-5 menit)
   - URL production akan generate otomatis

#### Option 2: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Production Checklist

- ✅ Semua environment variables sudah dikonfigurasi di Vercel
- ✅ Database migration sudah jalan di Supabase
- ✅ Build successfully: `npm run build`
- ✅ No console errors di production
- ✅ SSL certificate sudah active
- ✅ Analytics & monitoring enabled

## 📝 Build & Start Commands

```bash
# Development
npm run dev              # Start dev server (hot reload)
npm run build            # Build untuk production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format code dengan Prettier
```

## 📂 Project Structure

```
8-park-soreang/
├── public/                 # Static assets (images, videos)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── units/         # Units listing & detail
│   │   ├── lokasi/        # Location page
│   │   ├── fasilitas/     # Facilities page
│   │   ├── admin/         # Admin dashboard
│   │   └── api/           # API routes
│   ├── components/        # Reusable React components
│   ├── lib/              # Utilities & helpers
│   │   ├── supabase.ts   # Supabase client
│   │   ├── formatters.ts # Formatting utilities
│   │   └── actions.ts    # Server actions
│   └── types/            # TypeScript type definitions
├── scripts/              # Build & automation scripts
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind CSS config
├── next.config.ts        # Next.js config
├── vercel.json          # Vercel deployment config
├── .env.local           # Local environment (git-ignored)
└── README.md            # This file
```

## 🔐 Environment Variables

Semua environment variables yang diperlukan:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJ...` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Mapbox public token | `pk.ey...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Service role (server-side only) | `eyJ...` |

**Security Notes:**
- Variables dengan prefix `NEXT_PUBLIC_` diekspos ke client (aman untuk public keys)
- Variables tanpa prefix hanya tersedia di server (aman untuk secrets)
- Jangan pernah expose service role key ke client
- Rotate keys secara berkala di production

## 🌐 Fitur Utama

### 1. **Home Page**
- Hero section dengan CTA
- Highlight featured units
- Fasilitas showcase
- Contact CTA section

### 2. **Units Catalog**
- Listing semua unit tersedia
- Advanced filters (tipe, harga, status)
- Sorting options
- Unit detail pages

### 3. **Unit Detail**
- Gallery dengan lightbox
- Spesifikasi teknis
- Informasi harga
- KPR simulator
- Related units
- CTA buttons (WhatsApp, call)

### 4. **Location Page**
- Interactive Mapbox map
- Lokasi geografis
- Akses transportasi
- Dekat dengan fasilitas

### 5. **Facilities Page**
- Daftar lengkap fasilitas
- Icon & description
- Aksesbilitas

### 6. **Admin Dashboard** *(Protected)*
- Login admin
- Unit management
- Gallery upload
- Settings

## 📊 Performance Metrics

- ⚡ Lighthouse Score: 90+
- 🚀 First Contentful Paint: < 1.5s
- 📱 Mobile Friendly: 100%
- 🔒 Security Score: A+
- ♿ Accessibility: WCAG 2.1 AA

## 🐛 Troubleshooting

### Issue: "Cannot find module 'supabase'"
```bash
npm install @supabase/supabase-js
```

### Issue: Build error di Vercel
```bash
# Hapus node_modules dan lock file
rm -rf node_modules
npm install
npm run build
```

### Issue: Environment variables tidak loaded
- Pastikan variable sudah di-set di Vercel dashboard
- Redeploy project setelah menambah variable baru
- Check `.env.local` untuk development

### Issue: Mapbox map tidak muncul
- Verify Mapbox token di environment
- Check token permissions di Mapbox dashboard
- Pastikan tidak ada CORS errors di browser console

## 📱 Responsive Breakpoints

```css
/* Mobile First */
default    : 375px - 424px
sm         : 640px
md         : 768px
lg         : 1024px
xl         : 1280px
2xl        : 1536px
```

## 🔄 CI/CD Pipeline

Vercel otomatis:
1. **Build**: Next.js build process
2. **Test**: Run linter (ESLint)
3. **Deploy**: Zero-downtime deployment
4. **Monitoring**: Automatic error tracking

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Database backups: Automatic di Supabase
- Monitor Vercel Analytics

### Contact
- 📧 **Email**: 8parksoreangcluster@gmail.com
- 📱 **WhatsApp**: +62 813-8331-5039
- 📍 **Lokasi**: Soreang, Kabupaten Bandung, Jawa Barat

## 📄 License

Proprietary © 2024 PT. Delapan Binang Kit. All rights reserved.

---

**Terakhir diupdate**: 17 November 2024
**Status**: ✅ Production Ready
**Versi**: 1.0.0
