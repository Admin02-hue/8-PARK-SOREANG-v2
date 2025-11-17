# ✅ Checklist Deploy ke Netlify

## 📋 Pre-Deployment Checklist

### ✓ Persiapan File
- [x] `netlify.toml` sudah dibuat dengan konfigurasi lengkap
- [x] `@netlify/plugin-nextjs` sudah terinstall
- [x] Build lokal berhasil: `npm run build`
- [x] Semua file sudah di-commit dan di-push ke GitHub

### ✓ Konfigurasi Build
- [x] Build command: `npm run build`
- [x] Publish directory: `.next`
- [x] Node version: 20
- [x] Environment: production

---

## 🚀 Langkah Deploy (Klik Demi Klik)

### Step 1: Buka Netlify
```
URL: https://app.netlify.com
Login dengan: GitHub account
```

### Step 2: Connect Repository
1. Klik: **"Add new site"** 
2. Pilih: **"Import an existing project"**
3. Provider: **GitHub**
4. Repository: Cari `8-PARK-SOREANG-NETLIFY`
5. Klik: **Connect**

### Step 3: Configure Build Settings
✅ Netlify otomatis detect dari `netlify.toml`

Verifikasi settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions**: `api`

### Step 4: Add Environment Variables
Masuk ke **Site settings** → **Build & deploy** → **Environment**

Tambahkan 14 variables dari `.env.local`:

**PUBLIC VARIABLES:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SITE_NAME
NEXT_PUBLIC_CLUSTER_LAT
NEXT_PUBLIC_CLUSTER_LNG
NEXT_PUBLIC_CLUSTER_NAME
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_PHONE_NUMBER
NEXT_PUBLIC_EMAIL
```

**SECRET VARIABLES:**
```
SUPABASE_SERVICE_ROLE_KEY
NODE_ENV=production
NODE_VERSION=20
```

### Step 5: Deploy
Klik: **"Deploy site"**

⏳ Tunggu 2-3 menit sampai selesai

### Step 6: Verify Deploy
- [x] Check build logs (tidak ada error)
- [x] Preview website bisa diakses
- [x] Semua environment variables terbaca
- [x] Static assets muncul dengan benar

---

## 📊 Deploy Configuration Summary

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Publish Directory | `.next` |
| Node Version | 20 |
| Framework | Next.js |
| Plugin | @netlify/plugin-nextjs |
| Environment | production |
| Auto Deploy | Enabled (main branch) |
| Preview Deploys | Enabled (Pull Requests) |

---

## 🔗 Important URLs

- **Netlify Dashboard**: https://app.netlify.com
- **Site Settings**: https://app.netlify.com/sites/[site-name]/settings
- **Deploys**: https://app.netlify.com/sites/[site-name]/deploys
- **Build Logs**: https://app.netlify.com/sites/[site-name]/deploys/[deploy-id]

---

## 📞 Support Contacts

**Netlify Support**: https://support.netlify.com
**Next.js Docs**: https://nextjs.org/docs
**Netlify Next.js Plugin**: https://github.com/netlify/next-runtime

---

## ✨ Setelah Deploy Berhasil

1. ✅ Catat Netlify Site URL (contoh: `https://8park-soreang.netlify.app`)
2. ✅ Setup custom domain (opsional)
3. ✅ Enable analytics (opsional)
4. ✅ Setup monitoring & notifications (opsional)
5. ✅ Document deployment details

---

**Status**: ✅ SIAP UNTUK DEPLOY
**Last Updated**: 17 November 2025
