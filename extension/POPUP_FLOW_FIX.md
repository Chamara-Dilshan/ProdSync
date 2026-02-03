# Popup Flow Fix - February 2026

## Problem

The "Generate Reply with ProdSync" button on Etsy pages was not opening the popup automatically. The button would click but nothing would happen, leaving users confused.

## Root Cause

1. **Missing Message Handler**: The button was sending an `OPEN_POPUP` message to the background script, but the background script had no handler for it.

2. **Chrome MV3 Limitations**: Chrome Manifest V3 has strict limitations on programmatically opening popups. The `chrome.action.openPopup()` API can only be called in response to a direct user action and often fails when called from a service worker in response to a message from a content script.

## Solution Implemented

### 1. Added Background Script Handler

**File**: `extension/src/background/index.ts`

- Added handler for `OPEN_POPUP` message type
- Implemented `handleOpenPopup()` function that attempts to call `chrome.action.openPopup()`
- Returns success/failure status to content script

### 2. Enhanced Button Click Handler

**File**: `extension/src/content/ui-injector.ts`

- Updated `handleGenerateButtonClick()` to handle popup opening response
- Added fallback notification system when auto-open fails
- Implemented `showNotification()` function that displays a styled notification on the page telling users to click the extension icon

### 3. Improved Popup Message Loading

**File**: `extension/src/popup/pages/Generator.tsx`

- Updated `loadBuyerMessage()` to prioritize stored pending messages
- Checks Chrome Storage for `pendingMessage` first (with 5-minute expiry)
- Falls back to extracting message from current page if no stored message
- Automatically clears pending message after loading

### 4. Updated Message Types

**File**: `extension/src/shared/messaging/messages.ts`

- Added `OPEN_POPUP` to `MessageToBackground` type
- Added `POPUP_OPENED` to `MessageToPopup` type

## User Flow (Current)

### Best Case (Auto-Open Works):

1. User clicks "✨ Generate Reply with ProdSync" button on Etsy page
2. Message is extracted and stored in Chrome Storage
3. Popup opens automatically
4. Popup loads stored message
5. User generates and inserts reply

### Most Common Case (Auto-Open Fails):

1. User clicks "✨ Generate Reply with ProdSync" button on Etsy page
2. Message is extracted and stored in Chrome Storage
3. Auto-open fails (MV3 limitation)
4. **Styled notification appears:** "✨ Message captured! Click the ProdSync extension icon to generate your reply."
5. User clicks extension icon
6. Popup opens and automatically loads stored message
7. User generates and inserts reply

## Testing Instructions

### 1. Reload Extension

```bash
# In Chrome
# 1. Go to chrome://extensions
# 2. Find ProdSync extension
# 3. Click the refresh icon
```

### 2. Test the Flow

1. Navigate to https://www.etsy.com/messages (requires Etsy seller account with messages)
2. Open DevTools (F12) to monitor console logs
3. Look for the "✨ Generate Reply with ProdSync" button near the message textarea
4. Click the button
5. **Check for notification**: A purple gradient notification should appear in the top-right corner if auto-open fails
6. Click the ProdSync extension icon in Chrome toolbar
7. Popup should open with the buyer message already loaded
8. Generate a reply and test inserting it back into the textarea

### Expected Console Logs

**Etsy Page (Content Script):**

```
[ProdSync] Generate button clicked
[ProdSync] Message stored, opening popup
[ProdSync] Auto-open failed, prompting user to click extension icon
```

**Extension Service Worker:**

```
[ProdSync] Background received message: OPEN_POPUP
[ProdSync] Attempting to open popup...
[ProdSync] chrome.action.openPopup not available
```

OR

```
[ProdSync] Error opening popup: [error message]
```

**Popup:**

```
[ProdSync Popup] Using stored pending message
[ProdSync Popup] Buyer message loaded successfully
```

## Notification Feature Details

The notification system provides excellent UX when auto-open fails:

- **Styled Notification**: Purple gradient box matching ProdSync brand colors
- **Clear Instructions**: Tells user exactly what to do next
- **Auto-Dismissal**: Disappears after 5 seconds with smooth animation
- **Non-Intrusive**: Fixed position in top-right, doesn't block page content
- **Professional Appearance**: Matches extension button styling

## Benefits

1. **Graceful Degradation**: Works whether auto-open succeeds or fails
2. **Clear User Guidance**: Users always know what to do next
3. **Preserved Message**: Message is stored for 5 minutes, so user doesn't lose it
4. **Automatic Cleanup**: Expired messages are automatically cleared
5. **Better UX**: Notification is more helpful than a silent failure

## Files Modified

- `extension/src/background/index.ts`
- `extension/src/content/ui-injector.ts`
- `extension/src/popup/pages/Generator.tsx`
- `extension/src/shared/messaging/messages.ts`

## Build Status

✅ Extension rebuilt successfully (February 2026)
✅ All TypeScript type checks passed
✅ Vite production build completed
✅ Ready for testing

## Next Steps

1. Test the complete flow on actual Etsy message pages
2. Verify Etsy DOM selectors are correct (see [extension/src/content/etsy-selectors.ts](./src/content/etsy-selectors.ts))
3. Update selectors if Etsy's HTML structure has changed
4. Test notification appearance and timing
5. Verify message storage and expiry logic
6. Test reply generation and insertion

## Chrome MV3 Reference

Why `chrome.action.openPopup()` often fails:

- User gesture context is lost when message passes through service worker
- Chrome enforces strict user action requirements for popup opening
- Notification + manual click is the most reliable MV3 pattern
- More info: https://developer.chrome.com/docs/extensions/reference/api/action#method-openPopup
