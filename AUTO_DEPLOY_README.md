# 🔥 ONE-COMMAND AUTO DEPLOY WORKFLOW

## 🚀 Pendahuluan

Script `auto-deploy.sh` mengotomatisasi seluruh process deployment dari development ke production dengan **satu command saja**!

Tidak perlu lagi:
- ❌ Manual git commits
- ❌ Manual dependency installation
- ❌ Manual build testing
- ❌ Manual Vercel login
- ❌ Manual staging & production deployment

Semuanya otomatis, dari ujung ke ujung! 🤖

---

## 📦 Apa yang Dilakukan Script?

Script ini melakukan **9 langkah automation** secara berurutan:

```
1️⃣  Git Status Check & Auto-Commit
    ├─ Check if Git repo exists
    ├─ Auto-stage uncommitted changes
    └─ Create automatic commit with timestamp

2️⃣  Project Structure Validation
    ├─ Verify package.json exists
    ├─ Verify vercel.json exists
    ├─ Verify next.config exists
    ├─ Verify src/app directory
    └─ Check for configuration issues

3️⃣  Component Architecture Validation
    ├─ Scan for 'use client' directives
    ├─ Check server→client imports
    ├─ Verify dynamic imports placement
    └─ Validate useState usage
    
4️⃣  Install Dependencies
    ├─ Use npm ci if package-lock exists
    └─ Use npm install as fallback

5️⃣  Production Build Test
    ├─ Run: npm run build
    ├─ Track build time
    ├─ Validate .next folder
    └─ Stop if build fails

6️⃣  Vercel CLI Verification
    ├─ Check if Vercel CLI installed
    └─ Install globally if missing

7️⃣  Vercel Authentication
    ├─ Check current login status
    └─ Launch login if needed

8️⃣  Staging Deployment
    ├─ Deploy to staging environment
    ├─ Extract staging URL
    └─ Track deployment time

9️⃣  Production Deployment
    ├─ Deploy to production
    ├─ Extract production URL
    ├─ Generate deployment summary
    └─ Print next steps
```

---

## 💻 Installation & Setup

### 1. Verifikasi Prerequisites

```bash
# Git
git --version

# Node.js
node --version
npm --version

# Node 18+ dan npm 9+ recommended
```

### 2. Clone/Open Project

```bash
cd ~/path/to/pt-delapan-binangkit
```

### 3. Verifikasi Files Exist

```bash
ls -la auto-deploy.sh
ls -la vercel.json
ls -la package.json
```

---

## 🎯 Usage

### Quick Deploy (One Command)

```bash
bash auto-deploy.sh
```

atau

```bash
./auto-deploy.sh
```

atau di Windows (Git Bash):

```bash
bash ./auto-deploy.sh
```

### Interactive Deployment

Script akan secara **otomatis**:
1. Commit semua perubahan
2. Validate struktur project
3. Install dependencies
4. Build & test
5. Deploy ke staging
6. Deploy ke production
7. Print summary report

**Anda tidak perlu interaksi sama sekali!** ✨

---

## 📊 Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 1️⃣  Git Status Check & Auto-Commit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Git repository found
⚠️  Uncommitted changes detected
✅ Changes committed
ℹ️  Branch: main
ℹ️  Commits: 42
ℹ️  Latest: feat: add expandable FAQ section

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 2️⃣  Project Structure Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ✓ package.json exists
✅ ✓ vercel.json exists
✅ ✓ next.config exists
✅ ✓ src/app directory exists

... [more steps] ...

════════════════════════════════════════════════════════
✅ DEPLOYMENT COMPLETED SUCCESSFULLY!
════════════════════════════════════════════════════════

📊 DEPLOYMENT STATISTICS:
  Total Time: 3m 45s
  Build Time: 89s
  Staging Deploy: 32s
  Production Deploy: 28s

🔗 DEPLOYMENT URLS:
  Staging:     https://8-park-soreang-git-main-xxxxx.vercel.app
  Production:  https://8-park-soreang.vercel.app

📝 GIT INFORMATION:
  Branch:      main
  Commits:     43
  Latest:      🚀 Auto deploy: 2025-11-22 14:30:45
  Changes:     5 files changed, 42 insertions(+), 8 deletions(-)

