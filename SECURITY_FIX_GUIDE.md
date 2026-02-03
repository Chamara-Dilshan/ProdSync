# 🚨 CRITICAL: Security Fix Required

**Date**: February 3, 2026
**Issue**: Exposed Google Cloud API Key in GitHub Repository

---

## What Happened

Your Firebase/Google Cloud API key was accidentally committed to your GitHub repository in the file `extension/DEBUG_POPUP.md`. GitHub's secret scanning detected this and sent you an alert.

**Exposed API Key**: `AIzaSyBHDs0yrOEB7mFTE6qspr_jxVBL9KbOfeg`

**⚠️ IMPORTANT**: Even though we've deleted the file, the key is still in your git history and may still be exposed. Anyone with read access to your repository could have seen it.

---

## ✅ What We've Already Done

1. **Deleted sensitive files**:
   - ✅ `extension/DEBUG_POPUP.md` (contained the exposed API key)
   - ✅ `extension/DEBUG_SELECTORS.md` (debug file)
   - ✅ `extension/TESTING-GUIDE.md` (outdated duplicate)
   - ✅ `extension/BUILD_VERIFICATION_REPORT.md` (temporary build report)
   - ✅ `extension/DOCUMENTATION_UPDATES.md` (temporary documentation)

2. **Updated `.gitignore`**:
   - ✅ Added patterns to prevent future debug file commits:
     ```
     DEBUG_*.md
     *_VERIFICATION_REPORT.md
     *_UPDATES.md
     ```

---

## 🔴 IMMEDIATE ACTION REQUIRED: Revoke the Exposed API Key

### Step 1: Go to Google Cloud Console

1. Visit: https://console.firebase.google.com/project/prodsync-872b1/settings/general
2. Sign in with your Google account
3. Click on **"Settings"** (gear icon) → **"Project settings"**
4. Click on **"Service accounts"** tab in the left sidebar

### Step 2: Revoke the Exposed Key

**Option A: Delete the entire Firebase Web App (Recommended)**

1. Go to: https://console.firebase.google.com/project/prodsync-872b1/settings/general
2. Scroll down to **"Your apps"** section
3. Find the web app with the exposed API key
4. Click the **three dots (⋮)** → **"Delete app"**
5. Confirm deletion
6. Create a new web app and get new credentials

**Option B: Restrict the API Key (Quick Fix)**

1. Go to: https://console.cloud.google.com/apis/credentials?project=prodsync-872b1
2. Find the API key: `AIzaSyBHDs0yrOEB7mFTE6qspr_jxVBL9KbOfeg`
3. Click on it to edit
4. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add your allowed domains:
     - `https://your-domain.vercel.app/*`
     - `http://localhost:3000/*` (for development)
5. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Enable only the Firebase APIs you need:
     - Firebase Authentication API
     - Cloud Firestore API
6. Click **"Save"**

**⚠️ Important**: Restricting the key is less secure than creating a new one. If the key was public for any significant time, it's best to delete and recreate.

### Step 3: Get New Firebase Credentials

If you deleted the app (Option A):

1. Go to: https://console.firebase.google.com/project/prodsync-872b1/settings/general
2. Click **"Add app"** → **"Web"** (</> icon)
3. Give it a nickname: "ProdSync Web App"
4. Check **"Also set up Firebase Hosting"** (optional)
5. Click **"Register app"**
6. Copy the new config:
   ```javascript
   const firebaseConfig = {
     apiKey: "NEW_API_KEY_HERE",
     authDomain: "prodsync-872b1.firebaseapp.com",
     projectId: "prodsync-872b1",
     storageBucket: "prodsync-872b1.appspot.com",
     messagingSenderId: "NEW_SENDER_ID_HERE",
     appId: "NEW_APP_ID_HERE",
   }
   ```

### Step 4: Update Your Local Environment Files

Update both main app and extension `.env` files:

