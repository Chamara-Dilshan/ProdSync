# ProdSync - Quick Start Guide

## Prerequisites

Before running the project, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** (for version control)
- **Firebase account** (for authentication and database)
- **Chrome browser** (for extension development)

---

## Part 1: Main ProdSync App (Next.js)

### 1. Install Dependencies

```bash
# Navigate to project root
cd d:\Projects\ProdSync

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local with your Firebase credentials
# Use your preferred text editor
notepad .env.local
```

Add your Firebase configuration:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Where to find Firebase credentials:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Go to Project Settings (gear icon) → General
4. Scroll to "Your apps" → Web app → SDK setup and configuration
5. Copy the config values

### 3. Set Up Firebase (CRITICAL)

**Enable Authentication:**

1. Firebase Console → Authentication → Get Started
2. Enable "Email/Password" sign-in method
3. Enable "Google" sign-in (optional)

**Create Firestore Database:**

1. Firebase Console → Firestore Database → Create database
2. Choose "Start in test mode" (for development)
3. Select a location (e.g., us-central)

**Configure Security Rules:**

1. Go to Firestore Database → Rules
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

**Add Authorized Domain:**

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `localhost` (should be there by default)

### 4. Run Development Server

```bash
# Start the Next.js dev server
npm run dev
```

The app will be available at: **http://localhost:3000**

### 5. First Time Setup

1. Visit http://localhost:3000
2. Click "Sign Up" and create an account
3. Sign in with your new account
4. You'll be redirected to the dashboard

**Optional: Add Test Data**

- Go to Settings → Configure your AI API keys (OpenAI, Gemini, or Anthropic)
- Go to Products → Add some test products
- Go to Policies → Add shop policies

---

## Part 2: Browser Extension

### 1. Install Extension Dependencies

```bash
# Navigate to extension directory
cd d:\Projects\ProdSync\extension

# Install dependencies
npm install
```

### 2. Configure Extension Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env
notepad .env
```

Add configuration:

```env
# Backend URL (where main ProdSync app is running)
VITE_BACKEND_URL=http://localhost:3000

# Firebase credentials (same as main app)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** Use the **same Firebase credentials** as the main app.

### 3. Build the Extension

```bash
# Development build with hot reload
npm run dev

# OR production build
npm run build
```

The extension will be built to the `dist/` folder.

### 4. Load Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `d:\Projects\ProdSync\extension\dist\` folder
6. Extension should appear in your extensions list

### 5. Test the Extension

**Test Authentication:**

1. Click the ProdSync extension icon in Chrome toolbar
2. Sign in with the same account you created in the main app
3. You should see the "Generator" page

**Test on Etsy (requires Etsy seller account):**

1. Visit https://www.etsy.com/messages
2. Open a buyer conversation
3. Look for the "✨ Generate Reply with ProdSync" button near the message textarea
4. Click the button to test reply generation

---

## Project Structure

```
ProdSync/
├── app/                    # Next.js app (main application)
│   ├── (auth)/            # Login/signup pages
│   ├── (dashboard)/       # Dashboard pages (protected)
│   └── api/               # API routes
├── extension/             # Chrome extension
│   ├── src/
│   │   ├── background/   # Background service worker
│   │   ├── content/      # Content scripts (Etsy integration)
│   │   ├── popup/        # Extension popup UI
│   │   └── shared/       # Shared utilities
│   └── dist/             # Built extension (after npm run build)
├── components/            # React components
├── lib/                   # Utilities and libraries
└── types/                 # TypeScript type definitions
```

---

## Common Commands

### Main App

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types (if configured)

# Storybook (component documentation)
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build Storybook for production
```

### Extension

```bash
cd extension

