# ProdSync Browser Extension

AI-powered reply generation for Etsy shop owners. Generate professional, policy-compliant responses directly from your Etsy inbox.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the extension directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials (same as main app) and backend URL:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_BACKEND_URL=https://your-prodsync-app.vercel.app
```

## Development

### Important: Use Production Build for Development

**Due to Chrome extension CORS restrictions, use the production build instead of dev mode:**

```bash
npm run build
```

**Why not dev mode?**

- Chrome extensions block HMR (Hot Module Replacement) due to CORS policies
- The dev server (`npm run dev`) will cause "Service worker registration failed" errors
- Production builds work reliably without requiring a dev server

### Load Extension in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension/dist` directory
6. The extension should now appear in your browser

### Making Changes

When you make changes to the extension code:

1. Run `npm run build` to rebuild
2. Go to `chrome://extensions/`
3. Click the reload icon on the ProdSync extension
4. Test your changes

## Build for Production

```bash
npm run build
```

This creates an optimized build in `extension/dist/` ready for Chrome Web Store submission.

## Project Structure

```
extension/
├── public/
│   ├── manifest.json          # Chrome Manifest V3
│   └── icons/                 # Extension icons
├── src/
│   ├── background/            # Background service worker
│   ├── content/               # Content scripts (Etsy integration)
│   ├── popup/                 # React popup UI
│   ├── shared/                # Shared utilities
│   │   ├── firebase/          # Firebase auth
│   │   ├── storage/           # Chrome Storage wrappers
│   │   ├── messaging/         # Cross-context messaging
│   │   └── utils/             # Utilities
│   └── components/ui/         # UI components
└── dist/                      # Build output (created on build)
```

## Implementation Status

### Phase 1.1: Foundation ✅ (Completed)

- ✅ Vite + React + TypeScript setup
- ✅ Chrome Manifest V3 configured
- ✅ Chrome Storage wrappers (auth, cache)
- ✅ Firebase authentication integration
- ✅ Popup UI with login flow
- ✅ Token storage and expiry management

### Phase 1.2: Content Script Integration ✅ (Completed)

- ✅ Etsy page detection with URL patterns
- ✅ DOM manipulation (button injection)
- ✅ Buyer message extraction from conversation
- ✅ Reply insertion into Etsy textarea
- ✅ MutationObserver for SPA navigation
- ✅ Multiple fallback strategies for selectors

### Phase 1.3: API Integration ✅ (Completed)

- ✅ Backend API client for /api/ai/generate-reply
- ✅ Firestore data fetching (products, policies, settings)
- ✅ Token refresh mechanism in background worker
- ✅ Data caching with 1-hour TTL
- ✅ Comprehensive error handling (401, 403, 429, 500+)
- ✅ Full reply generation UI in popup
- ✅ Product and tone selectors
- ✅ Reply preview with copy/insert buttons

### Phase 1.4: Testing (Pending)

- ⏳ Unit tests for utilities
- ⏳ Integration tests for API client
- ⏳ Manual testing checklist completion
- ⏳ Cross-browser testing (Edge, Brave)

### Phase 1.5: Deployment (Pending)

- ⏳ Chrome Web Store submission
- ⏳ Privacy policy document
- ⏳ Store listing assets (screenshots, promo images)
- ⏳ User documentation

## Testing

### Authentication (Phase 1.1)

1. Start the dev server: `npm run dev`
2. Load the extension in Chrome
3. Click the extension icon to open popup
4. Sign in with your ProdSync credentials
5. Verify token persists after closing and reopening popup
6. Test sign out clears auth data

### Content Script Integration (Phase 1.2 - Updated Feb 2026)

1. Visit https://www.etsy.com/messages (works on both `/messages` and `/messages/*` pages)
2. Open browser DevTools (F12) → Console tab
3. Look for enhanced `[ProdSync]` logs with visual indicators:
   - ✅ `[ProdSync] Content script loaded`
   - ✅ `[ProdSync] Etsy message page detected`
   - ✅ `[ProdSync] ✓ Textarea found, looking for submit button...`
   - ✅ `[ProdSync] ✓ Submit button found`
   - ✅ `[ProdSync] ✅ Generate button injected successfully`
4. Verify "✨ Generate Reply with ProdSync" button appears near textarea
5. Click the button:
   - A purple notification should appear: "✨ Message captured! Click the ProdSync extension icon..."
   - This is **normal** behavior in Chrome MV3 (auto-popup opening is unreliable)
6. Click the ProdSync extension icon to open popup
7. Check that buyer message is automatically loaded

**If button doesn't appear:**

- Check Console for ❌ errors with diagnostic info (shows counts of textareas/buttons found)
- See comprehensive debugging guide: [BUTTON_DEBUGGING_GUIDE.md](./BUTTON_DEBUGGING_GUIDE.md)
- Quick diagnostic: Run in Console:
  ```javascript
  console.log("Textareas:", document.querySelectorAll("textarea").length)
  console.log(
    "Send buttons:",
    Array.from(document.querySelectorAll("button")).filter((b) =>
      b.textContent.includes("Send")
    ).length
  )
  console.log(
    "ProdSync button:",
    !!document.getElementById("prodsync-generate-btn")
  )
  ```
