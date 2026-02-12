# ⚠️ IMPORTANT: Read Before Sharing Extension

## 🔧 Required Setup (Do This First!)

### 1. Configure Extension Environment

Create `extension/.env` file with these values:

```env
# Firebase Configuration (same as main app)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend URL - CRITICAL!
VITE_BACKEND_URL=https://your-prodsync-app.vercel.app
```

**Copy Firebase values from your main app's `.env.local` file!**

---

### 2. Deploy Backend First

Your friend's extension needs to connect to your backend. Make sure:

✅ Main ProdSync app is deployed (Vercel/Netlify)
✅ CORS is enabled for chrome-extension:// origins
✅ Backend URL in extension/.env matches deployed URL
✅ Firebase authorized domains includes your deployed domain

---

### 3. Test Extension Locally

Before sharing:

```bash
cd extension
npm run build
```

Then:

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder
5. Test on https://www.etsy.com/messages
6. Verify:
   - ✅ Login works
   - ✅ Button appears on Etsy
   - ✅ Reply generation works
   - ✅ Reply insertion works

---

### 4. Critical: Etsy DOM Selectors

⚠️ **The extension uses hypothetical Etsy selectors!**

Before sharing, you MUST:

1. Visit https://www.etsy.com/messages (need Etsy seller account)
2. Open DevTools (F12) → Elements tab
3. Inspect the message textarea and buyer message elements
4. Update selectors in `extension/src/content/etsy-selectors.ts`
5. Rebuild: `npm run build`
6. Test again

If selectors are wrong, the button won't appear or messages won't extract!

---

## 📦 Ready to Package?

Once everything above is complete:

1. Run `package-extension.bat` (Windows)
2. ZIP the `ProdSync-Extension-Package` folder
3. Send ZIP + tell your friend to follow `INSTALLATION_INSTRUCTIONS.md`

---

## 🚨 Common Issues

**Issue: "Backend URL not configured"**

- Fix: Set `VITE_BACKEND_URL` in extension/.env

**Issue: "CORS error"**

- Fix: Add chrome-extension:// to CORS allowed origins in backend

**Issue: "Button doesn't appear on Etsy"**

- Fix: Update selectors in `etsy-selectors.ts`

**Issue: "Login fails"**

- Fix: Check Firebase config matches main app

**Issue: "API key validation fails"**

- Fix: Backend must be deployed and accessible

---

## 📝 Checklist Before Sharing

- [ ] Extension `.env` file configured with correct values
- [ ] Backend deployed and URL added to `.env`
- [ ] CORS enabled in backend for chrome-extension://
- [ ] Etsy DOM selectors verified and updated
- [ ] Extension tested locally end-to-end
- [ ] All features work (login, button, generation, insertion)
- [ ] Friend has Etsy seller account (required to test)
- [ ] Installation instructions ready

---

## 💡 Tell Your Friend

Your friend needs:

- ✅ Google Chrome browser
- ✅ Etsy seller account (to access message pages)
- ✅ ProdSync web app account (same login for extension)
- ✅ API keys configured in ProdSync web app Settings

Without these, the extension won't work!
