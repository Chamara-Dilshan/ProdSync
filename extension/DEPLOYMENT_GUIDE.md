# ProdSync Extension - Deployment Guide

## Pre-Deployment Checklist

### 1. Complete Testing

- [ ] Run through [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) completely
- [ ] Fix all critical issues found during testing
- [ ] Verify all features work end-to-end

### 2. Backend Configuration

- [ ] CORS middleware configured in [middleware.ts](../middleware.ts)
- [ ] Backend deployed to production (Vercel/Netlify/etc.)
- [ ] Production URL accessible and working
- [ ] Firebase authentication configured for production domain
- [ ] API endpoints tested with curl/Postman

### 3. Extension Configuration

- [ ] Update `extension/.env` with production backend URL:
  ```env
  VITE_BACKEND_URL=https://your-app.vercel.app
  ```
- [ ] Remove any development-only console.logs (optional)
- [ ] Update version in `manifest.json` (e.g., `"version": "1.0.0"`)

### 4. Assets Ready

- [ ] Icons: 16x16, 48x48, 128x128 (PNG, transparent background)
- [ ] Screenshots: 1280x800px (minimum 1, maximum 5)
- [ ] Small promo tile: 440x280px (required)
- [ ] Marquee tile: 1400x560px (optional but recommended)
- [ ] Privacy policy hosted online (GitHub Pages or prodsync.com)

### 5. Documentation

- [ ] [README.md](README.md) updated with installation instructions
- [ ] [PRIVACY_POLICY.md](PRIVACY_POLICY.md) reviewed and accurate
- [ ] [WEBSTORE_SUBMISSION.md](WEBSTORE_SUBMISSION.md) reviewed

## Step-by-Step Deployment

### Step 1: Prepare Production Build

```bash
# Navigate to extension directory
cd extension

# Install dependencies (if not already done)
npm install

# Run TypeScript type check
npm run type-check

# Fix any type errors before proceeding

# Run ESLint
npm run lint

# Fix any linting errors

# Build for production
npm run build

# Verify build succeeded
# You should see "dist" folder with built extension
ls dist/
```

**Expected output in `dist/`:**

```
dist/
├── manifest.json
├── background/
│   └── index.js
├── content/
│   └── index.js
├── popup/
│   └── index.html
│   └── index.js
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── ... (other assets)
```

### Step 2: Test Production Build Locally

```bash
# Load the built extension in Chrome
# 1. Open Chrome
# 2. Go to chrome://extensions/
# 3. Enable "Developer mode" (top right toggle)
# 4. Click "Load unpacked"
# 5. Select the "extension/dist/" folder
# 6. Extension should load without errors
```

**Verify:**

- [ ] Extension icon appears in Chrome toolbar
- [ ] Clicking icon opens popup
- [ ] Login works with production backend
- [ ] Visit Etsy messages, button appears
- [ ] Generate reply works end-to-end
- [ ] No errors in DevTools console

### Step 3: Create Submission ZIP

```bash
# From extension directory
cd dist

# Create ZIP of ALL contents (not the dist folder itself)
# On Windows (PowerShell):
Compress-Archive -Path * -DestinationPath ../prodsync-extension-v1.0.0.zip

# On Mac/Linux:
zip -r ../prodsync-extension-v1.0.0.zip *

# Go back to extension directory
cd ..
```

**Verify ZIP structure:**

```bash
# Unzip to test (in a temp folder)
unzip -l prodsync-extension-v1.0.0.zip

# Should show:
# manifest.json (at root, NOT inside a folder)
# background/
# content/
# popup/
# etc.
```

**Critical:** `manifest.json` must be at the root of the ZIP, not inside a subfolder.

### Step 4: Create Chrome Web Store Developer Account

1. Visit: https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Accept Developer Agreement
4. Pay one-time $5 registration fee
5. Verify email address

### Step 5: Prepare Store Listing Assets

**Create a folder for all assets:**

```bash
mkdir extension/store-assets
cd extension/store-assets
mkdir screenshots promotional
```

**Assets needed:**

#### Icons (already in `public/icons/`)

- [x] icon-16.png
- [x] icon-48.png
- [x] icon-128.png

#### Screenshots (create 5 screenshots at 1280x800px):

1. **Authentication** - Login screen
   - File: `screenshots/01-authentication.png`
   - Show: Clean login UI, "Sign in to ProdSync" heading

2. **Reply Generation** - Main feature
   - File: `screenshots/02-reply-generation.png`
   - Show: Buyer message displayed, tone selector, product selector

3. **Generated Reply** - AI output
   - File: `screenshots/03-generated-reply.png`
   - Show: Professional generated reply, "Copy" and "Insert" buttons