⚙️  PROJECT INFORMATION:
  Components: 20 total, 10 client
  Build Size: 245M

════════════════════════════════════════════════════════

📋 NEXT STEPS:
  1. Visit staging: https://8-park-soreang-git-main-xxxxx.vercel.app
  2. Test functionality
  3. If everything works, visit production: https://8-park-soreang.vercel.app
  4. Monitor logs: vercel logs --tail

🔧 USEFUL COMMANDS:
  View deployment logs:    vercel logs --tail
  Rollback:                vercel rollback
  View all deployments:    vercel ls
  Check environment vars:  vercel env ls

🚀 AUTO-DEPLOY COMPLETE! Your project is now live.
Timestamp: 2025-11-22 14:34:30
```

---

## ⚙️ Configuration

### Customize Script (Optional)

Edit `auto-deploy.sh` untuk mengubah behavior:

#### 1. Change Region
```bash
# Di auto-deploy.sh, line 8
"regions": ["sin1"]  # Singapore
"regions": ["iad1"]  # Virginia (USA)
"regions": ["lhr1"]  # London
```

#### 2. Auto-Open URLs (Optional)
Uncomment di akhir script:

```bash
# Uncomment untuk auto-open production URL
if command -v xdg-open &> /dev/null; then
    xdg-open "$PROD_URL"  # Linux
elif command -v open &> /dev/null; then
    open "$PROD_URL"      # macOS
fi
```

#### 3. Environment Variables
Di `vercel.json`, update:

```json
"env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
}
```

---

## 🔍 Validation Details

### Git Validation
- ✓ Check if git repo exists
- ✓ Initialize if missing
- ✓ Auto-stage & commit changes
- ✓ Get branch info
- ✓ Get commit history

### Structure Validation
- ✓ package.json exists
- ✓ vercel.json exists
- ✓ next.config.ts/js exists
- ✓ src/app directory exists
- ✓ Report status

### Component Architecture
- ✓ Count client components ('use client' directives)
- ✓ Check for server→client imports
- ✓ Validate dynamic imports placement
- ✓ Check for useState in server components
- ✓ Generate warnings for issues

### Build Validation
- ✓ Run production build
- ✓ Track build time
- ✓ Verify .next output
- ✓ Stop if build fails

---

## 🚨 Error Handling

### Build Failed?
Script otomatis berhenti dan print error:

```
❌ Build failed! Stopping deployment...
❌ Run 'npm run build' locally for details
```

**Solusi:**
```bash
npm run build
# Fix errors locally
```

### Git Commit Failed?
Script melanjutkan dengan warning:

```
⚠️  Could not commit changes
ℹ️  Run: git status
```

### Vercel Login Failed?
Script akan launch browser untuk login interaktif.

---

## 📱 Workflow Integration

### Pre-Deployment Checklist
Sebelum run script:

- [ ] Semua code changes tested locally
- [ ] Environment variables set di Vercel
- [ ] Database migrations completed
- [ ] No console errors di dev server
- [ ] Lighthouse score 90+

### Post-Deployment Checklist

Setelah deployment:

- [ ] Visit staging URL & test features
- [ ] Check production URL
- [ ] Monitor Vercel logs: `vercel logs --tail`
- [ ] Check database queries: `vercel env ls`
- [ ] Verify email notifications working

---

## 🔧 Useful Commands During Deployment

```bash
# View real-time logs
vercel logs --tail

# Check deployment history
vercel ls

# Rollback to previous deployment
vercel rollback

# View environment variables
vercel env ls

# Check project info
vercel project list

# View function metrics
vercel function list

# Test build locally
npm run build
npm run start
```

---

## 📋 Automation Schedule (Optional)

### Setup GitHub Actions (CI/CD)

Create `.github/workflows/auto-deploy.yml`:

```yaml
name: Auto Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: bash auto-deploy.sh
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Scheduled Deployments (Optional)

Setup cron job untuk regular deployments:

```bash
# Edit crontab
crontab -e

# Deploy setiap hari jam 2 AM
0 2 * * * cd ~/pt-delapan-binangkit && bash auto-deploy.sh
```

---

