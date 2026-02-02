# ProdSync - Claude Code Guide

## Project Overview

ProdSync is an AI-powered message assistant for Etsy shop owners. It helps generate professional, policy-compliant responses to buyer messages using multiple AI providers.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password + Google)
- **AI Providers**: OpenAI, Google Gemini, Anthropic Claude
- **File Parsing**: xlsx library for Excel imports

## Project Structure

```
ProdSync/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Dashboard route group (protected)
│   │   ├── layout.tsx     # Dashboard layout with auth guard
│   │   └── dashboard/     # Dashboard routes (maps to /dashboard/*)
│   │       ├── page.tsx           # Main dashboard → /dashboard
│   │       ├── products/page.tsx  # Product management → /dashboard/products
│   │       ├── policies/page.tsx  # Policy management → /dashboard/policies
│   │       ├── messages/page.tsx  # AI reply generator → /dashboard/messages
│   │       └── settings/page.tsx  # API keys & preferences → /dashboard/settings
│   └── api/               # API routes
│       └── ai/            # AI generation endpoints
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth forms
│   ├── dashboard/         # Dashboard components
│   ├── products/          # Product components
│   ├── policies/          # Policy components
│   ├── messages/          # Message/reply components
│   └── settings/          # Settings components
├── lib/
│   ├── firebase/          # Firebase config & helpers
│   ├── ai/                # AI provider integrations
│   │   └── providers/     # OpenAI, Gemini, Anthropic
│   ├── context/           # React contexts
│   └── utils/             # Utility functions
└── types/                 # TypeScript type definitions
```

## Key Commands

```bash
npm install           # Install dependencies
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run storybook     # Start Storybook dev server
npm run build-storybook  # Build Storybook for production
```

## Development Tools

### Code Quality & Formatting

- **ESLint**: Strict TypeScript rules for type safety and code quality
  - Configuration: [.eslintrc.json](.eslintrc.json)
  - Includes Next.js, TypeScript, and Prettier integration
  - Enforces explicit return types, no-any, strict boolean expressions, and more

- **Prettier**: Consistent code formatting across the project
  - Configuration: [.prettierrc.json](.prettierrc.json)
  - Auto-formats on save with IDE integration
  - Run `npm run format` to format all files

- **Husky + lint-staged**: Pre-commit hooks for code quality
  - Automatically formats and lints staged files before commits
  - Configuration: `.husky/pre-commit` and `lint-staged` in package.json
  - Ensures only quality code is committed

### Component Documentation

- **Storybook**: Interactive component documentation and development
  - Run `npm run storybook` to view component library at http://localhost:6006
  - Stories located in `/stories` directory
  - Includes accessibility (a11y), docs, and testing addons
  - Example stories provided for Button, Header, and Page components

### Error Handling

The application includes comprehensive error boundaries at multiple levels:

1. **Global Error Boundary** ([app/error.tsx](app/error.tsx))
   - Catches errors at the application level
   - Displays user-friendly error message with retry functionality
   - Shows detailed error info in development mode

2. **Dashboard Error Boundary** ([app/(dashboard)/error.tsx](<app/(dashboard)/error.tsx>))
   - Specialized error handling for dashboard routes
   - Provides contextual error messages for dashboard sections

3. **Root Layout Error Boundary** ([app/global-error.tsx](app/global-error.tsx))
   - Catches critical errors in the root layout
   - Provides minimal fallback UI with inline styles

4. **Reusable ErrorBoundary Component** ([components/ErrorBoundary.tsx](components/ErrorBoundary.tsx))
   - Class component for wrapping specific sections
   - Supports custom fallback UI
   - Optional error callback for logging/reporting
   - Usage:
     ```tsx
     <ErrorBoundary>
       <YourComponent />
     </ErrorBoundary>
     ```

5. **404 Not Found Page** ([app/not-found.tsx](app/not-found.tsx))
   - Custom 404 page for non-existent routes
   - Provides navigation back to dashboard

## Browser Extension Development

### Quick Start (Extension)

```bash
# Navigate to extension directory
cd extension

# Install dependencies (first time only)
npm install

# Create environment file
cp .env.example .env
# Edit .env and add Firebase credentials from main app

# Start development server
npm run dev

# In Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extension/dist/ directory
```

### Extension Commands