npm run dev              # Development build with hot reload
npm run build            # Production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint checking
```

---

## Development Workflow

### Working on Main App

1. Start dev server: `npm run dev`
2. Make changes to files in `app/`, `components/`, or `lib/`
3. Changes auto-reload in browser
4. Test your changes at http://localhost:3000

### Working on Extension

1. Start dev build: `cd extension && npm run dev`
2. Make changes to files in `extension/src/`
3. For popup changes: Auto-reloads
4. For background/content script changes:
   - Go to `chrome://extensions`
   - Click the refresh icon on ProdSync extension
   - Reload the Etsy page you're testing on

---

## Troubleshooting

### Main App Issues

**Error: "Permission denied" when loading data**

- Check Firebase Security Rules are published
- Ensure you're signed in with a valid account
- Check browser console for specific Firebase errors

**Error: "Firebase not initialized"**

- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are in `.env.local`
- Restart dev server after changing environment variables
- Check Firebase credentials are correct

**Port 3000 already in use**

```bash
# Use a different port
npm run dev -- -p 3001
```

### Extension Issues

**Extension doesn't load in Chrome**

- Check for errors in `chrome://extensions`
- Ensure you're loading the `dist/` folder, not the `src/` folder
- Try rebuilding: `npm run build`

**"Generate Reply" button doesn't appear on Etsy**

- Check browser console (F12) on Etsy page for errors
- Verify you're on https://www.etsy.com/messages
- Content script may need selector updates (see extension/TESTING_CHECKLIST.md)

**CORS errors when generating replies**

- Ensure main app is running at http://localhost:3000
- Check `VITE_BACKEND_URL` in extension/.env is correct
- Verify middleware.ts is present in main app root

**Authentication fails in extension**

- Use the same Firebase credentials in both apps
- Ensure you've created an account in the main app first
- Clear extension storage: chrome://extensions → ProdSync → Clear storage

---

## Testing

### Test Main App

1. Sign up and sign in
2. Add products (Products page)
3. Add policies (Policies page)
4. Configure API keys (Settings page)
5. Generate a test reply (Messages page)

### Test Extension

Follow [extension/TESTING_CHECKLIST.md](extension/TESTING_CHECKLIST.md) for comprehensive testing.

**Quick Test:**

1. Load extension in Chrome
2. Click extension icon → Sign in
3. Visit Etsy messages page (requires Etsy seller account)
4. Click "Generate Reply" button
5. Verify popup opens and reply generates

---

## Environment Variables Reference

### Main App (.env.local)

| Variable                                   | Description                  | Required |
| ------------------------------------------ | ---------------------------- | -------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API key             | ✅ Yes   |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         | ✅ Yes   |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID          | ✅ Yes   |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      | ✅ Yes   |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ Yes   |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID              | ✅ Yes   |

### Extension (.env)

| Variable                            | Description      | Required |
| ----------------------------------- | ---------------- | -------- |
| `VITE_BACKEND_URL`                  | Main app URL     | ✅ Yes   |
| `VITE_FIREBASE_API_KEY`             | Same as main app | ✅ Yes   |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Same as main app | ✅ Yes   |
| `VITE_FIREBASE_PROJECT_ID`          | Same as main app | ✅ Yes   |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Same as main app | ✅ Yes   |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same as main app | ✅ Yes   |
| `VITE_FIREBASE_APP_ID`              | Same as main app | ✅ Yes   |

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Set up Firebase
4. ✅ Run main app
5. ✅ Run extension
6. 📖 Read [CLAUDE.md](CLAUDE.md) for detailed documentation
7. 🧪 Complete [extension/TESTING_CHECKLIST.md](extension/TESTING_CHECKLIST.md)
8. 🚀 Follow [extension/DEPLOYMENT_GUIDE.md](extension/DEPLOYMENT_GUIDE.md) for production deployment

---

## Support

- **Documentation**: [CLAUDE.md](CLAUDE.md)
- **Extension Guide**: [extension/README.md](extension/README.md)
- **Issues**: Check browser console and terminal for error messages
- **Firebase Errors**: See "Troubleshooting Firebase Errors" section in CLAUDE.md

---

**Happy coding! 🚀**
