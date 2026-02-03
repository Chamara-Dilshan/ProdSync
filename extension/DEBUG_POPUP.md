# Debug Extension Popup Error

## Step 1: Open Popup Console

1. **Right-click the ProdSync extension icon** in Chrome toolbar (top-right, near address bar)
2. Select **"Inspect popup"** from the menu
3. This opens Chrome DevTools for the popup
4. Click the **Console** tab

## Step 2: Look for Error Messages

Look for red error messages or `[ProdSync Popup]` logs. Common errors:

### Error A: "Please configure your API keys in the main ProdSync app"

**Means:** Extension can't find your API key in Firestore

**Fix:**

1. Go to http://localhost:3000/dashboard/settings
2. Make sure API key is filled in
3. Click "Validate & Save Settings" (don't just type and leave)
4. Wait for success message
5. Close and reopen extension popup
6. Try again

### Error B: "Failed to load user data" or "Settings not found"

**Means:** Extension can't connect to Firestore

**Fix:**

1. Check Console for detailed error
2. Verify Firebase credentials in `extension/.env`:
   ```
   VITE_FIREBASE_PROJECT_ID=prodsync-872b1
   VITE_FIREBASE_API_KEY=AIzaSyBHDs0yrOEB7mFTE6qspr_jxVBL9KbOfeg
   ```
3. Make sure you're signed in to extension with same account as main app
4. Try signing out and back in

### Error C: "Network error" or "Failed to fetch"

**Means:** Extension can't reach backend at http://localhost:3000

**Fix:**

1. Verify backend is running:
   - Open http://localhost:3000 in browser
   - Should show ProdSync app
2. Check CORS headers:
   ```bash
   # Run this in terminal
   curl -v -H "Origin: chrome-extension://test" http://localhost:3000/api/health
   ```
   Should return: `Access-Control-Allow-Origin: chrome-extension://test`
3. Restart backend if needed

### Error D: "Invalid API key" or "403 Forbidden"

**Means:** API key is invalid or expired

**Fix:**

1. Go to your AI provider's console:
   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://aistudio.google.com/apikey
   - Anthropic: https://console.anthropic.com/settings/keys
2. Verify your key is active (not revoked)
3. Copy the key again
4. Go to Settings and click "Validate & Save Settings"
5. Should show "Valid API key" or error message

### Error E: "Rate limit exceeded" or "429 Too Many Requests"

**Means:** You've hit the API rate limit

**Fix:**

- Free tier limits are very low (3-5 requests/min)
- Wait 1-2 minutes before trying again
- Or upgrade to paid tier for higher limits

## Step 3: Share Error Details

If you see a different error, please share:

1. The exact error message from Console
2. Any red error stacks
3. Network tab errors (if any API calls are failing)

## Step 4: Check Network Tab

While Popup DevTools is open:

1. Click **Network** tab
2. Clear existing logs (🚫 icon)
3. Try generating reply again
4. Look for failed requests (red text)
5. Click on failed request
6. Check **Response** tab for error details

Common network issues:

- **CORS error**: Backend CORS not configured
- **404 Not Found**: Backend API route doesn't exist
- **500 Internal Error**: Backend crashed, check backend console
- **Failed to fetch**: Network connectivity issue

## Quick Test Commands

### Test 1: Check if backend is accessible

Open popup console and run:

```javascript
fetch("http://localhost:3000/api/health", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
})
  .then((r) => r.json())
  .then((data) => console.log("✅ Backend OK:", data))
  .catch((err) => console.error("❌ Backend error:", err))
```

Expected output: `✅ Backend OK: { status: "ok" }` (or similar)

### Test 2: Check if you're authenticated

```javascript
chrome.storage.local.get(["authToken", "authExpiry"], (result) => {
  console.log("Auth token:", result.authToken ? "✅ Present" : "❌ Missing")
  console.log("Token expiry:", new Date(result.authExpiry))
  console.log("Expired?", result.authExpiry < Date.now() ? "❌ Yes" : "✅ No")
})
```

Expected output:

- `Auth token: ✅ Present`
- `Token expiry: [future date]`
- `Expired? ✅ No`

### Test 3: Check if settings are loaded

```javascript
chrome.storage.local.get(["userSettings"], (result) => {
  if (result.userSettings) {
    console.log("✅ Settings loaded:", result.userSettings)
    console.log("Selected provider:", result.userSettings.selectedProvider)
    console.log(
      "Has API key?",
      result.userSettings.apiKeys ? "✅ Yes" : "❌ No"
    )
  } else {
    console.error("❌ No settings found in storage")
  }
})
```

Expected output:

- `✅ Settings loaded: { ... }`
- `Selected provider: openai` (or gemini/anthropic)
- `Has API key? ✅ Yes`

## Most Common Issues (95% of cases)

1. **Not clicking "Validate & Save Settings"** - Just typing API key isn't enough, you MUST click the save button
2. **Using wrong account** - Extension account must match main app account
3. **Backend not running** - Check http://localhost:3000 is accessible
4. **Invalid API key** - Key expired, revoked, or has typo
5. **Not signed in to extension** - Click extension icon and sign in first

## Still Stuck?

If none of the above helps, please share:

1. Screenshot of popup showing the error
2. Console logs from popup (all `[ProdSync Popup]` messages)
3. Network tab showing failed requests (if any)
4. Output from the 3 test commands above
