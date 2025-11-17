#!/bin/bash

# =========================================
# PRODUCTION DEPLOYMENT GUIDE
# 8 Park Soreang - Next.js Application
# =========================================

echo "🚀 Memulai Setup Production..."

# Step 1: Check Node.js version
echo "✅ Checking Node.js version..."
node -v

# Step 2: Clean previous builds
echo "✅ Cleaning previous builds..."
rm -rf .next node_modules

# Step 3: Install dependencies
echo "✅ Installing dependencies..."
npm install --frozen-lockfile

# Step 4: Build the application
echo "✅ Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check errors above."
    exit 1
fi

echo ""
echo "✅ ============================================"
echo "✅ BUILD SUCCESSFUL!"
echo "✅ ============================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. CREATE SUPABASE DATABASE TABLES:"
echo "   - Go to https://supabase.com/dashboard"
echo "   - Open your project console"
echo "   - Run SQL from: database-schema.sql"
echo ""
echo "2. SET ENVIRONMENT VARIABLES:"
echo "   - Copy .env.local to your hosting platform"
echo "   - Make sure SUPABASE_SERVICE_ROLE_KEY is set"
echo ""
echo "3. DEPLOY OPTIONS:"
echo ""
echo "   Option A: VERCEL (Recommended)"
echo "   $ npm i -g vercel"
echo "   $ vercel"
echo ""
echo "   Option B: DOCKER"
echo "   $ docker-compose up -d"
echo "   Application runs on port 3000"
echo ""
echo "   Option C: TRADITIONAL VPS"
echo "   $ npm start"
echo "   Use PM2: pm2 start npm --name '8-park' -- start"
echo ""
echo "4. TEST PRODUCTION BUILD LOCALLY:"
echo "   $ npm start"
echo "   Open http://localhost:3000"
echo ""
echo "5. SETUP SSL/HTTPS:"
echo "   Gunakan Cloudflare atau Let's Encrypt"
echo ""
echo "6. SETUP MONITORING:"
echo "   - Vercel Analytics (automatic)"
echo "   - Sentry for error tracking"
echo "   - Google Analytics"
echo ""
echo "✅ Setup production complete!"
