# ProdSync Extension - Production Readiness Verification

## Quick Verification Checklist

Run through this checklist before creating the submission ZIP file.

### ✅ Code & Configuration

- [ ] **Version Updated**: `manifest.json` version is set (e.g., `1.0.0`)
- [ ] **Name Correct**: Extension name in manifest: "ProdSync - Etsy Reply Assistant"
- [ ] **Description Clear**: Manifest description accurately describes the extension
- [ ] **Icons Exist**: All three icon sizes present in `public/icons/`:
  - icon-16.png (16x16px)
  - icon-48.png (48x48px)
  - icon-128.png (128x128px)

### ✅ Environment Configuration

- [ ] **Production Backend URL**: `extension/.env` has `VITE_BACKEND_URL` set to production (not localhost)
  ```env
  VITE_BACKEND_URL=https://your-app.vercel.app
  ```
- [ ] **Firebase Config**: All Firebase credentials in `.env` match production project
- [ ] **No Development Secrets**: `.env` is in `.gitignore` and not committed

### ✅ Build & Dependencies

- [ ] **Dependencies Installed**: `npm install` completed without errors
- [ ] **TypeScript Valid**: `npm run type-check` passes with no errors
- [ ] **Linting Passes**: `npm run lint` passes with no errors
- [ ] **Production Build**: `npm run build` succeeds and creates `dist/` folder
- [ ] **Build Size**: `dist/` folder is under 100MB (Chrome limit)

### ✅ Manifest Validation

- [ ] **Manifest Version 3**: `"manifest_version": 3` (not 2)
- [ ] **Permissions Minimal**: Only necessary permissions listed
  - storage (for auth tokens and cache)
  - activeTab (for accessing Etsy pages)
  - scripting (for button injection)
  - tabs (for managing extension state)
- [ ] **Host Permissions**: Includes Etsy and backend URLs
  - `https://www.etsy.com/*`
  - Production backend URL (e.g., `https://*.vercel.app/*`)
  - Remove `http://localhost:*/*` for production (or leave for flexibility)
- [ ] **Content Scripts**: Matches correct Etsy URLs
  - `https://www.etsy.com/your/orders/sold*`
  - `https://www.etsy.com/messages/*`
- [ ] **CSP Policy**: Content Security Policy set correctly

### ✅ Backend Readiness

- [ ] **Backend Deployed**: Production backend is live and accessible
- [ ] **CORS Configured**: `middleware.ts` allows `chrome-extension://` origins
- [ ] **API Endpoints Work**: Test with curl:
  ```bash
  curl -i -X OPTIONS https://your-backend.com/api/ai/generate-reply \
    -H "Origin: chrome-extension://test123" \
    -H "Access-Control-Request-Method: POST"
  ```
- [ ] **Firebase Auth**: Firebase authorized domains include production domain
- [ ] **Firestore Rules**: Security rules published and tested

### ✅ Extension Testing

- [ ] **Loads Without Errors**: Extension loads in Chrome with no console errors
- [ ] **Authentication Works**: Can sign in with production backend
- [ ] **Button Appears**: "Generate Reply" button injects on Etsy message pages
- [ ] **Message Extraction**: Buyer message extracted correctly
- [ ] **Reply Generation**: AI reply generates successfully (test all providers if possible)
- [ ] **Reply Insertion**: Reply inserts into Etsy textarea correctly
- [ ] **Error Handling**: Errors show user-friendly messages (test invalid API key, network failure)

### ✅ Documentation

- [ ] **README Updated**: Installation instructions accurate
- [ ] **Privacy Policy**: Hosted online and accessible via HTTPS
- [ ] **Testing Checklist**: [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) completed
- [ ] **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) reviewed

### ✅ Store Assets

- [ ] **Screenshots Captured**: 5 screenshots at 1280x800px
- [ ] **Promotional Tile**: 440x280px tile created
- [ ] **Marquee Tile**: 1400x560px tile created (optional)
- [ ] **Icons Verified**: All icons are PNG with transparent background
- [ ] **No Placeholder Text**: All screenshots use real, professional content

---

## Automated Verification Script

Run this script to automatically check many of the above items:

