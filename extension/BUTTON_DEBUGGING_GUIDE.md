# Button Not Appearing? Debugging Guide

## What Was Fixed

### 1. URL Pattern Issue ✅

**Problem**: Content script only ran on `https://www.etsy.com/messages/*` (with something after messages)
**Fixed**: Now runs on both `https://www.etsy.com/messages` AND `https://www.etsy.com/messages/*`

### 2. Enhanced Debugging ✅

Added detailed console logging with visual indicators (✓, ✅, ❌) to help identify issues

## How to Debug

### Step 1: Reload Extension

1. Go to `chrome://extensions`
2. Find **ProdSync** extension
3. Click the **refresh icon** (🔄)
4. Verify it says "Manifest Version: 3"

### Step 2: Open Etsy Messages Page

1. Navigate to `https://www.etsy.com/messages`
2. Open a conversation with a buyer
3. Open DevTools (press **F12** or **Ctrl+Shift+I**)
4. Click the **Console** tab

### Step 3: Check Console Logs

Look for these messages (in order):

#### ✅ **Good Signs:**

```
[ProdSync] Content script loaded on: https://www.etsy.com/messages/...
[ProdSync] Etsy message page detected
[ProdSync] Initializing content script
[ProdSync] Attempting to inject button
[ProdSync] Waiting for textarea...
[ProdSync] ✓ Textarea found, looking for submit button...
[ProdSync] ✓ Submit button found
[ProdSync] ✓ Button inserted before submit button
[ProdSync] ✅ Generate button injected successfully
[ProdSync] Page change observer started
```

#### ❌ **Problem Signs:**

**If you see:**

```
[ProdSync] Not an Etsy message page, content script inactive
```

**Solution**: URL pattern issue. Make sure you're on `https://www.etsy.com/messages` or a conversation page.

---

**If you see:**

```
[ProdSync] ❌ Could not find textarea with any selector
[ProdSync] Available textareas on page: 0
```

**Solution**: The page hasn't fully loaded or Etsy changed their HTML. Try:

1. Refresh the page
2. Wait a few seconds
3. Check if there's a textarea with placeholder "Type your reply"

---

**If you see:**

```
[ProdSync] ❌ Could not find submit button area
[ProdSync] Available buttons on page: 15
[ProdSync] Buttons with 'Send' text: 1
```

**Solution**: The selectors don't match Etsy's HTML. We need to update them.

### Step 4: Inspect Etsy's HTML Structure

If the button still doesn't appear, we need to check Etsy's actual HTML:

#### Find the Textarea:

1. Right-click on the message input box (where you type replies)
2. Click **Inspect** (or **Inspect Element**)
3. Look at the highlighted element in DevTools
4. Copy the important attributes:
   - `name="..."` attribute
   - `id="..."` attribute (if any)
   - `class="..."` classes
   - `data-*` attributes

**Example:**

```html
<textarea
  name="message"
  class="wt-textarea"
  placeholder="Type your reply"
></textarea>
```

#### Find the Send Button:

1. Right-click on the **Send** button
2. Click **Inspect**
3. Copy the button's attributes:
   - `class="..."` classes
   - `data-*` attributes
   - Parent element structure

**Example:**

```html
<button type="submit" class="wt-btn wt-btn--primary">Send</button>
```

### Step 5: Update Selectors (If Needed)

If Etsy's HTML doesn't match our selectors, we need to update them:

**File to edit**: [extension/src/content/etsy-selectors.ts](./src/content/etsy-selectors.ts)

**Current selectors:**

```typescript
export const TEXTAREA_SELECTORS = [
  'textarea[name="message"]',
  'textarea[placeholder*="reply" i]',
  'textarea[placeholder*="message" i]',
  ".wt-textarea",
  "textarea",
]

export const SUBMIT_BUTTON_SELECTORS = [
  'button[type="submit"]',
  'button:has-text("Send")',
  ".wt-btn--primary",
  'button[data-action="send"]',
]
```

Update these arrays with the selectors you found in Step 4.

### Step 6: Rebuild After Changes

If you modified selectors:

```bash
cd extension
npm run build
```

Then reload the extension in Chrome and test again.

## Common Issues & Solutions

### Issue 1: Button Appears Then Disappears

**Cause**: Etsy's page uses React and re-renders, removing the button
**Solution**: Already handled! MutationObserver automatically re-injects the button
**Check**: Look for `[ProdSync] Button removed, re-injecting` in console

### Issue 2: Button Never Appears

**Cause**: Selectors don't match Etsy's HTML
**Solution**: Follow Steps 4-6 above to update selectors

### Issue 3: Multiple Buttons Appear

**Cause**: MutationObserver re-injecting too aggressively
**Solution**: Already handled! Code checks for existing button before injecting

### Issue 4: Content Script Doesn't Load

**Cause**: Manifest permissions or URL pattern
**Solution**:

1. Check `chrome://extensions` → ProdSync → Details
2. Verify "Site access" shows "On specific sites"
3. Should include `etsy.com`

## Quick Diagnostic Checklist

Run these in the DevTools Console on Etsy messages page:

```javascript
// 1. Check if content script loaded
console.log("[TEST] Content script:", typeof window !== "undefined")

// 2. Check for textarea
console.log(
  "[TEST] Textareas found:",
  document.querySelectorAll("textarea").length
)

// 3. Check for send button
console.log(
  "[TEST] Send buttons:",
  Array.from(document.querySelectorAll("button")).filter(
    (b) => b.textContent.trim().toLowerCase() === "send"
  ).length
)

// 4. Check for ProdSync button
console.log(
  "[TEST] ProdSync button:",
  !!document.getElementById("prodsync-generate-btn")
)

// 5. Check page URL
console.log("[TEST] URL:", window.location.href)
```

Expected output:

```
[TEST] Content script: true
[TEST] Textareas found: 1
[TEST] Send buttons: 1
[TEST] ProdSync button: true
[TEST] URL: https://www.etsy.com/messages/...
```

## Still Not Working?

If you've tried everything above and the button still doesn't appear:

1. **Take screenshots** of:
   - DevTools Console logs
   - Etsy page showing the textarea and Send button
   - Right-click → Inspect on the textarea (showing HTML)
   - Right-click → Inspect on the Send button (showing HTML)

2. **Run the diagnostic checklist** above and share the output

3. **Check these files**:
   - `extension/src/content/etsy-selectors.ts` - Current selectors
   - `extension/public/manifest.json` - URL patterns
   - `extension/src/content/index.ts` - URL detection logic

4. **Verify extension permissions**:
   - Go to `chrome://extensions`
   - Click "Details" on ProdSync
   - Check "Site access" includes etsy.com
   - Check "Permissions" includes storage, tabs

## Testing After Fix

1. ✅ Reload extension
2. ✅ Refresh Etsy page
3. ✅ Open DevTools Console
4. ✅ Look for green checkmarks (✓, ✅) in logs
5. ✅ Verify button appears next to Send button
6. ✅ Click button and verify notification appears
7. ✅ Click extension icon and verify popup opens with message

## Files Modified in This Fix

- ✅ `extension/src/content/index.ts` - URL pattern regex
- ✅ `extension/public/manifest.json` - Content script URL matches
- ✅ `extension/src/content/ui-injector.ts` - Enhanced debugging logs
- ✅ Extension rebuilt and ready to test

## Next Steps

1. Reload extension in Chrome
2. Visit Etsy messages page
3. Open DevTools Console
4. Look for detailed logs
5. Share console output if button still doesn't appear
