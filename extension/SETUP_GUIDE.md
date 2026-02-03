# ProdSync Extension - Complete Setup Guide

This guide will help you get the "Generate Reply with ProdSync" button working end-to-end.

## Prerequisites ✅

- [x] Backend is running on `http://localhost:3000`
- [x] Extension is built (see `extension/dist/` folder)
- [x] CORS middleware is configured

## Step 1: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `D:\Projects\ProdSync\extension\dist`
   - Select the `dist` folder and click "Select Folder"

4. **Verify Extension is Loaded**
   - You should see "ProdSync" extension in the list
   - Extension ID will be displayed (e.g., `chrome-extension://abcdef...`)
   - Extension icon should appear in Chrome toolbar

## Step 2: Configure API Keys in Main App

**CRITICAL:** The extension uses YOUR API keys stored in Firestore. You MUST configure them in the main ProdSync app first.

1. **Open Main ProdSync App**
   - Navigate to: `http://localhost:3000`
   - Sign in with your account (or create one)

2. **Go to Settings Page**
   - Click "Settings" in the sidebar
   - Or navigate to: `http://localhost:3000/dashboard/settings`

3. **Add Your API Key**
   - Choose an AI provider (OpenAI, Google Gemini, or Anthropic)
   - Enter your API key for that provider
   - Select a model from the dropdown
   - Click "Validate & Save Settings"

   **Where to get API keys:**
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Google Gemini**: https://aistudio.google.com/apikey
   - **Anthropic**: https://console.anthropic.com/settings/keys

4. **Verify Settings are Saved**
   - Settings should show "Settings saved successfully"
   - API key should be stored in Firestore under `users/{userId}/settings/general`

## Step 3: Add Products (Optional but Recommended)

Products help the AI generate more relevant replies.

1. **Go to Products Page**
   - Navigate to: `http://localhost:3000/dashboard/products`

2. **Add a Product Manually**
   - Click "Add Product" button
   - Fill in: Name, Description, Price
   - Click "Save"

   **OR Import from Excel:**
   - Download template from Products page
   - Fill in your products
   - Upload Excel file

3. **Verify Products are Added**
   - Products should appear in the list
   - Extension will show these products in the selector

## Step 4: Test on Etsy (Real Test)

**Note:** You need an Etsy seller account with messages to test this properly.

1. **Visit Etsy Messages**
   - Go to: https://www.etsy.com/messages
   - Sign in to your Etsy seller account

2. **Open a Conversation**
   - Click on any buyer conversation
   - You should see the message thread

3. **Look for "Generate Reply with ProdSync" Button**
   - Button should appear near the message textarea
   - It has a gradient purple/pink style with sparkle emoji (✨)
   - Located above or below the "Send" button

4. **Click the Button**
   - Extension popup should open automatically
   - Popup should display:
     - ✅ Buyer's message (extracted from page)
     - ✅ Tone selector (Professional/Friendly/Formal/Casual)
     - ✅ Product list (if you added products)
     - ✅ "Generate Reply" button

5. **Generate Reply**
   - Select a tone (default: Professional)
   - Optionally select products to mention
   - Click "Generate Reply" button
   - Wait for AI to generate response (5-10 seconds)

6. **Insert Reply**
   - Generated reply appears in preview section
   - Click "Copy" to copy to clipboard
   - **OR** Click "Insert into Etsy" to automatically insert into textarea
   - Edit if needed, then click "Send" on Etsy

## Step 5: Test Without Etsy (Debugging)

If you don't have access to Etsy messages, you can still test the extension:

1. **Open Extension Popup Manually**
   - Click the ProdSync icon in Chrome toolbar
   - Or right-click icon → "Open popup"

2. **Sign In**
   - Enter your email/password (same as main app)
   - Or sign in with Google

3. **Check Console for Errors**
   - Right-click popup → "Inspect"
   - Check Console tab for errors
   - Look for `[ProdSync Popup]` logs

4. **Verify Data Loading**
   - Console should show:
     - `[ProdSync Popup] Loading user data...`
     - `[ProdSync Popup] Loaded X products`
     - `[ProdSync Popup] Loaded user settings`

5. **Test API Connection**
   - Open DevTools Console on popup
   - Run:
     ```javascript
     fetch("http://localhost:3000/api/health", {
       headers: { "Content-Type": "application/json" },
     })
       .then((r) => r.json())
       .then(console.log)
     ```
   - Should return: `{ status: "ok" }`

## Troubleshooting

### Button Doesn't Appear on Etsy Page

**Problem:** The "Generate Reply with ProdSync" button is not visible on Etsy messages page.

**Solution:**

1. Open DevTools on Etsy page (F12)
2. Check Console for errors with `[ProdSync]` prefix
3. Common issues:
   - **"Timeout waiting for element"**: Selectors need updating
     - Inspect Etsy HTML and update `extension/src/content/etsy-selectors.ts`
     - Rebuild: `cd extension && npm run build`
     - Reload extension in `chrome://extensions`
   - **No errors, no button**: Content script not running
     - Check URL matches patterns in `content/index.ts`
     - Ensure you're on `https://www.etsy.com/messages`

### Popup Shows "Error Loading Buyer Message"

**Problem:** Popup opens but can't extract the message from Etsy page.

**Solution:**

1. Check Console for `[ProdSync] Get current message: not found`
2. Inspect message elements on Etsy page
3. Update selectors in `extension/src/content/etsy-selectors.ts`:
   ```typescript
   export const ETSY_SELECTORS = {
     buyerMessage: [
       "[data-message-text]", // Update these
       ".message-body", // with actual selectors
       ".conversation-message", // from Etsy HTML
     ],
     // ...
   }
   ```
