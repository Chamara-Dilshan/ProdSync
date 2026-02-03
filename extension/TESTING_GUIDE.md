# ProdSync Extension - Quick Testing Guide

## Prerequisites

### 1. Main ProdSync App Setup

```bash
# In project root
npm install
npm run dev  # Starts at http://localhost:3000
```

### 2. Configure Main App

1. Visit http://localhost:3000
2. Sign up / Sign in
3. Go to Settings → Add at least one API key (OpenAI, Gemini, or Anthropic)
4. (Optional) Add products in Products page
5. (Optional) Add policies in Policies page

### 3. Extension Setup

```bash
# In extension directory
cd extension
npm install

# Create .env file
cp .env.example .env
```

Edit `extension/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# For development (main app running locally)
VITE_BACKEND_URL=http://localhost:3000
```

```bash
# Build and run
npm run dev
```

### 4. Load Extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select `extension/dist/` directory
5. Extension icon should appear in toolbar

---

## Testing Checklist

### ✅ Phase 1.1: Authentication

1. **Sign In**
   - Click extension icon
   - Click "Sign in with Email"
   - Enter credentials (same as main app)
   - Should see welcome screen with your email

2. **Token Persistence**
   - Close popup
   - Reopen popup
   - Should still be logged in (no login screen)

3. **Sign Out**
   - Click "Sign Out" button
   - Should return to login screen
   - Reopen popup → Should show login screen

**Console Checks:**

- Right-click extension icon → Inspect popup
- Check for `[ProdSync]` prefixed logs
- No errors should appear

---

### ✅ Phase 1.2: Content Script Integration

**Note:** You need an Etsy seller account to test this fully.

1. **Button Injection**
   - Visit https://www.etsy.com/messages
   - Open DevTools (F12) → Console tab
   - Look for logs:
     ```
     [ProdSync] Content script loaded
     [ProdSync] Etsy message page detected
     [ProdSync] Initializing content script
     [ProdSync] Generate button injected successfully
     ```
   - Look for "✨ Generate Reply with ProdSync" button near message textarea

2. **Message Extraction**
   - Click "Generate Reply with ProdSync" button
   - Extension popup should open automatically
   - Popup should display extracted buyer message
   - Check Console for:
     ```
     [ProdSync] Message stored, opening popup
     [ProdSync Popup] Buyer message loaded successfully
     ```

**If Button Doesn't Appear:**

1. Open DevTools Console on Etsy page
2. Check for selector errors
3. Inspect Etsy HTML:
   - Find the message textarea element
   - Find the buyer message container
   - Find the send button area
4. Update selectors in `extension/src/content/etsy-selectors.ts`
5. Rebuild: `cd extension && npm run build`
6. Reload extension in `chrome://extensions/`

---

### ✅ Phase 1.3: API Integration & Reply Generation

#### 1. Data Loading

1. **Open Popup**
   - Click extension icon (or click "Generate Reply" on Etsy)
   - Should see loading spinner initially
   - Should see your email/name in header

2. **Check Background Worker Logs**
   - Go to `chrome://extensions/`
   - Find ProdSync extension
   - Click "Inspect views: service worker"
   - Check Console for:
     ```
     [ProdSync] Fetching products for user: {userId}
     [Firestore] Fetched X products
     [ProdSync] Fetching policies for user: {userId}
     [Firestore] Fetched X policies
     [ProdSync] Fetching settings for user: {userId}
     [Firestore] Settings fetched successfully
     ```

3. **Verify Data Caching**
   - Close and reopen popup
   - Background worker should show:
     ```
     [ProdSync] Returning cached products
     [ProdSync] Returning cached policies
     [ProdSync] Returning cached settings
     ```

#### 2. Reply Generation

1. **On Etsy Message Page:**
   - Click "Generate Reply with ProdSync" button
   - Popup opens with buyer message

2. **In Popup:**
   - Verify buyer message is displayed
   - Verify tone selector shows 4 buttons (professional, friendly, formal, casual)
   - Verify product list appears (if you have products)
   - Default tone should match your setting in main app

3. **Generate Reply:**
   - Select tone (e.g., "Friendly")
   - Select 1-2 products (optional)
   - Click "Generate Reply" button
   - Should see:
     - Button text changes to "Generating..."
     - Button becomes disabled
     - Loading indicator

4. **Check Background Worker:**
   - Console should show:
     ```
     [ProdSync] Generating reply with: {
       provider: "openai",
       model: "gpt-4o-mini",
       tone: "friendly",
       productsCount: 2,
       policiesCount: 1
     }
     [API Client] POST http://localhost:3000/api/ai/generate-reply
     [ProdSync] Reply generated successfully
     ```

