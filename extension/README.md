# ProdSync Browser Extension

AI-powered reply generation for Etsy shop owners. Generate professional, policy-compliant responses directly from your Etsy inbox.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the extension directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials (same as main app) and backend URL:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_BACKEND_URL=https://your-prodsync-app.vercel.app
```

## Development

### Start Development Server

```bash
npm run dev
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` directory
5. The extension should now appear in your browser

### Hot Reload

Vite provides hot module replacement (HMR). Changes to popup UI will reload automatically. Changes to background or content scripts require extension reload.

## Build for Production

```bash
npm run build
```

This creates an optimized build in `extension/dist/` ready for Chrome Web Store submission.

## Project Structure

```
extension/
├── public/
│   ├── manifest.json          # Chrome Manifest V3
│   └── icons/                 # Extension icons
├── src/
│   ├── background/            # Background service worker
│   ├── content/               # Content scripts (Etsy integration)
│   ├── popup/                 # React popup UI
│   ├── shared/                # Shared utilities
│   │   ├── firebase/          # Firebase auth
│   │   ├── storage/           # Chrome Storage wrappers
│   │   ├── messaging/         # Cross-context messaging
│   │   └── utils/             # Utilities
│   └── components/ui/         # UI components
└── dist/                      # Build output (created on build)
```

## Implementation Status

### Phase 1: Foundation ✅ (Completed)

- ✅ Vite + React + TypeScript setup
- ✅ Chrome Manifest V3 configured
- ✅ Chrome Storage wrappers
- ✅ Firebase authentication
- ✅ Basic popup UI with login
- ✅ Token storage

### Phase 2: Content Script (In Progress)

- ⏳ Etsy page detection
- ⏳ DOM manipulation (button injection)
- ⏳ Message extraction

### Phase 3: API Integration (Pending)

- ⏳ Background service worker API client
- ⏳ Token refresh mechanism
- ⏳ Data caching (products, policies, settings)

### Phase 4: UI Polish (Pending)

- ⏳ Full reply generation UI
- ⏳ Product/tone selectors
- ⏳ Reply preview and insertion

### Phase 5: Testing (Pending)

- ⏳ Unit tests
- ⏳ Integration tests
- ⏳ Manual testing checklist

### Phase 6: Deployment (Pending)

- ⏳ Chrome Web Store submission
- ⏳ Privacy policy
- ⏳ Store listing assets

## Testing Authentication

1. Start the dev server: `npm run dev`
2. Load the extension in Chrome
3. Click the extension icon to open popup
4. Sign in with your ProdSync credentials
5. Verify token persists after closing and reopening popup
6. Test sign out clears auth data

## Troubleshooting

### Extension not loading

- Check console for errors in `chrome://extensions/`
- Verify `.env` file exists with correct Firebase credentials
- Try rebuilding: `npm run build`

### Authentication fails

- Verify Firebase credentials match main app
- Check Firebase Console for authentication errors
- Ensure Firebase Auth domain includes Chrome extension in authorized domains

### Hot reload not working

- Reload extension manually in `chrome://extensions/`
- Check Vite dev server is running
- Clear Chrome extension cache

## Next Steps

See the main plan at `C:\Users\chama\.claude\plans\rustling-imagining-crayon.md` for detailed implementation roadmap.