**Main app** (`.env.local`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=NEW_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prodsync-872b1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prodsync-872b1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prodsync-872b1.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=NEW_SENDER_ID_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=NEW_APP_ID_HERE
```

**Extension** (`extension/.env`):

```env
VITE_FIREBASE_PROJECT_ID=prodsync-872b1
VITE_FIREBASE_API_KEY=NEW_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=prodsync-872b1.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=prodsync-872b1.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=NEW_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=NEW_APP_ID_HERE
VITE_BACKEND_URL=http://localhost:3000
```

### Step 5: Update Vercel (Production)

If you've deployed to Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your ProdSync project
3. Click **"Settings"** → **"Environment Variables"**
4. Update all `NEXT_PUBLIC_FIREBASE_*` variables with new values
5. Click **"Save"**
6. Redeploy: Go to **"Deployments"** → Click **"..."** on latest → **"Redeploy"**

---

## 🧹 Clean Git History (Remove Exposed Key)

**⚠️ WARNING**: These commands rewrite git history. If you're collaborating with others, coordinate with them first.

### Option 1: Remove the Specific Commit (Recommended)

```bash
# Check the commit history
git log --oneline | grep -i "debug\|popup\|extension"

# Use git filter-repo to remove the file from history
# Install git-filter-repo first: pip install git-filter-repo
git filter-repo --invert-paths --path extension/DEBUG_POPUP.md --force

# Force push to remote (⚠️ DANGEROUS - only if you're the sole contributor)
git push origin --force --all
```

### Option 2: Use BFG Repo-Cleaner (Easier)

```bash
# Install BFG (https://rtyley.github.io/bfg-repo-cleaner/)
# Download bfg.jar

# Remove the file from history
java -jar bfg.jar --delete-files DEBUG_POPUP.md

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

### Option 3: GitHub-Specific Cleanup

If the above seems complex, you can also:

1. Delete the repository on GitHub
2. Create a new repository with a fresh start
3. Push only the latest cleaned code

---

## ✅ Verify the Fix

After completing all steps:

1. **Check GitHub**: Visit your repository and search for the API key:
   - Go to: https://github.com/Chamara-Dilshan/ProdSync
   - Use GitHub's search: Press `/` and search for `AIzaSyBHDs0yr`
   - Should return "No results"

2. **Check Google Cloud Console**:
   - Verify old key is deleted or restricted
   - Verify new key is active and working

3. **Test your app**:

   ```bash
   # Test main app
   npm run dev
   # Visit http://localhost:3000 and try signing in

   # Test extension
   cd extension
   npm run dev
   # Load extension and test authentication
   ```

4. **Resolve GitHub Alert**:
   - Go to: https://github.com/Chamara-Dilshan/ProdSync/security
   - You should see the secret scanning alert
   - After revoking the key, click **"Dismiss"** → **"Revoked"**

---

## 🛡️ Best Practices Going Forward

1. **Never commit `.env` files**:
   - ✅ Already in `.gitignore`
   - Always use `.env.example` as a template without real values

2. **Never hardcode credentials in documentation**:
   - Use placeholders: `YOUR_API_KEY_HERE`
   - Never copy real values from `.env` files

3. **Use environment-specific configs**:
   - Development: Use test/demo keys if possible
   - Production: Use restricted keys with domain restrictions

4. **Enable GitHub Secret Scanning**:
   - ✅ Already enabled (that's how you got the alert)
   - Keep it enabled for future protection

5. **Regular security audits**:
   ```bash
   # Search for potential secrets in your codebase
   git log --all --full-history --source --stat -- '*.env*'
   ```

---

## 📝 Checklist

**Immediate Actions** (Do today):

- [ ] Revoke or restrict the exposed API key in Google Cloud Console
- [ ] Create new Firebase web app credentials (if deleted old one)
- [ ] Update `.env.local` with new credentials
- [ ] Update `extension/.env` with new credentials
- [ ] Update Vercel environment variables
- [ ] Test authentication in both main app and extension
- [ ] Dismiss GitHub security alert as "Revoked"

**Optional but Recommended**:

- [ ] Clean git history using one of the methods above
- [ ] Force push cleaned history to GitHub
- [ ] Verify old key is completely removed from GitHub

**Completed**:

- [x] Deleted sensitive files locally
- [x] Updated `.gitignore` to prevent future commits
- [x] Committed changes to prevent future issues

---

## 🆘 Need Help?

**Google Cloud Console**: https://console.cloud.google.com/apis/credentials?project=prodsync-872b1

**Firebase Console**: https://console.firebase.google.com/project/prodsync-872b1

**GitHub Security**: https://github.com/Chamara-Dilshan/ProdSync/security

**Git History Cleanup Tools**:

- git-filter-repo: https://github.com/newren/git-filter-repo
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

---

**Remember**: The most important step is **revoking the exposed API key**. Everything else can be done gradually, but the key must be secured immediately.