4. Rebuild and reload extension

### "Please Configure Your API Keys" Error

**Problem:** Popup shows error about missing API keys when clicking "Generate Reply".

**Solution:**

1. Go to main app: http://localhost:3000/dashboard/settings
2. Add your API key for at least one provider
3. Click "Validate & Save Settings"
4. Reload extension popup (close and reopen)
5. Try generating again

### "Invalid API Key" or "403 Forbidden" Error

**Problem:** Reply generation fails with authentication error.

**Solution:**

1. Verify API key is correct:
   - **OpenAI**: Should start with `sk-proj-` or `sk-`
   - **Gemini**: Should start with `AIza`
   - **Anthropic**: Should start with `sk-ant-`
2. Test the key directly in provider's console
3. Check if key has expired or been revoked
4. Generate new key if necessary
5. Update in Settings and click "Validate & Save Settings"

### "Rate Limit Exceeded" Error

**Problem:** Too many requests in short time.

**Solution:**

- **Free tier limits:**
  - OpenAI: 3 requests/minute
  - Gemini: 100 requests/minute
  - Anthropic: 5 requests/minute
- Wait 1-2 minutes before trying again
- Consider upgrading to paid tier for higher limits
- Switch to different provider if one is hitting limits

### CORS Error in Console

**Problem:** Console shows "Access-Control-Allow-Origin" error when calling API.

**Solution:**

1. Verify middleware is running:
   - Check `middleware.ts` exists in project root
   - Restart backend: Stop (Ctrl+C) and run `npm run dev`
2. Check backend logs for CORS headers
3. Test with curl:
   ```bash
   curl -H "Origin: chrome-extension://abcdefg" http://localhost:3000/api/health
   ```
   Should return CORS headers in response

### Extension Not Loading in Chrome

**Problem:** Extension shows errors when loading or doesn't load at all.

**Solution:**

1. Check for build errors:
   ```bash
   cd extension
   npm run type-check
   npm run build
   ```
2. Ensure `dist/manifest.json` exists
3. Verify all required files are in `dist/` folder
4. Try removing and re-adding extension:
   - Click "Remove" in `chrome://extensions`
   - Click "Load unpacked" again
   - Select `dist/` folder

### Popup Immediately Closes After Opening

**Problem:** Popup opens briefly then closes automatically.

**Solution:**

1. Right-click extension icon → "Inspect popup"
2. Keep DevTools open (popup won't close while inspecting)
3. Check Console for errors
4. Look for:
   - Firebase initialization errors
   - Missing environment variables
   - JavaScript runtime errors

### Reply Not Inserting into Etsy Textarea

**Problem:** "Insert into Etsy" button doesn't work or reply doesn't appear in textarea.

**Solution:**

1. Check Console for `[ProdSync] Could not find message textarea`
2. Inspect textarea element on Etsy page
3. Update `TEXTAREA_SELECTORS` in `etsy-selectors.ts`
4. Verify content script has permission to modify page
5. Check if Etsy's React events are being triggered correctly

## Development Mode

If you're modifying the extension code:

1. **Watch Mode (Auto-rebuild on changes):**

   ```bash
   cd extension
   npm run dev
   ```

2. **After Making Changes:**
   - Popup/UI changes: Auto-reloads with HMR
   - Background/content script changes:
     - Go to `chrome://extensions`
     - Click refresh icon on ProdSync extension
     - Reload Etsy page if testing content script

3. **View Logs:**
   - **Popup logs**: Right-click icon → Inspect popup → Console
   - **Background logs**: chrome://extensions → Inspect views: service worker
   - **Content script logs**: DevTools on Etsy page (F12) → Console
   - Filter by `[ProdSync]` to see only extension logs

## Next Steps

Once everything is working:

1. **Production Build:**

   ```bash
   cd extension
   npm run build
   ```

   Creates optimized build in `dist/`

2. **Test All Flows:**
   - ✅ Sign in/out
   - ✅ Button injection on Etsy
   - ✅ Message extraction
   - ✅ Reply generation with all 3 providers
   - ✅ Reply insertion
   - ✅ Product selection
   - ✅ Tone selection
   - ✅ Error handling

3. **Chrome Web Store Submission:**
   - Follow guide: [extension/WEBSTORE_SUBMISSION.md](WEBSTORE_SUBMISSION.md)
   - Create screenshots, promotional tiles
   - Host privacy policy
   - Submit for review

## Support

If you encounter issues not covered here:

1. Check browser console for detailed error messages
2. Enable verbose logging in code (uncomment debug logs)
3. Test backend directly with curl/Postman
4. Verify Firebase configuration matches between main app and extension
5. Check [extension/README.md](README.md) for architecture details

## Quick Reference

**Key Files:**

- Button injection: `src/content/ui-injector.ts`
- Message extraction: `src/content/ui-injector.ts` (extractBuyerMessage)
- Reply generation: `src/popup/pages/Generator.tsx` (handleGenerateReply)
- API client: `src/shared/api/api-client.ts`
- Selectors: `src/content/etsy-selectors.ts` ← **Update these for Etsy**

**Important URLs:**

- Main app: http://localhost:3000
- Settings: http://localhost:3000/dashboard/settings
- Products: http://localhost:3000/dashboard/products
- Extensions: chrome://extensions
- Etsy messages: https://www.etsy.com/messages

**Console Log Prefixes:**

- `[ProdSync]` - General extension logs
- `[ProdSync Popup]` - Popup-specific logs
- `[ProdSync Background]` - Service worker logs
- `[API Client]` - API request logs
