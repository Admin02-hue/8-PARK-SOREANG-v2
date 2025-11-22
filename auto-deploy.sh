#!/bin/bash

################################################################################
#                                                                              #
#  🚀 AUTO-DEPLOY SCRIPT FOR 8 PARK SOREANG                                   #
#  Next.js 16 Automated Deployment to Vercel                                  #
#                                                                              #
#  Features:                                                                   #
#  ✓ Automatic Git commit & push                                              #
#  ✓ Project structure validation                                             #
#  ✓ Component architecture verification                                      #
#  ✓ Build testing                                                            #
#  ✓ Vercel authentication                                                    #
#  ✓ Staging & production deployment                                          #
#  ✓ Deployment summary report                                                #
#                                                                              #
#  Usage:                                                                      #
#    bash auto-deploy.sh                                                      #
#    or                                                                        #
#    ./auto-deploy.sh                                                         #
#                                                                              #
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📋 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Track metrics
START_TIME=$(date +%s)
UNCOMMITTED_CHANGES=0
VALIDATION_WARNINGS=0

################################################################################
# STEP 1: GIT STATUS CHECK & AUTO-COMMIT
################################################################################

log_step "1️⃣  Git Status Check & Auto-Commit"

if [ ! -d .git ]; then
    log_warning "Git repository not found, initializing..."
    git init
    git add .
    git commit -m "🚀 Initial auto-deploy setup - $(date '+%Y-%m-%d %H:%M:%S')"
    log_success "Git repository initialized"
else
    log_info "Git repository found"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        UNCOMMITTED_CHANGES=1
        log_warning "Uncommitted changes detected"
        git add .
        git commit -m "🚀 Auto deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        log_success "Changes committed"
    else
        log_success "Repository clean, no uncommitted changes"
    fi
fi

# Get commit count
COMMIT_COUNT=$(git rev-list --count HEAD)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s")

log_info "Branch: $CURRENT_BRANCH"
log_info "Commits: $COMMIT_COUNT"
log_info "Latest: $LAST_COMMIT"

################################################################################
# STEP 2: PROJECT STRUCTURE VALIDATION
################################################################################

log_step "2️⃣  Project Structure Validation"

VALIDATION_PASSED=true

# Check package.json
if [ ! -f package.json ]; then
    log_error "package.json not found"
    VALIDATION_PASSED=false
else
    log_success "✓ package.json exists"
fi

# Check vercel.json
if [ ! -f vercel.json ]; then
    log_error "vercel.json not found"
    VALIDATION_PASSED=false
else
    log_success "✓ vercel.json exists"
fi

# Check next.config
if [ ! -f next.config.ts ] && [ ! -f next.config.js ]; then
    log_error "next.config.ts or next.config.js not found"
    VALIDATION_PASSED=false
else
    log_success "✓ next.config exists"
fi

# Check src/app
if [ ! -d src/app ]; then
    log_error "src/app directory not found"
    VALIDATION_PASSED=false
else
    log_success "✓ src/app directory exists"
fi

if [ "$VALIDATION_PASSED" = false ]; then
    log_error "Project structure validation failed!"
    exit 1
fi

################################################################################
# STEP 3: COMPONENT ARCHITECTURE VALIDATION
################################################################################

log_step "3️⃣  Component Architecture Validation"

log_info "Scanning components for 'use client' directives..."

# Count client components
CLIENT_COMPONENTS=$(find src/components -name "*.tsx" -type f -exec grep -l "'use client'" {} \; 2>/dev/null | wc -l)
TOTAL_COMPONENTS=$(find src/components -name "*.tsx" -type f 2>/dev/null | wc -l)

log_info "Client components: $CLIENT_COMPONENTS"
log_info "Total components: $TOTAL_COMPONENTS"

# Check for server components importing client components (simple check)
if grep -r "import.*from.*client" src/app --include="*.tsx" 2>/dev/null; then
    log_warning "Potential server component importing client module detected"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
else
    log_success "✓ No apparent server→client imports detected"
fi

# Check for dynamic imports in server components
if grep -r "dynamic.*ssr.*false" src/app --include="*.tsx" 2>/dev/null | grep -v "'use client'" 2>/dev/null; then
    log_warning "Dynamic import with ssr:false found in potential server component"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
else
    log_success "✓ Dynamic imports properly configured"
fi

# Check for useState in server components (basic check)
if grep -r "useState" src/app --include="*.tsx" 2>/dev/null | grep -v "'use client'" 2>/dev/null; then
    log_warning "useState found in potential server component"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
else
    log_success "✓ useState usage correct"
fi

log_success "Component architecture validation complete"

################################################################################
# STEP 4: INSTALL DEPENDENCIES
################################################################################

log_step "4️⃣  Installing Dependencies"

if [ -f package-lock.json ]; then
    log_info "package-lock.json found, using npm ci..."
    npm ci --legacy-peer-deps 2>&1 | tail -n 5
else
    log_info "Installing with npm install..."
    npm install --legacy-peer-deps 2>&1 | tail -n 5
fi

log_success "Dependencies installed successfully"

################################################################################
# STEP 5: PRODUCTION BUILD TEST
################################################################################

log_step "5️⃣  Production Build Test"

log_info "Building Next.js project..."
BUILD_START=$(date +%s)

if npm run build; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    log_success "Build successful! (${BUILD_TIME}s)"
    
    # Check build output
    if [ -d .next ]; then
        NEXT_SIZE=$(du -sh .next | cut -f1)
        log_info "Build size: $NEXT_SIZE"
    fi
else
    log_error "Build failed! Stopping deployment..."
    log_error "Run 'npm run build' locally for details"
    exit 1