```bash
#!/bin/bash
# Save as: extension/verify-production.sh
# Run with: bash verify-production.sh

echo "🔍 ProdSync Extension - Production Verification"
echo "================================================"
echo ""

# Check Node.js version
echo "✓ Node.js version:"
node --version
echo ""

# Check if in extension directory
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: Not in extension directory. Run from extension/ folder."
  exit 1
fi

# Check dependencies installed
if [ ! -d "node_modules" ]; then
  echo "❌ ERROR: Dependencies not installed. Run 'npm install'."
  exit 1
fi
echo "✓ Dependencies installed"

# Check environment file
if [ ! -f ".env" ]; then
  echo "⚠️  WARNING: No .env file found. Create one from .env.example."
else
  echo "✓ Environment file exists"

  # Check for production backend URL
  if grep -q "localhost" .env; then
    echo "⚠️  WARNING: .env contains 'localhost'. Update VITE_BACKEND_URL to production."
  else
    echo "✓ Production backend URL configured"
  fi
fi

# Check icons exist
echo ""
echo "Checking icons..."
if [ -f "public/icons/icon-16.png" ] && [ -f "public/icons/icon-48.png" ] && [ -f "public/icons/icon-128.png" ]; then
  echo "✓ All icon files present"

  # Check icon sizes (requires ImageMagick: brew install imagemagick)
  if command -v identify &> /dev/null; then
    SIZE_16=$(identify -format "%wx%h" public/icons/icon-16.png)
    SIZE_48=$(identify -format "%wx%h" public/icons/icon-48.png)
    SIZE_128=$(identify -format "%wx%h" public/icons/icon-128.png)

    if [ "$SIZE_16" = "16x16" ]; then echo "  ✓ icon-16.png is 16x16"; else echo "  ❌ icon-16.png is $SIZE_16 (should be 16x16)"; fi
    if [ "$SIZE_48" = "48x48" ]; then echo "  ✓ icon-48.png is 48x48"; else echo "  ❌ icon-48.png is $SIZE_48 (should be 48x48)"; fi
    if [ "$SIZE_128" = "128x128" ]; then echo "  ✓ icon-128.png is 128x128"; else echo "  ❌ icon-128.png is $SIZE_128 (should be 128x128)"; fi
  fi
else
  echo "❌ ERROR: Missing icon files in public/icons/"
fi

# Check manifest.json
echo ""
echo "Checking manifest.json..."
if [ -f "public/manifest.json" ]; then
  echo "✓ Manifest file exists"

  VERSION=$(grep '"version"' public/manifest.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
  NAME=$(grep '"name"' public/manifest.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')

  echo "  Version: $VERSION"
  echo "  Name: $NAME"

  # Check for localhost in manifest
  if grep -q "localhost" public/manifest.json; then
    echo "  ⚠️  WARNING: manifest.json contains 'localhost' in host_permissions."
  fi
else
  echo "❌ ERROR: manifest.json not found in public/"
fi

# Run TypeScript type check
echo ""
echo "Running TypeScript type check..."
if npm run type-check 2>&1 | grep -q "error"; then
  echo "❌ ERROR: TypeScript errors found. Run 'npm run type-check' to see details."
else
  echo "✓ TypeScript type check passed"
fi

# Run ESLint
echo ""
echo "Running ESLint..."
if npm run lint 2>&1 | grep -q "error"; then
  echo "❌ ERROR: ESLint errors found. Run 'npm run lint' to see details."
else
  echo "✓ ESLint passed"
fi

# Build extension
echo ""
echo "Building extension..."
if npm run build > /dev/null 2>&1; then
  echo "✓ Production build succeeded"

  # Check dist folder size
  if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "  Build size: $DIST_SIZE"

    # Check if manifest exists in dist
    if [ -f "dist/manifest.json" ]; then
      echo "  ✓ manifest.json in dist/"
    else
      echo "  ❌ ERROR: manifest.json missing from dist/"
    fi

    # Check if icons copied
    if [ -d "dist/icons" ]; then
      echo "  ✓ icons/ folder in dist/"
    else
      echo "  ❌ ERROR: icons/ folder missing from dist/"
    fi
  else
    echo "  ❌ ERROR: dist/ folder not created"
  fi
else
  echo "❌ ERROR: Build failed. Run 'npm run build' to see errors."
fi

# Summary
echo ""
echo "================================================"
echo "Verification complete!"
echo ""
echo "Next steps:"
echo "1. Review warnings above and fix any issues"
echo "2. Test the extension in Chrome with production backend"
echo "3. Run through TESTING_CHECKLIST.md"
echo "4. Create ZIP from dist/ folder for submission"
echo ""
echo "Create ZIP:"
echo "  cd dist && zip -r ../prodsync-extension-v$VERSION.zip *"
echo ""
```

### Running the Script

**On Mac/Linux:**

```bash
cd extension
chmod +x verify-production.sh
./verify-production.sh
```

**On Windows (Git Bash):**

```bash
cd extension
bash verify-production.sh
```

**On Windows (PowerShell):**

```powershell
cd extension
# Use the manual checklist above or install Git Bash
```

---

## Manual Verification Steps

### 1. Icon Verification

**Check icon quality:**

```bash
# View icons to ensure they're not blurry or pixelated
open public/icons/icon-16.png   # Mac
start public/icons/icon-16.png  # Windows
xdg-open public/icons/icon-16.png  # Linux
```

**Verify transparency:**

- Icons should have transparent backgrounds (not white)
- Open in image editor to check alpha channel

**Check file sizes:**

- icon-16.png: ~200-500 bytes
- icon-48.png: ~400-1000 bytes
- icon-128.png: ~1-3 KB

