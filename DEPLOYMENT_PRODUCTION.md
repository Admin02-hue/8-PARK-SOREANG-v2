# 🚀 Production Deployment Guide - 8 Park Soreang

**Last Updated**: 17 November 2024  
**Status**: ✅ Production Ready  
**Environment**: Vercel + Supabase

---

## 📋 Pre-Deployment Checklist

Sebelum deploy ke production, pastikan:

- [ ] Semua environment variables sudah dikonfigurasi di Vercel dashboard
- [ ] Database migration sudah berjalan di Supabase
- [ ] Build test berhasil: `npm run build` (0 errors)
- [ ] Tidak ada console warnings atau errors
- [ ] SSL certificate active dan valid
- [ ] Backups database sudah di-setup
- [ ] Monitoring & alerts sudah configured
- [ ] Vercel analytics enabled
- [ ] Git repository clean dan updated

---

## 🔐 Environment Variables untuk Vercel

### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
```

### Optional Variables (Server-side)
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Hanya untuk API routes
```

### Cara Menambah Variables di Vercel

1. Buka [vercel.com](https://vercel.com) → Project Settings
2. Navigasi ke "Environment Variables"
3. Click "Add New"
4. Input variable name dan value
5. Select environment: `Production`
6. Click "Save"
7. Trigger redeploy atau tunggu next deployment

⚠️ **IMPORTANT**: 
- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke public
- Rotate keys setiap 6 bulan
- Use strong, unique keys

---

## 🎯 Deployment Steps

### Via Vercel Dashboard (Recommended)

#### Step 1: Connect GitHub Repository
```
1. Login ke vercel.com
2. Click "Add New Project"
3. Connect GitHub account
4. Select repository "pt-delapan-binangkit"
5. Click "Import"
```

#### Step 2: Configure Build Settings
```
Framework: Next.js
Node Version: 18.x (Recommended) atau 20.x
Build Command: next build (default)
Output Directory: .next (default)
```

#### Step 3: Add Environment Variables
```
Environment: Production
NEXT_PUBLIC_SUPABASE_URL = [your-value]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-value]
NEXT_PUBLIC_MAPBOX_TOKEN = [your-value]
```

#### Step 4: Deploy
```
Click "Deploy"
Tunggu build selesai (biasanya 3-5 menit)
Production URL akan generate otomatis
```

### Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 📊 Post-Deployment Verification

Setelah deployment, verifikasi:

### 1. ✅ Application Health
```bash
curl https://your-production-url.vercel.app/
# Expected: 200 OK dengan HTML content
```

### 2. ✅ API Routes
```bash
curl https://your-production-url.vercel.app/api/health
# Verify semua API endpoints working
```

### 3. ✅ Environment Variables Loaded
- Buka aplikasi
- Inspect console (F12)
- Cek tidak ada `undefined` dalam `process.env`

### 4. ✅ Database Connection
- Navigasi ke `/units` page
- Verify data dari database muncul
- Check console untuk connection errors

### 5. ✅ Maps Integration
- Buka `/lokasi` page
- Verify Mapbox map render correctly
- No CORS errors di console

### 6. ✅ Performance Metrics
- Buka Vercel Analytics
- Check Lighthouse scores (target: 80+)
- Monitor Core Web Vitals

---

## 🔄 Continuous Deployment

Vercel otomatis deploy setiap kali ada push ke main branch:

```
Developer push → GitHub → Vercel detects change
                             ↓
                    Build process starts
                             ↓
                    All tests pass?
                             ↓
                    Deploy to production
                             ↓
                    Notify success
```

**To disable auto-deploy**: 
- Project Settings → Git → Toggle "Automatic Deployments"

---

## 🐛 Troubleshooting Deployment

### Issue: Build fails dengan "Cannot find module X"
```bash
# Solution
1. Push ke repository
2. Vercel akan auto-rebuild
3. If still fails:
   - Check package.json
   - Run npm install locally
   - Push again
```

### Issue: Environment variables undefined
```bash
# Solution
1. Vercel dashboard → Settings → Environment Variables
2. Verify all variables sudah added
3. Redeploy dengan:
   vercel --prod --force
```

### Issue: Database connection timeout
```bash
# Solution
1. Check Supabase project status
2. Verify connection string di .env
3. Check firewall rules di Supabase
4. Restart connection pool
```

### Issue: Static assets 404
```bash
# Solution
1. Check files ada di /public folder
2. Verify file permissions
3. Check build output di .next folder
4. Redeploy project
```

---

## 📈 Monitoring & Analytics

### Vercel Analytics
- Buka Project → Analytics tab
- Monitor: Page views, Route performance, Core Web Vitals
- Set up alerts untuk performance degradation

### Error Tracking
- Buka Project → Deployments → Logs
- Check untuk build/runtime errors
- Monitor error rate

### Database Monitoring
- Vercel postgre monitoring (jika using Vercel Postgres)
- Supabase dashboard untuk query performance
- Setup automated backups

---

## 🔄 Rollback Procedure

Jika ada issue di production:

```bash
# Option 1: Vercel Dashboard
1. Project → Deployments
2. Find previous stable deployment
3. Click three-dots → "Redeploy"

# Option 2: CLI
vercel rollback
```

**Rollback time**: ~1-2 minutes

---

## 🛡️ Security Checklist

- [ ] HTTPS enabled (automatic di Vercel)
- [ ] Environment variables tidak logged
- [ ] Database credentials di Supabase (not in repo)
- [ ] API keys rotated monthly
- [ ] CORS properly configured
- [ ] SQL injection protection (via Supabase)
- [ ] XSS protection headers set
- [ ] Rate limiting configured (if needed)

---

## 📊 Production Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Score | 90+ | TBD |
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Cumulative Layout Shift | < 0.1 | TBD |
| Time to Interactive | < 3s | TBD |
| Uptime | 99.9% | TBD |

---

## 📞 Support & Escalation

### Common Questions

**Q: Bagaimana cara update content?**  
A: Update di database via Supabase dashboard atau admin panel

**Q: Bagaimana cara manage users?**  
A: Via Supabase Auth → Users tab

**Q: Bagaimana cara backup database?**  
A: Supabase otomatis daily backups (Settings → Backups)

**Q: Bagaimana cara scale aplikasi?**  
A: Vercel otomatis scale berdasarkan traffic

### Contact Support
- 📧 Email: 8parksoreangcluster@gmail.com
- 📱 WhatsApp: +62 813-8331-5039
- 💬 GitHub Issues: [Create issue](https://github.com/your-org/8-park-soreang/issues)

---

## 📅 Maintenance Schedule

| Task | Frequency | Responsibility |
|------|-----------|-----------------|
| Security updates | Weekly | DevOps Team |
| Database maintenance | Monthly | Database Admin |
| Performance audit | Monthly | Tech Lead |
| Backup verification | Weekly | DevOps Team |
| Certificate renewal | Auto (Vercel) | N/A |
| Dependency updates | Monthly | DevOps Team |

---

## 🎓 References

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Mapbox Documentation](https://docs.mapbox.com)

---

**Version**: 1.0.0  
**Last Updated**: 17 November 2024  
**Status**: ✅ Ready for Production
