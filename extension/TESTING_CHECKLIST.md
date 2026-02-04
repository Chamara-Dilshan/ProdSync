# ProdSync Extension - Manual Testing Checklist

## Pre-Testing Setup

- [ ] Main ProdSync app is deployed and accessible
- [ ] Backend URL is configured in `extension/.env`
- [ ] Extension is built: `cd extension && npm run build`
- [ ] Extension is loaded in Chrome: chrome://extensions → Load unpacked → select `extension/dist/`
- [ ] Test user account created with API keys configured
- [ ] Test products and policies added in main app

## Phase 1.1: Authentication Testing

### Initial Authentication

- [ ] Click extension icon, popup opens successfully
- [ ] Login form displays correctly
- [ ] Email/password login works
- [ ] Google sign-in works (if enabled)
- [ ] Invalid credentials show error message
- [ ] Successful login shows Generator page
- [ ] Auth token is stored in chrome.storage.local

### Token Persistence

- [ ] Close popup and reopen - should stay logged in
- [ ] Refresh Etsy page - auth state persists
- [ ] Restart Chrome browser - auth state persists
- [ ] Token auto-refreshes before 5-min expiry (check logs)

### Sign Out

- [ ] Sign out button works from Generator page
- [ ] Auth token is cleared from storage
- [ ] Popup returns to login screen
- [ ] No lingering user data in chrome.storage

## Phase 1.2: Content Script Testing

### Page Detection

- [ ] Visit https://www.etsy.com/messages
- [ ] Open DevTools Console (F12)
- [ ] Verify log: `[ProdSync] Etsy message page detected`
- [ ] Verify log: `[ProdSync] Content script loaded`
- [ ] Verify log: `[ProdSync] Initializing content script`

### Button Injection

- [ ] "✨ Generate Reply with ProdSync" button appears
- [ ] Button is positioned near message textarea
- [ ] Button has gradient styling (purple to pink)
- [ ] Button shows hover effect
- [ ] Button is not duplicated on page
- [ ] Button persists after SPA navigation (click different conversations)

### Button Placement Issues

If button doesn't appear:

- [ ] Check Console for selector errors
- [ ] Inspect Etsy page and verify selectors in `etsy-selectors.ts`
- [ ] Update selectors if Etsy HTML changed
- [ ] Rebuild extension and reload

### Message Extraction

- [ ] Open a conversation with buyer messages
- [ ] Click "Generate Reply" button
- [ ] Popup opens automatically
- [ ] Buyer message is displayed in popup
- [ ] Message text is clean (no extra whitespace/HTML)
- [ ] Multiple messages: extracts the most recent

### Edge Cases

- [ ] Empty conversation - shows appropriate error
- [ ] Very long message (1000+ chars) - extracts fully
- [ ] Message with special characters/emojis - preserves them
- [ ] Multiple tabs with Etsy messages - button works in all

## Phase 1.3: Reply Generation Testing

### Data Loading

- [ ] Popup loads user settings from Firestore
- [ ] Product list is populated from Firestore
- [ ] Tone selector shows 4 options
- [ ] Settings are cached (check background worker logs)

### Reply Generation Flow

- [ ] Select tone (professional, friendly, formal, casual)
- [ ] Select relevant products (optional)
- [ ] Click "Generate Reply" button
- [ ] Loading state displays: "Generating reply..."
- [ ] Generate button is disabled during generation
- [ ] Reply appears in preview section within 5-10 seconds
- [ ] Reply is relevant to buyer message
- [ ] Reply includes selected product details (if products selected)

### Copy to Clipboard

- [ ] Click "Copy" button
- [ ] Success message shows
- [ ] Paste (Ctrl+V) in any text field
- [ ] Copied text matches generated reply exactly

### Insert into Etsy

- [ ] Generated reply is displayed in preview
- [ ] Click "Insert into Etsy" button
- [ ] Popup closes automatically
- [ ] Reply appears in Etsy message textarea
- [ ] Reply text is editable in textarea
- [ ] Can send reply using Etsy's send button
- [ ] Reply doesn't duplicate if inserted twice

## Error Handling Testing

### Missing API Keys

- [ ] Remove API keys from Settings in main app
- [ ] Try generating reply
- [ ] Error shows: "Please configure your API keys in the main ProdSync app"
- [ ] Error includes link to settings page

### Invalid API Key

- [ ] Enter invalid API key in Settings
- [ ] Try generating reply
- [ ] Error shows: "Authentication failed: Invalid API key"
- [ ] Error message suggests checking Settings

### Rate Limiting

- [ ] Make 10+ rapid requests (free tier limit)
- [ ] Error shows: "Rate limit exceeded"
- [ ] Error suggests waiting 1-2 minutes
- [ ] After waiting, generation works again

### Network Failures