4. **Etsy Integration** - Button on Etsy
   - File: `screenshots/04-etsy-integration.png`
   - Show: "Generate Reply" button on Etsy page (blur buyer info!)

5. **Product Selection** - Context awareness
   - File: `screenshots/05-product-selection.png`
   - Show: Multiple products listed, checkbox selection

**How to capture:**

1. Use Chrome DevTools → Device Toolbar → Set to 1280x800
2. Screenshot the extension popup or Etsy page
3. Use ShareX, Lightshot, or Windows Snip & Sketch
4. Save as PNG

#### Promotional Tile (440x280px)

- File: `promotional/small-tile-440x280.png`
- Design with Canva/Figma:
  - ProdSync logo/icon
  - Text: "AI Message Assistant for Etsy Sellers"
  - Gradient background (purple to pink)
  - Professional design

#### Marquee Tile (1400x560px) - Optional

- File: `promotional/marquee-tile-1400x560.png`
- Larger version of small tile with screenshot

### Step 6: Host Privacy Policy

**Option A: GitHub Pages**

1. Create new repo: `prodsync-privacy`
2. Add `index.html` with privacy policy content
3. Enable GitHub Pages in repo settings
4. URL: `https://yourusername.github.io/prodsync-privacy`

**Option B: Your Website**