Icons larger than expected may indicate they're not optimized.

### 2. Manifest Validation

**Online validator:**

1. Copy contents of `public/manifest.json`
2. Visit: https://jsonlint.com/
3. Paste and validate JSON syntax

**Chrome validation:**

1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select `extension/dist/` folder
5. If there are manifest errors, Chrome will show them

### 3. Build Verification

**Check build output:**

```bash
cd extension
npm run build

# List dist/ contents
ls -R dist/

# Expected structure:
# dist/
# ├── manifest.json
# ├── icons/
# │   ├── icon-16.png
# │   ├── icon-48.png
# │   └── icon-128.png
# ├── background/
# ├── content/
# └── popup/
```

**Check for source maps (optional):**
Production builds shouldn't include `.map` files (increases size):

```bash
find dist -name "*.map"
# Should return nothing or be acceptable
```

**Check bundle sizes:**

```bash
du -sh dist/*
# Ensure no single file is over 5MB
```

### 4. Backend CORS Test

**Test CORS headers:**

```bash
curl -i -X OPTIONS https://your-backend.vercel.app/api/ai/generate-reply \
  -H "Origin: chrome-extension://abcdefghijklmnopqrstuvwxyz123456" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Expected response headers:
# Access-Control-Allow-Origin: chrome-extension://abcdefghijklmnopqrstuvwxyz123456
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization, ...
# Access-Control-Allow-Credentials: true
```

**If CORS headers missing:**

- Ensure `middleware.ts` is at project root
- Redeploy backend
- Check middleware is applied to `/api/*` routes

### 5. Privacy Policy Check

**Verify privacy policy is accessible:**

```bash
curl -I https://your-privacy-policy-url.com
# Should return: HTTP/1.1 200 OK
```

**Check HTTPS:**

- Privacy policy MUST be HTTPS (not HTTP)
- Chrome Web Store requires secure URLs

**Verify content:**

- Privacy policy loads correctly in browser
- No login/auth required to view
- Contains all required sections (data collection, usage, storage, etc.)

### 6. Store Assets Check

**Screenshot dimensions:**

```bash
# If you have ImageMagick installed
identify screenshots/*.png

# Expected output:
# screenshots/01-authentication.png PNG 1280x800 ...
# screenshots/02-reply-generation.png PNG 1280x800 ...
# etc.
```

**Promotional tile dimensions:**

```bash
identify promotional/small-tile-440x280.png
# Should be: PNG 440x280

identify promotional/marquee-tile-1400x560.png
# Should be: PNG 1400x560
```

### 7. ZIP Verification

**Create ZIP:**

```bash
cd extension/dist
zip -r ../prodsync-extension-v1.0.0.zip *
cd ..
```

**Verify ZIP structure:**

```bash
unzip -l prodsync-extension-v1.0.0.zip | head -20

# First file should be manifest.json (NOT dist/manifest.json)
# Correct:
#   manifest.json
#   icons/icon-16.png
#   background/index.js
#
# Incorrect:
#   dist/manifest.json
#   dist/icons/icon-16.png
```

**Check ZIP size:**

```bash
ls -lh prodsync-extension-v1.0.0.zip
# Should be under 100MB (Chrome limit)
# Typically 1-10MB for most extensions
```

---

## Common Issues & Fixes

### Issue: Build fails with TypeScript errors

**Fix:**

```bash
npm run type-check
# Review errors and fix type issues in code
```

### Issue: Icons not appearing in built extension

**Fix:**

- Ensure icons are in `public/icons/` (not `src/`)
- Verify manifest.json paths are correct (`icons/icon-16.png`)
- Rebuild: `npm run build`

### Issue: Extension loads but shows "Service worker registration failed"

**Fix:**

- Check `manifest.json` background.service_worker path
- Ensure background script is built to `dist/background/`
- Check Chrome DevTools → Console for specific error

### Issue: ZIP upload fails with "Manifest is invalid"

**Fix:**

- Validate manifest.json syntax at jsonlint.com
- Ensure manifest.json is at root of ZIP (not in subfolder)
- Check all required fields are present (name, version, manifest_version)

### Issue: CORS errors when generating replies

**Fix:**

- Verify CORS middleware is deployed in production
- Test CORS headers with curl command above
- Update `VITE_BACKEND_URL` in .env to production URL
- Rebuild extension after changing .env

---

## Final Pre-Submission Checklist

Before clicking "Submit for Review":

- [ ] All items in "Quick Verification Checklist" checked
- [ ] Extension tested with production backend
- [ ] All test cases in [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) passed
- [ ] Screenshots and promotional images created
- [ ] Privacy policy hosted and accessible
- [ ] Store listing text prepared (name, summary, description)
- [ ] Permission justifications written
- [ ] ZIP file created and verified
- [ ] Confident extension is ready for users

**Estimated time to complete verification:** 2-3 hours

---

Good luck with your submission! 🚀