## 🎓 Script Breakdown

### Performance Tracking
```bash
START_TIME=$(date +%s)
# ... do work ...
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
```

### Colored Output
```bash
# Red untuk errors
echo -e "${RED}❌ Error${NC}"

# Green untuk success
echo -e "${GREEN}✅ Success${NC}"

# Yellow untuk warnings
echo -e "${YELLOW}⚠️  Warning${NC}"
```

### Error Handling
```bash
set -e  # Exit on first error
# ... commands ...
```

### Safe Checks
```bash
if [ ! -f package.json ]; then
    log_error "File not found"
    exit 1
fi
```

---

## 🌍 Cross-Platform Support

Script ini berjalan di:

| Platform | Command | Status |
|----------|---------|--------|
| macOS | `bash auto-deploy.sh` | ✅ Supported |
| Linux | `bash auto-deploy.sh` | ✅ Supported |
| Windows (Git Bash) | `bash auto-deploy.sh` | ✅ Supported |
| Windows (WSL) | `bash auto-deploy.sh` | ✅ Supported |
| Windows (PowerShell) | `bash ./auto-deploy.sh` | ✅ Supported |

---

## 🆘 Troubleshooting

### Issue: "Permission denied" on macOS/Linux

**Solusi:**
```bash
chmod +x auto-deploy.sh
./auto-deploy.sh
```

### Issue: "command not found: vercel"

**Solusi:**
```bash
npm install -g vercel
vercel login
bash auto-deploy.sh
```

### Issue: "npm: command not found"

**Solusi:**
Ensure Node.js installed:
```bash
brew install node  # macOS
apt-get install nodejs npm  # Linux
```

### Issue: Build fails in script

**Solusi:**
```bash
# Test build locally first
npm run build

# Fix issues, then retry
bash auto-deploy.sh
```

### Issue: Vercel login timeout

**Solusi:**
```bash
# Manual login first
vercel login

# Then run script
bash auto-deploy.sh
```

---

## ⚡ Performance Tips

### Speed Up Deployments

1. **Use npm ci instead of npm install**
   ```bash
   npm ci --legacy-peer-deps
   ```

2. **Cache dependencies locally**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Parallel region deployment**
   Add multiple regions di vercel.json:
   ```json
   "regions": ["sin1", "iad1"]
   ```

4. **Optimize images**
   Script checks `.next` size automatically

---

## 📊 Deployment Metrics

Script collects & displays:

- ⏱️ Total deployment time
- ⏱️ Build duration
- ⏱️ Staging deploy time
- ⏱️ Production deploy time
- 📦 Build size (.next folder)
- 📝 Git commit info
- 🔗 Deployment URLs
- 📋 Component count
- ⚠️ Validation warnings

---

## 🎯 Best Practices

### 1. Always Test Locally First
```bash
npm run dev
# Open http://localhost:3000
# Test all features
```

### 2. Review Git Changes
```bash
git diff
git log --oneline -5
```

### 3. Check Build Output
```bash
npm run build
ls -la .next/
du -sh .next/
```

### 4. Monitor Production
```bash
vercel logs --tail
# Watch for errors in real-time
```

### 5. Setup Alerts
Vercel dashboard → Alerts → Setup notifications

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Bash Scripting**: https://www.gnu.org/software/bash/manual/
- **GitHub Actions**: https://github.com/features/actions

---

## ✨ Summary

**Auto-Deploy Workflow Benefits:**

✅ **One-command deployment** - No manual steps  
✅ **Automated validation** - Catch errors early  
✅ **Safe checks** - Won't deploy broken builds  
✅ **Comprehensive reporting** - Know what happened  
✅ **Cross-platform** - Works on Mac, Linux, Windows  
✅ **Extensible** - Easy to customize  
✅ **Time-saving** - 90% faster than manual deployment  

---

**Ready to deploy? Just run:**

```bash
bash auto-deploy.sh
```

**That's it! 🚀**

---

**Last Updated**: November 22, 2025  
**Script Version**: 1.0  
**Supported**: Next.js 16 + React 18 + TypeScript  
**Deployment Target**: Vercel (Singapore Region)  
**Status**: 🟢 Production Ready