1. Create `/privacy/extension` page on prodsync.com
2. Copy content from [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
3. Convert to HTML
4. URL: `https://prodsync.com/privacy/extension`

**Convert Markdown to HTML:**

```bash
# Using pandoc (install first: https://pandoc.org/installing.html)
pandoc PRIVACY_POLICY.md -o privacy-policy.html

# Or use online converter: https://markdowntohtml.com/
```

### Step 7: Submit to Chrome Web Store

1. **Go to Developer Dashboard**
   - https://chrome.google.com/webstore/devconsole

2. **Click "New Item"**

3. **Upload ZIP**
   - Click "Choose file"
   - Select `prodsync-extension-v1.0.0.zip`
   - Wait for upload and automated checks
   - Fix any errors reported

4. **Fill Store Listing - Product Details**

   **Item Name** (45 chars max):

   ```
   ProdSync - AI Message Assistant for Etsy
   ```

   **Summary** (132 chars max):

   ```
   Generate professional, policy-compliant Etsy replies instantly. Save time, boost customer satisfaction with AI.
   ```

   **Description** (detailed):
   - Copy from [WEBSTORE_SUBMISSION.md](WEBSTORE_SUBMISSION.md) (Section: "Detailed Description")
   - 16,384 character max
   - Use markdown-style formatting (will be rendered as HTML)

   **Category**:
   - Primary: **Productivity**

   **Language**:
   - **English (United States)**

5. **Upload Graphics**

   **Icon**:
   - Upload `public/icons/icon-128.png`

   **Small promotional tile (440x280)**:
   - Upload `store-assets/promotional/small-tile-440x280.png`

   **Marquee promotional tile (1400x560)** - Optional:
   - Upload `store-assets/promotional/marquee-tile-1400x560.png`

   **Screenshots**:
   - Upload all 5 screenshots from `store-assets/screenshots/`
   - Drag to reorder (01-authentication should be first)

6. **Privacy Practices**

   **Single Purpose**:

   ```
   This extension helps Etsy sellers generate professional, AI-powered replies to buyer messages directly on Etsy.com.
   ```

   **Permission Justifications**:
   - **storage**: Store authentication tokens and cached user data (products, settings)
   - **activeTab**: Access current Etsy message page to extract buyer messages
   - **scripting**: Inject "Generate Reply" button and insert AI-generated replies into Etsy
   - **host: https://www.etsy.com/***: Detect Etsy message pages and enable reply generation
   - **host: [your-backend]**: Communicate with ProdSync API for AI reply generation

   **Privacy Policy**:
   - URL: `https://yourusername.github.io/prodsync-privacy` (or your hosted URL)

   **Data Usage**:
   - Check: "Authentication information"
   - Check: "Personal communications (messages, emails, etc.)"
   - Uncheck all "for selling data" options (we don't sell data)

7. **Distribution**

   **Visibility**:
   - Select: **Public** (recommended)
   - Or **Unlisted** if you only want direct link users to install

   **Regions**:
   - Select: **All regions** (worldwide)
   - Or specific countries if needed

   **Pricing**:
   - Select: **Free**

8. **Review Submission**
   - Check all information is correct
   - Review screenshots and descriptions
   - Verify privacy policy link works

9. **Submit for Review**
   - Click "Submit for Review" button
   - Extension status changes to "Pending Review"
   - Google will review within 1-7 business days

### Step 8: Wait for Review

**Timeline:**

- **Automated checks**: Immediate (malware scan, policy violations)
- **Manual review**: 1-3 business days (typically)
- **Total**: Usually 2-5 days

**Possible Outcomes:**

✅ **Approved**

- Extension published immediately
- Visible on Chrome Web Store
- Users can install via direct link
- Listed in store search results

❌ **Rejected**

- Email with rejection reasons
- Common reasons:
  - Missing privacy policy
  - Unclear permission justifications
  - Misleading screenshots/description
  - Violates developer policies
- **Fix issues and resubmit**

⚠️ **Needs Information**

- Google requests clarification
- Respond within 7 days
- Provide requested information

### Step 9: Post-Publication

Once approved:

1. **Note Extension ID**
   - Found in Developer Dashboard
   - Example: `abcdefghijklmnopqrstuvwxyz123456`

2. **Update Documentation**
   - Add Chrome Web Store link to README.md
   - Add installation instructions to prodsync.com

3. **Update Extension Manifest** (for future updates)
   - Hardcode extension ID in manifest.json (optional)
   - Remove development-only features

4. **Configure Analytics** (optional)
   - Set up Google Analytics for installs/usage
   - Monitor user feedback and ratings

5. **Promote Extension**
   - Add to ProdSync website
   - Email existing users
   - Social media announcement
   - Add badge to README

**Chrome Web Store Badge:**

```html
<a href="https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID">
  <img
    src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png"
    alt="Get ProdSync for Chrome"
  />
</a>
```

### Step 10: Monitor & Maintain

**Daily:**

- [ ] Check user reviews and ratings
- [ ] Respond to user feedback within 48 hours
- [ ] Monitor crash reports (if any)

**Weekly:**

- [ ] Check installation stats
- [ ] Review support emails
- [ ] Plan feature updates

**Monthly:**

- [ ] Analyze usage trends
- [ ] Update extension if needed (API changes, bug fixes)
- [ ] Publish changelog

## Updating Published Extension

When you need to update the extension:

1. **Make changes** to extension code
2. **Increment version** in `manifest.json`:
   ```json
   {
     "version": "1.0.1" // was 1.0.0
   }
   ```
3. **Test thoroughly** with updated version
4. **Build production**: `npm run build`
5. **Create new ZIP** from `dist/` folder
6. **Upload to Dashboard**:
   - Go to Developer Dashboard
   - Select your extension
   - Click "Upload Updated Package"
   - Upload new ZIP
7. **Update Store Listing** (if description/screenshots changed)
8. **Submit for Review**
9. **Wait for approval** (usually faster than initial review)
10. **Auto-update**: Users get update within hours after approval

## Troubleshooting

### Upload Failed

**Error: "Manifest is invalid"**

- Check `manifest.json` syntax (valid JSON)
- Ensure all required fields present
- Validate with JSON linter

**Error: "ZIP structure incorrect"**

- Ensure `manifest.json` is at root of ZIP, not in subfolder
- Recreate ZIP from `dist/` folder contents

### Review Rejection

**"Privacy policy not accessible"**

- Verify privacy policy URL loads correctly
- Check for HTTPS (HTTP not allowed)
- Ensure page doesn't require login

**"Unclear permission justification"**

- Expand permission explanations
- Be specific about why each permission is needed
- Reference exact features that use permissions

**"Violates Chrome Web Store policies"**

- Review: https://developer.chrome.com/docs/webstore/program-policies
- Common violations:
  - Misleading description
  - Requesting unnecessary permissions
  - Privacy issues

### Extension Doesn't Work After Publishing

**Error: "CORS policy blocks requests"**

- Verify CORS middleware is deployed in production backend
- Check backend URL in extension is correct (production, not localhost)
- Test with curl to verify CORS headers

**Error: "Authentication fails"**

- Ensure Firebase authorized domains includes production domain
- Check backend is accessible from extension origin
- Verify API keys are configured in production Firestore

## Resources

- **Chrome Web Store Developer Dashboard**: https://chrome.google.com/webstore/devconsole
- **Developer Program Policies**: https://developer.chrome.com/docs/webstore/program-policies
- **Publishing Guide**: https://developer.chrome.com/docs/webstore/publish
- **Branding Guidelines**: https://developer.chrome.com/docs/webstore/branding

## Support

Questions about deployment?

- **Documentation**: Check [WEBSTORE_SUBMISSION.md](WEBSTORE_SUBMISSION.md) for detailed info
- **Testing**: See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for thorough testing
- **CORS**: Review [CORS_SETUP.md](CORS_SETUP.md) for backend configuration
- **Email**: support@prodsync.com

---

**Estimated Timeline:**

- Asset creation: 4-8 hours
- Testing: 2-4 hours
- Submission: 1 hour
- Review: 1-7 days
- **Total: ~2 weeks from prep to live**

Good luck with your launch! 🚀
