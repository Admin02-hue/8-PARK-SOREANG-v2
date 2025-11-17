# 🚀 PANDUAN PRODUCTION DEPLOYMENT
# 8 Park Soreang - Next.js Real Estate Platform

## Status Aplikasi
✅ **BUILD PRODUCTION**: READY
✅ **DATABASE SCHEMA**: SIAP DI-EXECUTE
✅ **ADMIN PANEL**: IMPLEMENTED
✅ **ENVIRONMENT**: CONFIGURED

---

## 📋 CHECKLIST PRE-DEPLOYMENT

### 1. Database Setup ✅
- [ ] Login ke Supabase: https://supabase.com/dashboard
- [ ] Pilih project: **8Park Soreang**
- [ ] Buka SQL Editor
- [ ] Copy semua SQL dari `database-schema.sql`
- [ ] Run/Execute SQL query
- [ ] Verifikasi tabel sudah dibuat (units, leads, promotions, dll)

### 2. Environment Variables ✅
```bash
# File: .env.local SUDAH ADA dengan:
NEXT_PUBLIC_SUPABASE_URL=https://fzpqjuqeorzpvdxlcwki.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiemFja3ByYXRhbWEiLCJhIjoiY21pMXRrc3kzMTFxNTIi...
NODE_ENV=production
```

### 3. Build Verification ✅
```bash
cd c:\Users\zakim\OneDrive\Desktop\pt-delapan-binangkit
npm run build
# ✅ Build successful - 17.7s with Turbopack
```

---

## 🌐 PILIHAN DEPLOYMENT

### OPTION A: VERCEL (RECOMMENDED - Paling Mudah)

**Keuntungan:**
- ✅ Auto-deploy dari Git
- ✅ Free tier tersedia
- ✅ Edge functions untuk optimization
- ✅ Analytics built-in
- ✅ Preview deployment per PR
- ✅ Automatic SSL/HTTPS

**Steps:**

1. **Setup Git Repository:**
```bash
cd c:\Users\zakim\OneDrive\Desktop\pt-delapan-binangkit
git init
git add .
git commit -m "Initial commit: 8 Park Soreang production build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pt-8park.git
git push -u origin main
```

2. **Deploy ke Vercel:**
```bash
npm install -g vercel
vercel login
vercel
```

3. **Set Environment Variables di Vercel:**
```
Dashboard → Settings → Environment Variables
- SUPABASE_SERVICE_ROLE_KEY (SECRET)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_MAPBOX_TOKEN
```

4. **Custom Domain:**
```
Vercel Dashboard → Settings → Domains
Add: 8park-soreang.com (atau domain pilihan)
```

**URL Hasil:** https://pt-8park.vercel.app

---

### OPTION B: DOCKER + VPS (Untuk Kontrol Penuh)

**VPS Providers:**
- DigitalOcean ($5/bulan)
- Linode ($5/bulan)
- AWS EC2 (free tier)
- Hetzner (€3/bulan)

**Steps:**

1. **Build Docker Image:**
```bash
# Sudah ada Dockerfile di project
docker build -t 8park-soreang:latest .
```

2. **Setup VPS:**
```bash
# SSH ke VPS
ssh root@your_vps_ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Deploy Application:**
```bash
# Copy docker-compose.yml ke VPS
scp docker-compose.yml root@your_vps_ip:/opt/8park/

# SSH ke VPS dan start
ssh root@your_vps_ip
cd /opt/8park
docker-compose up -d

# Check status
docker-compose logs -f
```

4. **Setup Nginx Reverse Proxy:**
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/8park > /dev/null <<EOF
server {
    server_name 8park-soreang.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/8park /etc/nginx/sites-enabled/

# Restart nginx
sudo systemctl restart nginx

# Setup SSL (Let's Encrypt)
sudo certbot --nginx -d 8park-soreang.com
```

**URL Hasil:** https://8park-soreang.com

---

### OPTION C: TRADITIONAL HOSTING (cPanel/Plesk)

**Hosting Providers:**
- Niagahoster
- Hostinger
- Bluehost
- SiteGround

**Steps:**

1. **Build Locally:**
```bash
npm run build
```

2. **Upload ke Hosting:**
```
FTP/SFTP ke folder public_html/
Upload: .next/ dan node_modules/
Upload: package.json, package-lock.json
Upload: .env.local (PRIVATE!)
```

3. **Start Node.js Process:**
```bash
# Via cPanel - Setup Node.js Application
- Document Root: public_html/
- Application JS File: index.js
- Application Startup File: server.js
- Port: 3000 (auto)

# Via SSH/Terminal
pm2 start "npm start" --name "8park"
pm2 save
pm2 startup
```

---

## 🔐 SECURITY CHECKLIST

- [ ] DATABASE: Enable RLS (Row Level Security) - SUDAH DONE
- [ ] AUTH: Supabase Auth configured
- [ ] ENV: SERVICE_ROLE_KEY JANGAN di-hardcode client
- [ ] SSL/HTTPS: Aktifkan di domain Anda
- [ ] FIREWALL: Restrict database access
- [ ] BACKUPS: Enable di Supabase (auto daily)
- [ ] MONITORING: Setup error tracking (Sentry)

---

## 📊 MONITORING & ANALYTICS

### Setup Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
# Configure: sentry.server.config.ts & sentry.client.config.ts
```

### Setup Google Analytics
```
1. Create GA4 property
2. Add measurement ID ke .env
3. Implement tracking
```

### Supabase Analytics
- Dashboard → Analytics
- Track real-time metrics
- Monitor database performance

---

## 📱 ADMIN PANEL ACCESS

**Login URL:** https://8park-soreang.com/admin/login

**Features Available:**
- ✅ Dashboard dengan real-time stats
- ✅ Kelola unit properti
- ✅ Monitor leads & inquiries
- ✅ Manage promotions
- ✅ Track marketing events

**Setup Admin User:**
1. Di Supabase → Authentication → Users
2. Create user baru dengan email admin
3. Verify email
4. Login di admin/login

---

## 📈 POST-DEPLOYMENT TASKS

### Hari 1:
- [ ] Test semua fitur utama
- [ ] Test form submission
- [ ] Test WhatsApp integration
- [ ] Verify email notifications (jika aktif)
- [ ] Check Core Web Vitals

### Minggu 1:
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Monitor performance metrics
- [ ] Test mobile responsiveness

### Bulan 1:
- [ ] Optimize images & performance
- [ ] Setup advanced analytics
- [ ] Plan next features
- [ ] Train marketing team

---

## 🆘 TROUBLESHOOTING

### Build gagal?
```bash
# Clean install
rm -rf node_modules .next
npm install --frozen-lockfile
npm run build
```

### Database tidak connect?
```bash
# Check credentials di .env.local
# Verify Supabase project aktif
# Check RLS policies
# Test connection: curl SUPABASE_URL/rest/v1/units
```

### Admin login tidak bisa?
```bash
# Supabase → Auth → Providers
# Pastikan email/password provider aktif
# Create test user dulu
```

### Slow performance?
```bash
# Check image optimization
# Enable Vercel Analytics
# Monitor database query performance
# Use Lighthouse untuk audit
```

---

## 📞 SUPPORT & RESOURCES

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🎉 DEPLOYMENT SUKSES!

Jika semua checklist sudah done:

✅ Production URL: https://8park-soreang.com
✅ Admin Panel: https://8park-soreang.com/admin
✅ Database: Connected & Secured
✅ Monitoring: Active
✅ SSL/HTTPS: Enabled

**SELAMAT! Aplikasi sudah live! 🚀**

Monitoring terus untuk uptime, performa, dan user feedback!