5. **Verify Reply:**
   - Reply should appear in preview section
   - Reply should be relevant to buyer message
   - Reply should match selected tone
   - Reply should mention selected products (if any)

#### 3. Reply Actions

1. **Copy Reply:**
   - Click "Copy" button
   - Paste (Ctrl+V) in any text field
   - Should match generated reply

2. **Insert Reply:**
   - Click "Insert into Etsy" button
   - Popup should close automatically
   - Reply should appear in Etsy message textarea
   - You should be able to edit the reply
   - (Don't actually send unless you want to!)

---

### ❌ Error Handling Tests

#### 1. Missing API Key

```bash
# In main app:
1. Go to Settings
2. Remove all API keys
3. Save settings

# In extension:
1. Try to generate reply
2. Should show error: "Please configure your API keys in the main ProdSync app"
```

#### 2. Invalid API Key

```bash
# In main app:
1. Go to Settings
2. Enter invalid API key (e.g., "sk-invalid123")
3. Save settings

# In extension:
1. Try to generate reply
2. Should show error: "Invalid API key for openai. Please check your Settings..."
```

#### 3. Network Error

```bash
# Stop main app dev server
# In extension:
1. Try to generate reply
2. Should show: "Network error. Please check your connection."
```

#### 4. Rate Limit (Hard to Test)

```bash
# Only occurs with real API keys hitting rate limits
# Error message: "Rate limit exceeded for {provider}. Wait 1-2 minutes..."
```

---

### 🔄 Token Refresh Test

**Manual Test (5 minutes):**

```bash
# In service worker console (chrome://extensions → Inspect views):
1. Watch for logs every 55 minutes:
   "[ProdSync] Checking if token refresh needed..."

2. To force test, modify background/index.ts:
   - Change REFRESH_INTERVAL to 1 * 60 * 1000 (1 minute)
   - Rebuild extension
   - Watch console for token refresh
```

---

## Common Issues

### Extension Won't Load

```bash
# Fix:
cd extension
rm -rf node_modules dist
npm install
npm run build
# Reload in chrome://extensions/
```

### Popup Shows Login Screen Every Time

```bash
# Check:
1. Chrome DevTools → Application → Storage → Local Storage
2. Look for chrome-extension://{id}
3. Check if auth_token exists
4. If missing, re-authenticate and check console for storage errors
```

### "Generate Reply" Button Not Appearing

```bash
# Fix:
1. Open DevTools on Etsy page
2. Inspect message textarea and buyer message container
3. Update selectors in extension/src/content/etsy-selectors.ts
4. Rebuild: npm run build
5. Reload extension
```

### Reply Generation Fails

```bash
# Check in order:
1. Main app is running (http://localhost:3000)
2. VITE_BACKEND_URL in extension/.env is correct
3. API key is configured in main app Settings
4. Service worker console shows no errors
5. Main app console shows API request received
```

### Data Not Loading (Products/Policies)

```bash
# Check:
1. Firestore security rules are configured
2. User has products/policies in main app
3. Service worker console shows Firestore fetch logs
4. No permission errors in console
```

---

## Debug Consoles

### 3 Important Consoles:

1. **Popup Console:**
   - Right-click extension icon → Inspect popup
   - Shows popup UI errors

2. **Service Worker Console:**
   - chrome://extensions/ → Inspect views: service worker
   - Shows background worker, API calls, data fetching

3. **Etsy Page Console:**
   - Open DevTools (F12) on Etsy page
   - Shows content script, button injection, message extraction

**Pro Tip:** Filter logs by typing `[ProdSync]` in console filter

---

## Success Criteria

✅ **Phase 1.1:** Authentication works, token persists
✅ **Phase 1.2:** Button appears on Etsy, message extracted
✅ **Phase 1.3:** Reply generated with AI, inserted into Etsy

If all checkboxes pass → **Extension is working correctly!** 🎉

---

## Next Steps After Testing

1. Test on actual Etsy buyer messages
2. Verify DOM selectors work (update if needed)
3. Test with all 3 AI providers (OpenAI, Gemini, Anthropic)
4. Test with different tones
5. Prepare for Chrome Web Store submission (Phase 1.4)

---

**Need Help?**

- Check CLAUDE.md for full documentation
- Check PHASE_1_3_SUMMARY.md for implementation details
- Check extension/README.md for setup instructions