fi

################################################################################
# STEP 6: VERCEL CLI CHECK
################################################################################

log_step "6️⃣  Vercel CLI Verification"

if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI not found, installing globally..."
    npm install -g vercel
    log_success "Vercel CLI installed"
else
    VERCEL_VERSION=$(vercel --version)
    log_success "Vercel CLI ready: $VERCEL_VERSION"
fi

################################################################################
# STEP 7: VERCEL AUTHENTICATION
################################################################################

log_step "7️⃣  Vercel Authentication"

if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    log_success "Already authenticated as: $VERCEL_USER"
else
    log_warning "Not authenticated, launching Vercel login..."
    vercel login
    log_success "Authentication successful"
fi

################################################################################
# STEP 8: STAGING DEPLOYMENT
################################################################################

log_step "8️⃣  Staging Deployment"

log_info "Deploying to staging environment..."
STAGING_START=$(date +%s)

STAGING_URL=$(vercel --yes 2>&1 | grep -E "https://" | head -1 || echo "")

if [ -z "$STAGING_URL" ]; then
    log_warning "Could not extract staging URL"
    STAGING_URL="(Check Vercel dashboard)"
fi

STAGING_END=$(date +%s)
STAGING_TIME=$((STAGING_END - STAGING_START))

log_success "Staging deployed! (${STAGING_TIME}s)"
log_info "Staging URL: $STAGING_URL"

sleep 2  # Wait for staging to stabilize

################################################################################
# STEP 9: PRODUCTION DEPLOYMENT
################################################################################

log_step "9️⃣  Production Deployment"

log_info "Deploying to production environment..."
PROD_START=$(date +%s)

PROD_URL=$(vercel --prod --yes 2>&1 | grep -E "https://" | head -1 || echo "")

if [ -z "$PROD_URL" ]; then
    log_warning "Could not extract production URL"
    PROD_URL="(Check Vercel dashboard)"
fi

PROD_END=$(date +%s)
PROD_TIME=$((PROD_END - PROD_START))

log_success "Production deployed! (${PROD_TIME}s)"
log_info "Production URL: $PROD_URL"

################################################################################
# STEP 10: DEPLOYMENT SUMMARY
################################################################################

log_step "🎯 DEPLOYMENT SUMMARY"

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Calculate minutes and seconds
TOTAL_MINUTES=$((TOTAL_TIME / 60))
TOTAL_SECONDS=$((TOTAL_TIME % 60))

# Get git diff stats
GIT_STATS=$(git diff HEAD~1 HEAD --shortstat 2>/dev/null || echo "N/A")

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}📊 DEPLOYMENT STATISTICS:${NC}"
echo -e "  Total Time: ${GREEN}${TOTAL_MINUTES}m ${TOTAL_SECONDS}s${NC}"
echo -e "  Build Time: ${GREEN}${BUILD_TIME}s${NC}"
echo -e "  Staging Deploy: ${GREEN}${STAGING_TIME}s${NC}"
echo -e "  Production Deploy: ${GREEN}${PROD_TIME}s${NC}"
echo ""

echo -e "${CYAN}🔗 DEPLOYMENT URLS:${NC}"
echo -e "  Staging:     ${BLUE}$STAGING_URL${NC}"
echo -e "  Production:  ${GREEN}$PROD_URL${NC}"
echo ""

echo -e "${CYAN}📝 GIT INFORMATION:${NC}"
echo -e "  Branch:      ${BLUE}$CURRENT_BRANCH${NC}"
echo -e "  Commits:     ${BLUE}$COMMIT_COUNT${NC}"
echo -e "  Latest:      ${BLUE}$LAST_COMMIT${NC}"
echo -e "  Changes:     ${BLUE}$GIT_STATS${NC}"
echo ""

echo -e "${CYAN}⚙️  PROJECT INFORMATION:${NC}"
echo -e "  Components: ${BLUE}$TOTAL_COMPONENTS total, $CLIENT_COMPONENTS client${NC}"
echo -e "  Build Size: ${BLUE}$NEXT_SIZE${NC}"
echo ""

if [ $VALIDATION_WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  VALIDATION WARNINGS: $VALIDATION_WARNINGS${NC}"
    echo -e "${YELLOW}  Review the warnings above for potential issues${NC}"
    echo ""
fi

echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo -e "  1. Visit staging: ${BLUE}$STAGING_URL${NC}"
echo -e "  2. Test functionality"
echo -e "  3. If everything works, visit production: ${BLUE}$PROD_URL${NC}"
echo -e "  4. Monitor logs: ${BLUE}vercel logs --tail${NC}"
echo ""

echo -e "${CYAN}🔧 USEFUL COMMANDS:${NC}"
echo -e "  View deployment logs:    ${BLUE}vercel logs --tail${NC}"
echo -e "  Rollback:                ${BLUE}vercel rollback${NC}"
echo -e "  View all deployments:    ${BLUE}vercel ls${NC}"
echo -e "  Check environment vars:  ${BLUE}vercel env ls${NC}"
echo ""

echo -e "${GREEN}🚀 AUTO-DEPLOY COMPLETE! Your project is now live.${NC}"
echo -e "${CYAN}Timestamp: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

################################################################################
# OPTIONAL: Open URLs in browser (uncomment if desired)
################################################################################

# Uncomment these lines to automatically open URLs in default browser:
# if command -v xdg-open &> /dev/null; then
#     xdg-open "$PROD_URL"  # Linux
# elif command -v open &> /dev/null; then
#     open "$PROD_URL"      # macOS
# fi

exit 0
