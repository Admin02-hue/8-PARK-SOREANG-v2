# Deploy ke Vercel

## 📋 Panduan Deployment

Proyek **8 Park Soreang** telah dikonfigurasi sepenuhnya untuk deployment di Vercel. Berikut adalah langkah-langkah untuk melakukan deployment:

---

## 1️⃣ Deploy dengan Vercel CLI

### Instalasi Vercel CLI
```bash
npm install -g vercel
```

### Deploy Pertama Kali
```bash
vercel
```

Ikuti prompt interaktif:
- Login ke akun Vercel Anda
- Pilih project name: `8-park-soreang`
- Pilih framework: `Next.js`
- Pilih root directory: `./`
- Build command akan otomatis terdeteksi: `next build`
- Output directory: `.next`

### Deploy Update
```bash
vercel --prod
```

---

## 2️⃣ Connect ke Vercel Dashboard

### Langkah Manual
1. Buka [vercel.com](https://vercel.com)
2. Klik **Add New...** → **Project**
3. Pilih Git Provider (GitHub, GitLab, Bitbucket)
4. Authorize Vercel
5. Pilih repository: `8-PARK-SOREANG-v2`
6. Klik **Import**
7. Framework akan auto-detected: **Next.js**
8. Klik **Deploy**

### Auto-Deployment dari Git
Setiap push ke branch `main` akan secara otomatis di-deploy ke production.

---

## 3️⃣ Konfigurasi Environment Variables

### Environment Variables yang Diperlukan

**Di Vercel Dashboard:**
1. Buka project settings → **Environment Variables**
2. Tambahkan variables berikut:

#### Public Variables (untuk client-side)
```
NEXT_PUBLIC_SUPABASE_URL
├─ Value: [Supabase project URL]
└─ Environments: Production, Preview, Development

NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ Value: [Supabase anonymous key]
└─ Environments: Production, Preview, Development
```

#### Secret Variables (untuk server-side)
```
SUPABASE_SERVICE_ROLE_KEY
├─ Value: [Supabase service role key]
└─ Environments: Production, Preview, Development
```

### Cara Mendapatkan Keys dari Supabase

1. **Login ke Supabase Dashboard** → Project Settings
2. **API Keys:**
   - `URL`: Di bagian "Project URL"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Di bagian "Anon public"
   - `SUPABASE_SERVICE_ROLE_KEY`: Di bagian "service_role" (SECRET!)

3. **Copy semua keys** dan paste ke Vercel Environment Variables

### Contoh `.env.local` untuk Testing Lokal
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4️⃣ Verifikasi Configuration

### Cek Build Lokal
```bash
npm run build
npm run start
```

### Test Production Build
```bash
vercel --prod --target production
```

### View Deployment Logs
```bash
vercel logs --tail
```

---

## 5️⃣ Best Practices untuk Production

### Security
✅ Semua environment variables sudah ter-setup di `vercel.json`  
✅ Security headers sudah dikonfigurasi:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Performance Optimization
✅ Build command: `next build`  
✅ Output directory: `.next`  
✅ Region: Singapore (sin1) untuk latency terendah  
✅ Source maps disabled untuk production

### Database Connection
✅ Service role key hanya di server-side  
✅ Anonymous key untuk client-side queries  
✅ RLS (Row Level Security) di Supabase aktif

---

## 6️⃣ Troubleshooting

### Build Fails dengan Error "Cannot find module"
```bash
# Hapus node_modules dan reinstall
rm -r node_modules
npm install

# Rebuild
npm run build
```

### Environment Variables Tidak Terdeteksi
1. Pastikan variable name exact sesuai di `.env.local`
2. Restart development server: `npm run dev`
3. Di Vercel, redeploy setelah set environment variables

### CORS Errors
1. Pastikan Supabase project sudah set allowed origins
2. Di Supabase: Settings → API Configuration → URL Configuration

### API Routes Timeout
Di `vercel.json` sudah dikonfigurasi:
- Max duration: 30 detik
- Runtime: Node.js 20.x
- Memory: 1024 MB

---

## 7️⃣ Monitoring & Analytics

### Vercel Analytics
- **Real-time logs**: `vercel logs --tail`
- **Performance metrics**: Dashboard → Analytics
- **Deployment history**: Dashboard → Deployments

### Error Tracking
- Check Vercel Logs untuk server-side errors
- Browser Console untuk client-side errors
- Supabase Dashboard untuk database errors

---

## 8️⃣ Rollback & Versions

### Rollback ke Previous Deployment
```bash
vercel --prod [commit-hash]
```

### View Deployment History
```bash
vercel ls
```

---

## ✅ Checklist Sebelum Go-Live

- [ ] Semua environment variables sudah ter-set di Vercel
- [ ] `npm run build` berjalan tanpa error
- [ ] `npm run dev` berjalan smooth
- [ ] Preview deployment berhasil ditest
- [ ] Production URL berhasil diakses
- [ ] Database connection berfungsi
- [ ] Admin dashboard accessible
- [ ] Live chat working
- [ ] Email notifications working
- [ ] Analytics working

---

## 📞 Support

Untuk bantuan lebih lanjut:
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: November 22, 2025  
**Project**: 8 Park Soreang - Enterprise Real Estate Platform  
**Framework**: Next.js 16 + React 18 + TypeScript