```bash
cd extension

npm run dev              # Start development with HMR
npm run build            # Production build
npm run type-check       # TypeScript validation
npm run lint             # ESLint check
```

### Extension Structure

```
extension/
├── public/
│   ├── manifest.json          # Chrome Manifest V3
│   └── icons/                 # Extension icons (16, 48, 128px)
├── src/
│   ├── background/            # Service worker (API calls, token refresh)
│   ├── content/               # Content scripts (Etsy integration)
│   ├── popup/                 # React popup UI
│   ├── shared/
│   │   ├── firebase/          # Firebase auth
│   │   ├── storage/           # Chrome Storage wrappers
│   │   ├── messaging/         # Cross-context messaging
│   │   └── utils/             # Utilities
│   └── components/ui/         # UI components
└── dist/                      # Build output
```

### Testing the Extension

**Authentication Testing:**

1. Click extension icon to open popup
2. Sign in with email/password or Google
3. Close popup and reopen - token should persist
4. Test sign out clears all data

**Etsy Page Detection:**

1. Visit https://www.etsy.com/messages
2. Open extension service worker console (chrome://extensions → Inspect views)
3. Check for "Etsy message page detected" log

**Storage Inspection:**

1. Go to chrome://extensions
2. Find ProdSync extension
3. Click "Inspect views: service worker"
4. Go to Application tab → Storage → Local Storage → chrome-extension://...
5. Verify auth token and expiry are stored

**Debugging:**

- Popup errors: Right-click extension icon → Inspect popup
- Service worker errors: chrome://extensions → Inspect views: service worker
- Content script errors: Inspect the Etsy page (F12)

### Extension Development Workflow

**Making Changes:**

1. Edit files in `extension/src/`
2. Popup changes auto-reload with HMR
3. Background/content script changes require extension reload:
   - Go to chrome://extensions
   - Click refresh icon on ProdSync extension

**Adding New Features to Extension:**

1. Update types in `shared/types/` or import from main app's `/types`
2. Add storage utilities in `shared/storage/` if needed
3. Update messaging types in `shared/messaging/messages.ts`
4. Implement feature in popup, background, or content script
5. Update manifest.json if new permissions needed

## Development Guidelines

### Adding New Features

1. Create types in `/types` directory
2. Add Firestore helpers in `/lib/firebase/firestore.ts`
   - All helpers include comprehensive error handling
   - Firestore Timestamps are automatically converted to JavaScript Dates
   - Errors include actionable messages with Firebase Console links
3. Create components in appropriate `/components` subdirectory
4. Add pages in `/app/(dashboard)/dashboard/` directory
   - Note: Due to Next.js App Router structure, pages go in the nested `dashboard` folder
   - Example: New route `/dashboard/orders` → Create `app/(dashboard)/dashboard/orders/page.tsx`

### AI Provider Integration

- All AI providers implement the same interface in `/lib/ai/providers/`
- Provider factory in `/lib/ai/index.ts` handles selection
- API keys are stored in user's Firestore settings
- **API Key Validation**: Keys are validated before saving (as of latest update)
  - Validation endpoint: `POST /api/ai/validate-key`
  - Tests the key with a minimal request to the provider
  - Returns specific error messages for invalid keys, rate limits, etc.
  - Settings page shows "Validate & Save Settings" button

### Firebase Data Structure

```
users/{userId}
├── settings/general       # API keys, preferences
├── products/{productId}   # Product catalog
└── policies/{policyId}    # Shop policies
```

### Component Patterns

- Use shadcn/ui components from `/components/ui`
- Form validation with react-hook-form + zod
- Toast notifications via `useToast` hook
- Auth state via `useAuth` hook from AuthContext

### Error Handling Best Practices

All Firestore operations in `/lib/firebase/firestore.ts` include:

- **Comprehensive try-catch blocks** with specific error messages
- **Firebase error code detection** (permission-denied, unavailable, unauthenticated, etc.)
- **Automatic Timestamp conversion** from Firestore Timestamp to JavaScript Date
- **Console logging** with full error details for debugging
- **User-friendly messages** with links to Firebase Console for common issues

When catching errors in components:

```typescript
try {
  await createProduct(userId, productData)
} catch (error: any) {
  console.error("Failed to create product:", error)
  toast({
    variant: "destructive",
    title: "Error creating product",
    description: error.message || "Failed to create product. Please try again.",
  })
}
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

- `NEXT_PUBLIC_FIREBASE_*` - Firebase client config
- `FIREBASE_ADMIN_*` - Firebase admin SDK (if needed for server-side)

## Firebase Setup (CRITICAL)

### 1. Configure Environment Variables

Ensure all Firebase credentials are set in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Set Up Firestore Security Rules

**IMPORTANT:** By default, Firestore blocks all reads/writes. You MUST configure security rules.

Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Firestore Database → Rules

Replace the default rules with:

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

Click **Publish** to apply the rules.

**Why this is required:**

- Default rules block ALL database access for security
- Without proper rules, you'll see "Permission denied" or "Failed to load data" errors
- These rules allow users to access only their own data under `users/{userId}/`

### 3. Enable Authentication Methods

In Firebase Console → Authentication → Sign-in method:

- Enable Email/Password authentication
- Enable Google authentication (optional)

### 4. Create Firestore Indexes (if needed)

If you have large datasets (100+ products), create a composite index:

- Go to Firestore Database → Indexes
- Add index for `users/{userId}/products` collection
- Field: `createdAt` (Descending)
- Query scope: Collection

## Common Tasks

### Add a new AI model

1. Add model to `AI_MODELS` array in `/types/settings.ts`
2. Model will automatically appear in settings selector

### Add a new policy type

1. Add type to `PolicyType` in `/types/policy.ts`
2. Add label to `POLICY_TYPE_LABELS` constant

### Modify AI prompt

Edit the `buildSystemPrompt` method in each provider file under `/lib/ai/providers/`

### Troubleshooting Firebase Errors

**"Permission denied" or "Failed to load data" errors:**

1. Check Firebase Security Rules are properly configured
2. Visit: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules
3. Ensure rules allow authenticated users to access their own data
4. Check browser console for specific Firebase error codes

**"Missing Firestore index" errors:**

1. Firebase will provide a direct link to create the required index
2. Click the link and wait for index to build (usually 1-2 minutes)
3. Or manually create index in Firebase Console → Firestore → Indexes

**Firebase not initializing:**

1. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`
2. Restart dev server after changing environment variables
3. Check browser console for Firebase initialization errors

### Troubleshooting AI Provider Errors

**"Invalid API Key" errors:**

1. Go to Settings and re-enter your API key
2. When you click "Validate & Save Settings", the key will be validated before saving
3. Verify your API key is correct from the provider's console:
   - **Google Gemini:** https://aistudio.google.com/apikey
   - **OpenAI:** https://platform.openai.com/api-keys
   - **Anthropic:** https://console.anthropic.com/settings/keys

**"Rate Limit Exceeded" or "API Quota Exceeded" errors:**

1. **Free-tier limitations**: Free API keys have strict rate limits:
   - **Gemini:** 100 requests per minute (free tier)
   - **OpenAI:** 3 requests per minute (free tier)
   - **Anthropic:** 5 requests per minute (free tier)
2. **Solutions:**
   - Wait 1-2 minutes before trying again
   - Upgrade to a paid API tier for higher limits
   - Switch to a different AI provider if one is hitting limits
3. The error message will specify whether it's a quota issue or rate limit

**"Service Unavailable" errors:**

1. The AI provider's service may be temporarily down
2. Wait a few moments and try again
3. Check the provider's status page for known issues

## Recent Bug Fixes (February 2026)

### Fixed: API Route Variable Scope Error

**File**: [app/api/ai/generate-reply/route.ts](app/api/ai/generate-reply/route.ts)
**Issue**: `ReferenceError: provider is not defined` in error catch block
**Fix**: Moved `provider` variable declaration outside try-catch block to make it accessible in error logging

```typescript
// Before: provider declared inside try block
try {
  const { provider, ... } = body
  // ...
} catch (error) {
  console.error("Error:", provider) // ❌ ReferenceError
}

// After: provider declared outside try-catch
let provider: AIProvider | undefined
try {
  const { provider: providerFromBody, ... } = body
  provider = providerFromBody
  // ...
} catch (error) {
  console.error("Error:", provider) // ✅ Works correctly
}
```

### Fixed: Client Component Event Handler Error

**File**: [app/not-found.tsx](app/not-found.tsx)
**Issue**: `Event handlers cannot be passed to Client Component props` when using `asChild` with `onClick`
**Fix**: Removed `asChild` and `Link` wrapper from the "Go Back" button, using regular button with onClick instead

```tsx
// Before: Invalid combination of asChild + onClick
<Button asChild onClick={() => window.history.back()}>
  <Link href="#">Go Back</Link>
</Button>

// After: Regular button with onClick
<Button onClick={() => window.history.back()}>
  Go Back
</Button>
```

Also added `"use client"` directive since the component uses client-side features.

## Deployment Guide

### Production Build

Before deploying, ensure the application builds successfully:

```bash
npm run build
npm run start  # Test production build locally
```

### Deploy to Vercel (Recommended)

**Why Vercel?**

- Built by Next.js creators - zero configuration needed
- Automatic HTTPS and CDN
- Environment variables in dashboard
- Preview deployments for every git push
- Free tier includes: 100GB bandwidth, serverless functions

**Steps:**

1. **Prepare repository**

   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub
   - Select ProdSync repository
   - Vercel auto-detects Next.js settings (no config needed)

3. **Configure environment variables**

   In Vercel dashboard → Project → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy**
   - Click "Deploy" button
   - Build completes in ~2 minutes
   - Get production URL: `https://prodsync.vercel.app`

5. **Update Firebase Configuration**

   **Critical**: Add Vercel domain to Firebase authorized domains
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Navigate to: Authentication → Settings → Authorized domains
   - Click "Add domain" and enter: `your-app.vercel.app`
   - Without this, authentication will fail on production

6. **Verify deployment**
   - [ ] Visit production URL
   - [ ] Test sign up / sign in
   - [ ] Test AI reply generation
   - [ ] Check browser console for errors
   - [ ] Test on mobile devices

### Deploy to Netlify

**Configuration:**

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

**Deploy:**

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site"
3. Import repository
4. Add environment variables in Site Settings
5. Deploy

### Deploy to Railway

**Steps:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_FIREBASE_API_KEY=your_key
# ... add all other env vars

# Deploy
railway up
```

### Environment Variables Management

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

**For each deployment platform:**

1. Add all `NEXT_PUBLIC_FIREBASE_*` variables
2. Values must match your Firebase project exactly
3. Restart deployment after changing env vars

### Post-Deployment Configuration

**1. Firebase Security Rules**

Ensure Firestore rules are published:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**2. Firebase Authorized Domains**

Add your production domain(s):

- Firebase Console → Authentication → Settings → Authorized domains
- Add: `your-app.vercel.app` (or your custom domain)

**3. Test Critical Flows**

- ✅ User signup and login
- ✅ Product import (Excel upload)
- ✅ Policy creation
- ✅ AI reply generation (test all configured providers)
- ✅ Settings save/update

### Custom Domain Setup

**Vercel:**

1. Project Settings → Domains → Add Domain
2. Enter your custom domain (e.g., `prodsync.com`)
3. Update DNS records at your domain registrar:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. Vercel automatically provisions SSL certificate

**Update Firebase:**

- Add custom domain to Firebase authorized domains
- Test authentication on custom domain

### CI/CD (Continuous Deployment)

**Vercel automatically:**

- Deploys `main` branch to production
- Creates preview deployments for pull requests
- Runs build checks before deployment

**To disable auto-deployment:**

- Vercel Dashboard → Settings → Git → Production Branch
- Uncheck "Automatically expose System Environment Variables"

### Monitoring & Debugging

**Vercel Logs:**

- Dashboard → Deployments → Click deployment → View Function Logs
- Real-time serverless function logs
- Error tracking and performance metrics

**Firebase Console:**

- Authentication tab: Monitor sign-ups, active users
- Firestore tab: View database operations
- Usage tab: Track read/write operations

**Browser DevTools:**

- Check Console for client-side errors
- Network tab: Monitor API calls, check for 401/403/500 errors
- Application tab: Verify environment variables loaded

### Troubleshooting Production Issues

**"Authentication failed" on production:**

- Verify domain is in Firebase authorized domains
- Check environment variables are set correctly in Vercel
- Ensure Firebase config values match exactly

**"Permission denied" errors:**

- Check Firestore security rules are published
- Verify user is authenticated before accessing data
- Check browser console for auth state

**AI generation fails on production:**

- API keys are user-specific (stored in Firestore)
- Each user must add their own API keys in Settings
- Verify API routes are accessible (check Vercel function logs)

**Build fails:**

- Run `npm run build` locally first
- Check TypeScript errors: `npm run lint`
- Verify all dependencies are in `package.json`
- Check Node.js version matches (18+)

## Future Improvements & Roadmap

### Phase 1: Browser Extension ⏳ (In Progress - 70% Complete)

**Phase 1.1: Foundation ✅ Completed (February 2026)**

- [x] Chrome extension project structure with Vite + React + TypeScript
- [x] Chrome Manifest V3 configuration with permissions
- [x] Chrome Storage wrapper utilities (auth, cache, settings)
- [x] Firebase authentication integration (email/password + Google)
- [x] Popup UI with login flow and auth state management
- [x] Token storage and expiry checking (auto-refresh on 5-min buffer)
- [x] Background service worker with message routing
- [x] Content script entry point with Etsy page detection
- [x] Cross-context messaging system (popup ↔ background ↔ content)
- [x] UI components copied from main app (Button, Card, Input, Label)

**Phase 1.2: Content Script Integration ⏳ Next**

- [ ] DOM manipulation to inject "Generate Reply" button on Etsy pages
- [ ] Buyer message extraction from Etsy conversation UI
- [ ] Reply insertion into Etsy message textarea with React event triggering
- [ ] Button styling to match Etsy's design language

**Phase 1.3: API Integration ⏳ Pending**

- [ ] Backend API client for /api/ai/generate-reply
- [ ] Token refresh mechanism in background worker
- [ ] Firestore data fetching (products, policies, user settings)
- [ ] Data caching with 1-hour TTL
- [ ] Error handling for API failures (401, 403, 429, 500+)

**Phase 1.4: Reply Generation UI ⏳ Pending**

- [ ] Full reply generation form in popup
- [ ] Product selector with cached product list
- [ ] Tone selector (professional, friendly, formal, casual)
- [ ] Reply preview with copy/insert buttons
- [ ] Loading states and error messages

**Phase 1.5: Testing & Deployment ⏳ Pending**

- [ ] Manual testing checklist completion
- [ ] Chrome Web Store submission assets (screenshots, icons, promo images)
- [ ] Privacy policy document
- [ ] CORS configuration in backend for chrome-extension:// origins
- [ ] Chrome Web Store submission and review

**Implementation Files Created (32 files):**

- Extension directory: `/extension/`
- Configuration: `manifest.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- Storage utilities: `storage/auth-storage.ts`, `storage/cache-storage.ts`, `storage/storage-keys.ts`
- Firebase: `firebase/config.ts`, `firebase/auth.ts`
- Messaging: `messaging/messages.ts`
- UI: `popup/App.tsx`, `popup/pages/Login.tsx`, `popup/pages/Generator.tsx`
- Scripts: `background/index.ts`, `content/index.ts`
- Components: `ui/button.tsx`, `ui/card.tsx`, `ui/input.tsx`, `ui/label.tsx`

**Documentation:**

- Extension README: [extension/README.md](extension/README.md)
- Implementation plan: `C:\Users\chama\.claude\plans\rustling-imagining-crayon.md`

**Next Steps:**

1. Configure `.env` file with Firebase credentials
2. Test authentication flow in Chrome
3. Implement Phase 1.2: Content script DOM manipulation

### Phase 2: Enhanced AI Features

- [ ] Smart product detection from buyer messages
- [ ] Auto-suggest relevant products based on message content
- [ ] Multiple reply variations to choose from
- [ ] Reply quality scoring and improvement suggestions
- [ ] Custom prompt templates per policy type
- [ ] Message sentiment analysis

**Implementation Notes:**

- Add `/lib/ai/analyzers/` for message analysis
- Create `MessageAnalyzer` class for product/intent detection
- Store prompt templates in Firestore under `users/{userId}/templates`

### Phase 3: Multi-Shop & SaaS

- [ ] Support multiple Etsy shops per account
- [ ] Shop-specific products and policies
- [ ] Team member access with role-based permissions
- [ ] Subscription tiers (Free, Pro, Business)
- [ ] Usage analytics and billing integration

**Implementation Notes:**

- Restructure Firestore: `shops/{shopId}/products`, `shops/{shopId}/policies`
- Add `users/{userId}/shops` subcollection
- Implement Stripe for payments
- Add `/app/(dashboard)/shops` for shop management

### Phase 4: Analytics & Insights

- [ ] Track most common buyer questions
- [ ] Response time analytics
- [ ] AI usage statistics per provider/model
- [ ] Cost tracking for API usage
- [ ] Export reports (CSV/PDF)

**Implementation Notes:**

- Create `analytics` subcollection in Firestore
- Add `/lib/analytics/` for tracking utilities
- Create `/app/(dashboard)/analytics` page
- Use charts library (recharts or chart.js)

### Phase 5: Advanced Automation

- [ ] Scheduled auto-replies for common questions
- [ ] FAQ detection and instant responses
- [ ] Integration with Etsy API for order data
- [ ] Automated follow-up messages
- [ ] Smart response queuing

**Implementation Notes:**

- Implement Etsy OAuth for API access
- Add Firebase Cloud Functions for scheduled tasks
- Create `/lib/etsy/` for Etsy API integration
- Add `automations` collection for user rules

### Phase 6: Message History & Learning

- [ ] Store generated replies with buyer messages
- [ ] Learn from user edits to improve responses
- [ ] Favorite/save best replies as templates
- [ ] Search through past conversations
- [ ] Reply rating system for quality improvement

**Implementation Notes:**

- Add `users/{userId}/messages` collection
- Create `ReplyHistory` component
- Implement feedback loop for AI improvement
- Add vector search for similar past messages

## Technical Debt & Improvements

### Performance

- [ ] Implement React Query for data fetching and caching
- [ ] Add loading skeletons for better UX
- [ ] Optimize Firestore queries with proper indexes
- [ ] Implement pagination for products/policies lists
- [ ] Add service worker for offline support

### Security

- [x] **Firebase Security Rules configured** - Users can only access their own data
- [ ] Encrypt AI provider API keys before storing in Firestore
- [ ] Add rate limiting to API routes
- [ ] Implement CSRF protection
- [ ] Add input sanitization for all user inputs
- [ ] Regular security audit for Firebase rules

### Testing

- [ ] Add Jest unit tests for utilities
- [ ] Add React Testing Library tests for components
- [ ] Add Playwright E2E tests for critical flows
- [ ] Set up CI/CD pipeline with GitHub Actions

### Code Quality

- [x] **Comprehensive error handling** in all Firestore operations
- [x] **TypeScript strict typing** throughout the codebase
- [x] **API key validation** before saving settings
- [x] **Improved AI provider error messages** with specific error types and suggestions
- [x] **Add ESLint strict rules** - Configured with TypeScript strict mode, type safety checks, and code quality rules
- [x] **Set up Prettier for consistent formatting** - Configured with format scripts and .prettierrc.json
- [x] **Add Husky pre-commit hooks** - Configured with lint-staged for automatic formatting and linting
- [x] **Create Storybook for component documentation** - Storybook 10.2.3 with accessibility, docs, and vitest addons
- [x] **Add error boundary components for React errors** - Multiple error boundaries for app, dashboard, and reusable component

## API Endpoints

### Implemented

```
POST /api/ai/generate-reply    - Generate AI response to buyer message
POST /api/ai/validate-key      - Validate AI provider API key before saving
```

### To Add

```
POST /api/messages/analyze     - Analyze buyer message for intent/products
POST /api/messages/history     - Save message and reply to history
GET  /api/analytics/usage      - Get AI usage statistics
POST /api/products/search      - Search products by query
POST /api/etsy/connect         - OAuth flow for Etsy integration
GET  /api/etsy/orders          - Fetch orders from Etsy
```

## Database Schema Additions

```
users/{userId}/
├── messages/{messageId}       # Message history
│   ├── buyerMessage: string
│   ├── generatedReply: string
│   ├── provider: string
│   ├── model: string
│   ├── productIds: string[]
│   ├── rating: number
│   └── createdAt: timestamp
├── templates/{templateId}     # Reply templates
│   ├── name: string
│   ├── content: string
│   ├── category: string
│   └── usageCount: number
├── analytics/usage            # Usage stats
│   ├── totalReplies: number
│   ├── byProvider: map
│   └── byMonth: map
└── shops/{shopId}             # Multi-shop support
    ├── name: string
    ├── etsyShopId: string
    └── isActive: boolean
```