- [ ] Disconnect internet
- [ ] Try generating reply
- [ ] Error shows: "Network error" or "Failed to fetch"
- [ ] Reconnect internet
- [ ] Generation works again

### Unauthorized (401/403)

- [ ] Sign out from main app (invalidate token)
- [ ] Try generating reply in extension
- [ ] Error shows: "Authentication failed"
- [ ] Redirects to login or shows re-login prompt

### Service Unavailable (500+)

- [ ] Simulate backend error (if possible)
- [ ] Error shows: "Service temporarily unavailable"
- [ ] Retry option is available

## Cross-Browser Testing (Chrome Only for Now)

### Chrome Versions

- [ ] Test on Chrome Stable (latest)
- [ ] Test on Chrome Beta (if available)
- [ ] Test on Chromium

### Screen Sizes

- [ ] Test popup on 1920x1080 resolution
- [ ] Test popup on 1366x768 resolution
- [ ] Test popup on 1280x720 resolution
- [ ] Popup is readable on all sizes (min 320px width)

## Performance Testing

### Load Times

- [ ] Popup opens in < 500ms
- [ ] Reply generation completes in < 10 seconds
- [ ] Button injection occurs in < 2 seconds after page load
- [ ] No noticeable lag when using Etsy page

### Memory Usage

- [ ] Open chrome://extensions → ProdSync → Inspect background worker
- [ ] Check memory usage in DevTools Performance tab
- [ ] Memory usage stays under 100MB
- [ ] No memory leaks after 10+ reply generations

### Cache Performance

- [ ] First data load fetches from Firestore (check network)
- [ ] Second load within 1 hour uses cache (no Firestore calls)
- [ ] Cache expires after 1 hour, re-fetches data

## Security Testing

### Token Security

- [ ] Auth token is not logged to console
- [ ] Token is not exposed in chrome.storage.sync (should be in .local)
- [ ] Token is cleared on sign out
- [ ] Token refresh uses secure HTTPS

### Data Privacy

- [ ] Buyer messages are not stored permanently
- [ ] Generated replies are not logged to external services
- [ ] API keys are stored securely in Firestore (not in extension)
- [ ] No sensitive data in extension localStorage

### Content Security

- [ ] Extension only runs on Etsy message pages
- [ ] No external script injection
- [ ] No eval() or unsafe innerHTML usage
- [ ] CSP headers are respected

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through popup form fields
- [ ] Enter key submits forms
- [ ] Esc key closes popup
- [ ] All interactive elements are focusable

### Screen Reader

- [ ] Test with NVDA or JAWS (if available)
- [ ] All buttons have descriptive labels
- [ ] Form fields have proper labels
- [ ] Error messages are announced

### Visual

- [ ] Text is readable with sufficient contrast
- [ ] No text smaller than 12px
- [ ] Icons have text alternatives
- [ ] Focus indicators are visible

## Edge Cases & Stress Testing

### Data Edge Cases

- [ ] User has 0 products - generation still works
- [ ] User has 100+ products - selector is usable
- [ ] User has no policies - generation works without them
- [ ] Product names with special characters render correctly

### Concurrent Usage

- [ ] Open 5+ Etsy message tabs
- [ ] Generate reply in multiple tabs simultaneously
- [ ] No race conditions or data conflicts
- [ ] Each tab maintains independent state

### Long Sessions

- [ ] Keep extension open for 2+ hours
- [ ] Token refreshes automatically
- [ ] Cache invalidates after 1 hour
- [ ] No performance degradation

### Rapid Actions

- [ ] Click "Generate Reply" button 10 times rapidly
- [ ] Only one request is sent (button disabled)
- [ ] No duplicate replies generated

## Final Pre-Submission Checks

### Build & Assets

- [ ] Production build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No ESLint warnings: `npm run lint`
- [ ] All icons present: 16x16, 48x48, 128x128 in `public/icons/`
- [ ] manifest.json has correct version number
- [ ] manifest.json has all required fields

### Documentation

- [ ] README.md is up to date
- [ ] Privacy policy document created
- [ ] Screenshots captured for Web Store listing

### Backend Configuration

- [ ] CORS allows chrome-extension:// origins
- [ ] All API endpoints are accessible
- [ ] Rate limiting is configured
- [ ] Error responses are user-friendly

## Test Results Summary

**Date Tested:** **\*\***\_\_\_**\*\***
**Tested By:** **\*\***\_\_\_**\*\***
**Chrome Version:** **\*\***\_\_\_**\*\***

**Total Tests:** **\_** / **\_**
**Passed:** **\_**
**Failed:** **\_**
**Blocked:** **\_**

## **Critical Issues Found:**

## **Non-Critical Issues:**

**Ready for Chrome Web Store Submission:** [ ] Yes [ ] No

**Notes:**
