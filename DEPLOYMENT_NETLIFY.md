# Panduan Deploy ke Netlify

## 📋 Langkah-langkah Deploy ke Netlify

### 1️⃣ Buka Netlify Dashboard
- Kunjungi: https://app.netlify.com
- Login dengan akun GitHub Anda

### 2️⃣ Hubungkan Repository GitHub
1. Klik **"Add new site"** → **"Import an existing project"**
2. Pilih **GitHub** sebagai provider
3. Cari dan pilih repository: `8-PARK-SOREANG-NETLIFY`
4. Klik **Connect**

### 3️⃣ Konfigurasi Build Settings
Netlify akan otomatis detect file `netlify.toml`. Pastikan konfigurasi berikut ada:

```toml
[build]
command = "npm run build"
publish = ".next"
functions = "api"
environment = { NODE_ENV = "production", NODE_VERSION = "20" }

[[plugins]]
package = "@netlify/plugin-nextjs"
```

✅ Konfigurasi sudah ada di file `netlify.toml`

### 4️⃣ Setup Environment Variables
Di Netlify Dashboard:
1. Buka tab **Site settings** → **Build & deploy** → **Environment**
2. Tambahkan semua variabel dari `.env.local`:

#### Public Variables (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_SUPABASE_URL=https://fzpqjuqeorzpvdxlcwki.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHFqdXFlb3J6cHZkeGxjd2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTgyNzEsImV4cCI6MjA3ODg3NDI3MX0.OGrSfph5P4mzbHvbc1nvFZjS3pMtoqmBk_Ya6HPYkTQ
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiemFja3ByYXRhbWEiLCJhIjoiY21pMXRrc3kzMTFxNTJpc2Z0a2xyeHZ0MCJ9.WxhKpkvTEh3rq9fiPH9o-g
NEXT_PUBLIC_SITE_URL=https://8park-soreang.com
NEXT_PUBLIC_SITE_NAME=8 Park Soreang
NEXT_PUBLIC_CLUSTER_LAT=7.1234
NEXT_PUBLIC_CLUSTER_LNG=107.5678
NEXT_PUBLIC_CLUSTER_NAME=8 Park Soreang, Soreang, Bandung
NEXT_PUBLIC_WHATSAPP_NUMBER=62812345678
NEXT_PUBLIC_PHONE_NUMBER=+62-123-456-78
NEXT_PUBLIC_EMAIL=info@8parksoreang.com
```

#### Secret Variables (Server-only)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHFqdXFlb3J6cHZkeGxjd2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI5ODI3MSwiZXhwIjoyMDc4ODc0MjcxfQ.4T6uPYa5u54-y9P82It7UKLFHu0gltvWh2u0MzLl6V0
NODE_ENV=production
NODE_VERSION=20
```

### 5️⃣ Trigger Deploy
1. Klik tombol **"Deploy site"**
2. Tunggu proses build selesai (biasanya 2-3 menit)
3. Cek log untuk memastikan tidak ada error

### 6️⃣ Setup Domain Custom (Opsional)
1. Klik **Domain settings**
2. Tambahkan custom domain: `8park-soreang.com`
3. Setup DNS sesuai instruksi Netlify

---

## 🔧 Troubleshooting

### Build Gagal?
- Cek log build di Netlify Dashboard
- Pastikan `netlify.toml` ada di root project
- Pastikan plugin `@netlify/plugin-nextjs` terinstall

### Environment Variables Tidak Terbaca?
- Pastikan semua `NEXT_PUBLIC_*` variables ditambahkan
- Redeploy setelah menambah variables
- Cek di **Build & deploy** → **Environment**

### Static Files Tidak Muncul?
- Pastikan folder `public/` ada dan filled dengan assets
- Check cache settings di Headers configuration

---

## 📊 Fitur Netlify yang Digunakan

✅ **Build Command**: `npm run build`
✅ **Publish Directory**: `.next`
✅ **Next.js Runtime**: Plugin `@netlify/plugin-nextjs`
✅ **Cache Control**: Assets di-cache selamanya
✅ **Security Headers**: X-Content-Type-Options, X-Frame-Options, dll
✅ **Auto Preview Deploys**: Untuk setiap PR

---

## 🚀 Cara Deploy Update

Setiap kali ada perubahan di GitHub:
1. Commit dan push ke main branch
2. Netlify otomatis rebuild dan deploy
3. Cek deploy status di Netlify Dashboard

**Setup sudah selesai!** 🎉
