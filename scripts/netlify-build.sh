#!/bin/bash

echo "🏗️  Starting Next.js build for Netlify..."

# Set NODE_ENV to production
export NODE_ENV=production

echo "📦 Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "NODE_VERSION: $(node --version)"
echo "NPM_VERSION: $(npm --version)"

echo ""
echo "🔧 Running npm run build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Build completed successfully!"
exit 0
