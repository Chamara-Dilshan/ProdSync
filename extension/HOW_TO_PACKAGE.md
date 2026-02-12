# 📦 How to Package Extension for Your Friend

## Quick Method (Windows)

1. **Double-click** `package-extension.bat`
2. Wait for it to finish
3. Find the folder: `ProdSync-Extension-Package` (one level up)
4. **Right-click** the folder → "Send to" → "Compressed (zipped) folder"
5. Send the ZIP file to your friend

That's it! 🎉

---

## What Gets Packaged

Your friend will receive:

- ✅ `dist/` folder - The built extension
- ✅ `INSTALLATION_INSTRUCTIONS.md` - Step-by-step guide

---

## Manual Method (if script doesn't work)

1. Open terminal in `extension` folder:

   ```bash
   npm run build
   ```

2. Create a new folder called `ProdSync-Extension-Package`

3. Copy these files:
   - `extension/dist/` → into the package folder
   - `extension/INSTALLATION_FOR_FRIENDS.md` → into the package folder (rename to `INSTALLATION_INSTRUCTIONS.md`)

4. ZIP the `ProdSync-Extension-Package` folder

5. Send ZIP to your friend

---

## Environment Variables (IMPORTANT!)

Before packaging, make sure `extension/.env` has the correct backend URL:

```env
VITE_BACKEND_URL=https://your-deployed-app.vercel.app
```

Or if testing locally:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Your friend's extension will connect to this URL!

---

## Testing Before Sharing

1. Build the extension: `npm run build`
2. Load `extension/dist` in Chrome (chrome://extensions)
3. Test on Etsy message page
4. Verify everything works
5. Then package and share

---

## Updating the Extension

When you make changes:

1. Run `package-extension.bat` again
2. Send the new ZIP to your friend
3. They extract and reload in chrome://extensions

---

## Need Help?

If something doesn't work, check:

- [ ] Extension builds without errors (`npm run build`)
- [ ] `.env` file has correct backend URL
- [ ] Backend is deployed and CORS is enabled
- [ ] Firebase config is correct
