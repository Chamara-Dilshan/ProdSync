# ProdSync Extension - Testing Guide

## Loading the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar
   - OR click menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" ON (top right corner)

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `D:\Projects\ProdSync\extension\dist`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "ProdSync - Etsy Reply Assistant" in your extensions list
   - The extension icon (blue square with "PS") should appear in your toolbar

## Testing Authentication (Phase 1)

### Test 1: Sign In

1. Click the ProdSync extension icon in your toolbar
2. Popup should open showing the login page
3. Enter your email and password OR click "Sign in with Google"
4. After successful login, you should see the Generator page with "Welcome, [your name]"

### Test 2: Token Persistence

1. Close the popup (click outside or press ESC)
2. Reopen the popup by clicking the extension icon
3. **Expected**: You should still be signed in (no login screen)
4. **Verifies**: Auth token is stored and persists

### Test 3: Sign Out

1. Click "Sign Out" button in the popup
2. Popup should return to login screen
3. Reopen popup - should show login screen again
4. **Verifies**: Sign out clears stored data

### Test 4: Etsy Page Detection

1. Visit https://www.etsy.com/messages (or any Etsy page)
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. **Expected logs**:
   - "ProdSync content script loaded on: https://www.etsy.com/messages"
   - "ProdSync: Etsy message page detected" (if on messages page)
   - OR "ProdSync: Not an Etsy message page, content script inactive" (if on other page)

### Test 5: Storage Inspection

1. Go to `chrome://extensions/`
2. Find ProdSync extension
3. Click "Inspect views: service worker"
4. In DevTools, go to Application tab → Storage → Local Storage → chrome-extension://...
5. **Expected keys after sign in**:
   - `prodsync_auth_token`
   - `prodsync_auth_token_expiry`
   - `prodsync_user_id`
   - `prodsync_user_email`

## Debugging

### Popup Errors

- Right-click extension icon → Inspect popup
- Console will show React errors and logs

### Service Worker Errors

- chrome://extensions → Find ProdSync → "Inspect views: service worker"
- Console shows background script logs

### Content Script Errors

- Open any Etsy page
- Press F12 to open DevTools
- Console shows content script logs

## Common Issues

### "Extension failed to load"

- Make sure you selected the `dist` folder, not the `extension` folder
- Try: `cd extension && npm run build` to rebuild

### "Firebase: Error (auth/invalid-api-key)"

- Check `.env` file has correct Firebase credentials
- Restart Chrome after changing `.env`
- Rebuild: `npm run build`

### Popup doesn't open

- Check if extension is enabled in chrome://extensions
- Look for errors in service worker console

### "Network request failed"

- If backend URL is not localhost:3000, check VITE_BACKEND_URL in `.env`
- Make sure backend is running if using localhost

## Phase 1 Testing Checklist

- [ ] Extension installs without errors
- [ ] Login with email/password works
- [ ] Login with Google works
- [ ] Token persists after closing/reopening popup
- [ ] Sign out clears data
- [ ] Etsy page detection logs appear in console
- [ ] No errors in popup console
- [ ] No errors in service worker console
- [ ] Storage shows correct auth keys after login

## What's NOT Working Yet (Expected)

These features are coming in later phases:

- ❌ "Generate Reply" button on Etsy pages (Phase 2)
- ❌ Message extraction from Etsy (Phase 2)
- ❌ Reply generation form (Phase 4)
- ❌ API calls to backend (Phase 3)
- ❌ Product/policy loading (Phase 3)

## Next Phase

Once Phase 1 testing is complete, we'll implement:

- **Phase 2**: DOM manipulation to inject button on Etsy pages
- **Phase 3**: API integration for reply generation
- **Phase 4**: Full reply generation UI