- Inspect Etsy HTML and update selectors in [src/content/etsy-selectors.ts](src/content/etsy-selectors.ts)
- Rebuild: `npm run build` and reload extension

### API Integration (Phase 1.3)

1. Complete authentication and content script testing first
2. On Etsy message page, click "Generate Reply" button
3. In popup:
   - Verify buyer message is displayed
   - Select tone (professional, friendly, formal, casual)
   - Select products from list (if you have products in main app)
   - Click "Generate Reply" button
4. Verify reply is generated successfully
5. Test "Copy" button copies reply to clipboard
6. Test "Insert into Etsy" button inserts reply into Etsy textarea
7. Test error handling:
   - Try generating without API keys configured
   - Check error messages are displayed

**Data Caching:**

1. Open extension service worker console: chrome://extensions → Inspect views: service worker
2. Check logs for:
   - "Fetched X products" (first time)
   - "Returning cached products" (subsequent times)
3. Verify cache expires after 1 hour (check timestamp in Chrome Storage)

**Token Refresh:**

1. Wait 55 minutes after login (or manually trigger)
2. Check service worker console for:
   - "Checking if token refresh needed..."
   - "Token refreshed successfully in background"
3. Verify extension continues working after token refresh

## Troubleshooting

### "Service worker registration failed" or CORS errors

**Symptoms:**

- "Vite Dev Mode" popup appears
- CORS policy errors in console
- "Cannot connect to Vite Dev Server"

**Solution:**

1. **DO NOT use `npm run dev`** - it has CORS issues with Chrome extensions
2. Use production build instead: `npm run build`
3. Remove old extension from `chrome://extensions/`
4. Load the `extension/dist` folder as unpacked extension
5. The extension will work without errors

**Why this happens:**

- Chrome Manifest V3 has strict CORS policies
- Vite's HMR server requires CORS headers that Chrome blocks
- Production builds don't need a dev server and work reliably

### Extension not loading

- Check console for errors in `chrome://extensions/`
- Verify `.env` file exists with correct Firebase credentials
- Try rebuilding: `npm run build`
- Make sure you're loading the `dist` folder, not the `extension` folder

### Authentication fails

- Verify Firebase credentials match main app
- Check Firebase Console for authentication errors
- Ensure Firebase Auth domain includes Chrome extension in authorized domains

### Button doesn't appear on Etsy page (Updated Feb 2026)

**NEW**: Enhanced debugging with visual indicators!

1. Open DevTools (F12) → Console tab
2. Look for ❌ error indicators:
   - `[ProdSync] ❌ Could not find textarea with any selector`
   - `[ProdSync] ❌ Could not find submit button area`
3. Diagnostic info is automatically logged (counts of elements found)
4. **See comprehensive guide**: [BUTTON_DEBUGGING_GUIDE.md](./BUTTON_DEBUGGING_GUIDE.md)
5. Common fixes:
   - Reload extension after building
   - Check you're on https://www.etsy.com/messages (works on both `/messages` and `/messages/*`)
   - Inspect Etsy HTML and update selectors in `etsy-selectors.ts`

**Quick diagnostic** (run in Console on Etsy page):

```javascript
console.log("URL:", window.location.href)
console.log("Textareas:", document.querySelectorAll("textarea").length)
console.log(
  "Send buttons:",
  Array.from(document.querySelectorAll("button")).filter((b) =>
    b.textContent.includes("Send")
  ).length
)
console.log(
  "ProdSync button:",
  !!document.getElementById("prodsync-generate-btn")
)
```

### Popup doesn't open when button clicked (Updated Feb 2026)

**This is NORMAL behavior!** Due to Chrome Manifest V3 restrictions, the popup often can't open automatically.

**Expected flow:**

1. Click "Generate Reply with ProdSync" button
2. Purple notification appears: "✨ Message captured! Click the ProdSync extension icon..."
3. Click extension icon in Chrome toolbar
4. Popup opens with message pre-loaded (valid for 5 minutes)

**If notification doesn't appear:**

- Check Console for `[ProdSync] Message stored, opening popup`
- Verify extension has correct permissions
- Try manually clicking extension icon

See also: [POPUP_FLOW_FIX.md](./POPUP_FLOW_FIX.md)

## Recent Updates (February 2026)

- ✅ **Fixed**: Button not appearing on `/messages` page (URL pattern issue)
- ✅ **Fixed**: Popup not opening (added notification fallback for MV3)
- ✅ **Enhanced**: Debugging with visual indicators (✓, ✅, ❌)
- ✅ **Added**: Comprehensive debugging guide
- ✅ **Improved**: Message storage with 5-minute expiry

## Next Steps

See the main plan at `C:\Users\chama\.claude\plans\rustling-imagining-crayon.md` for detailed implementation roadmap.
