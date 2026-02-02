# ProdSync

An AI-powered message assistant for Etsy shop owners. Generate professional, policy-compliant responses to buyer messages in seconds.

![ProdSync](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Firebase](https://img.shields.io/badge/Firebase-10-orange) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

- **AI-Powered Replies** - Generate professional responses using OpenAI, Google Gemini, or Anthropic Claude
- **Product Database** - Import products via Excel or add them manually
- **Policy Management** - Configure refund, shipping, cancellation, and custom policies
- **Multi-Provider Support** - Switch between AI providers and models based on your preference
- **One-Click Copy** - Generated replies are ready to paste into Etsy messages
- **Secure** - Your API keys are stored securely in your own Firebase project

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password + Google)
- **AI Providers**: OpenAI, Google Gemini, Anthropic Claude

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- API key from at least one AI provider (OpenAI, Google AI, or Anthropic)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Chamara-Dilshan/ProdSync.git
   cd ProdSync
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Get your Firebase config from Project Settings

4. **Configure environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your Firebase credentials:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Create an Account

Sign up with email/password or Google authentication.

### 2. Add Your API Key

Go to **Settings** and add at least one AI provider API key:

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Anthropic Console](https://console.anthropic.com/settings/keys)

### 3. Import Your Products

Navigate to **Products** and either:

- Click "Add Product" to add manually
- Use "Import from Excel" tab to bulk import

Excel template columns:
| Column | Description |
|--------|-------------|
| name\* | Product name (required) |
| description | Product description |
| price | Price (numeric) |
| currency | Currency code (USD, EUR, etc.) |
| sizes | Comma-separated sizes |
| colors | Comma-separated colors |
| materials | Comma-separated materials |
| careInstructions | Care/washing instructions |
| customizationOptions | Available customizations |
| processingTime | Processing/shipping time |
| tags | Comma-separated tags |
| sku | Product SKU |

### 4. Configure Shop Policies

Go to **Policies** and add your shop policies:

- Refund Policy
- Shipping Policy
- Cancellation Policy
- Exchange Policy
- Processing Time
- Custom policies

### 5. Generate Replies

Navigate to **Messages**:

1. Paste the buyer's message
2. (Optional) Select a specific product for context
3. Choose the response tone
4. Click "Generate Reply"
5. Copy the generated reply to your clipboard

## Project Structure

```
ProdSync/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   ├── products/          # Product management
│   ├── policies/          # Policy management
│   ├── messages/          # Reply generator
│   └── settings/          # Settings components
├── lib/
│   ├── firebase/          # Firebase configuration
│   ├── ai/                # AI provider integrations
│   ├── context/           # React contexts
│   └── utils/             # Utility functions
└── types/                 # TypeScript definitions
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
npm run storybook  # Start Storybook component library
```

## Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy ProdSync is using [Vercel](https://vercel.com):

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "Add New Project"
   - Import your ProdSync repository
   - Vercel will auto-detect Next.js settings

3. **Add environment variables**

   In Vercel dashboard → Settings → Environment Variables, add:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app automatically
   - You'll get a production URL like `https://your-app.vercel.app`

5. **Update Firebase Auth Domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

### Deploy to Netlify

1. **Build configuration**

   Create `netlify.toml` in project root:

   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git repository
   - Add environment variables (same as Vercel)
   - Deploy

### Deploy to Other Platforms

#### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Run: `railway login`
3. Run: `railway init`
4. Add environment variables: `railway variables`
5. Deploy: `railway up`

#### Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in dashboard

### Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Firebase authorized domains include your deployment URL
- [ ] Firestore security rules are published
- [ ] Test authentication (sign up, sign in, sign out)
- [ ] Test AI reply generation with all configured providers
- [ ] Verify product and policy CRUD operations
- [ ] Check browser console for errors

### Custom Domain Setup

1. **Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Firebase**:
   - Add custom domain to Firebase authorized domains
   - Test authentication with custom domain

## AI Models Supported

### OpenAI

- GPT-4o (Most capable)
- GPT-4o Mini (Fast and affordable)
- GPT-4 Turbo

### Google Gemini

- Gemini 1.5 Pro
- Gemini 1.5 Flash
- Gemini 2.0 Flash

### Anthropic Claude

- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Haiku

## Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Browser Extension

🚀 **Chrome extension in active development!** Generate AI replies directly from your Etsy inbox.

### Status: Phase 1 (Foundation) ✅ Completed

**Implemented:**

- ✅ Chrome extension project with Vite + React + TypeScript
- ✅ Firebase authentication (email/password + Google)
- ✅ Token storage with auto-refresh
- ✅ Popup UI with login flow
- ✅ Background service worker
- ✅ Content script for Etsy page detection
- ✅ Cross-context messaging system

**Coming Next (Phase 2):**

- ⏳ "Generate Reply" button injection on Etsy pages
- ⏳ Buyer message extraction
- ⏳ One-click reply insertion into Etsy

**Getting Started:**

```bash
cd extension
npm install
cp .env.example .env
# Edit .env with Firebase credentials
npm run dev
```

See [extension/README.md](extension/README.md) for detailed setup instructions.

## Roadmap

### Phase 1: Browser Extension ⏳ (70% Complete)

- [x] Foundation: Auth, storage, popup UI
- [ ] Content script: DOM manipulation, message extraction
- [ ] API integration: Backend calls, data caching
- [ ] Reply generation UI
- [ ] Chrome Web Store submission

### Phase 2: Enhanced AI Features

- [ ] Smart product detection from buyer messages
- [ ] Multiple reply variations
- [ ] Reply quality scoring
- [ ] Custom prompt templates
- [ ] Message sentiment analysis

### Phase 3: Multi-Shop & SaaS

- [ ] Multi-shop support
- [ ] Team member access with roles
- [ ] Subscription tiers
- [ ] Usage analytics
- [ ] Billing integration

### Phase 4: Advanced Features

- [ ] Reply history and learning
- [ ] Automated follow-ups
- [ ] Etsy API integration
- [ ] FAQ detection
- [ ] Analytics dashboard

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Chamara-Dilshan/ProdSync/issues).

---

Built with ❤️ for Etsy sellers
