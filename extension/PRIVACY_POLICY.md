# ProdSync Chrome Extension - Privacy Policy

**Last Updated:** February 3, 2026

## Introduction

ProdSync ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how the ProdSync Chrome Extension ("Extension") collects, uses, and safeguards your information when you use our service.

## Information We Collect

### 1. Authentication Information

- **Email address and password** - Used for account authentication via Firebase Auth
- **Google account information** - If you choose to sign in with Google (name, email, profile picture)
- **Authentication tokens** - Stored locally in your browser to keep you signed in

### 2. User-Provided Content

- **Products** - Product names, descriptions, prices, and images you add to your ProdSync account
- **Policies** - Shop policies (shipping, returns, custom orders) you configure
- **API Keys** - Third-party AI provider API keys (OpenAI, Google Gemini, Anthropic Claude) stored encrypted in Firebase

### 3. Usage Data

- **Extension usage** - Number of replies generated, AI provider selected, tone preferences
- **Performance data** - Error logs, crash reports (anonymized)

### 4. Etsy Page Data

- **Buyer messages** - Temporarily accessed to generate AI replies (not stored permanently)
- **Page context** - URL detection to determine when you're on Etsy message pages

## What We Do NOT Collect

- ❌ We do NOT store buyer messages permanently
- ❌ We do NOT access Etsy conversations without your explicit action (clicking "Generate Reply")
- ❌ We do NOT share your data with third parties for advertising
- ❌ We do NOT track your browsing activity outside Etsy message pages
- ❌ We do NOT sell your personal information

## How We Use Your Information

### 1. Core Functionality

- Authenticate your identity and maintain your session
- Generate AI-powered replies to buyer messages
- Store your products and policies for personalized responses
- Cache data locally for faster performance

### 2. Service Improvement

- Analyze usage patterns to improve features (anonymized)
- Debug errors and fix bugs
- Optimize AI reply quality

### 3. Communication

- Send important service updates and security alerts
- Respond to your support requests

## Data Storage and Security

### Local Storage (Your Browser)

The following data is stored locally in Chrome's storage:

- Authentication token (encrypted)
- Cached products and policies (max 1 hour)
- User preferences (tone, selected products)

**Security:** Chrome's storage API is sandboxed and isolated per-extension. Only the ProdSync extension can access this data.

### Cloud Storage (Firebase Firestore)

The following data is stored in Google Firebase:

- User account information (email, user ID)
- Products, policies, and settings
- AI provider API keys (encrypted at rest)

**Security:**

- All data transmitted via HTTPS (TLS 1.3)
- Firebase security rules restrict access to your own data only
- API keys are encrypted using industry-standard AES-256 encryption
- Regular security audits and updates

### Third-Party AI Providers

When you generate a reply, the buyer's message and your selected products are sent to your chosen AI provider:

- **OpenAI** - Privacy Policy: https://openai.com/policies/privacy-policy
- **Google Gemini** - Privacy Policy: https://ai.google.dev/gemini-api/terms
- **Anthropic Claude** - Privacy Policy: https://www.anthropic.com/legal/privacy

**Important:** We use YOUR API keys, so you have a direct relationship with these providers. Refer to their privacy policies for how they handle data.

**Data Retention:** Buyer messages sent to AI providers are not stored by ProdSync. Consult each provider's policy for their retention practices.

## Data Retention

### Active Accounts

- Account data, products, and policies: Retained while your account is active
- Authentication tokens: Refreshed every hour, expire after logout
- Local cache: Cleared automatically after 1 hour or on browser restart

### Account Deletion

If you delete your ProdSync account:

- All personal data is permanently deleted within 30 days
- Authentication tokens are immediately invalidated
- Local browser data is cleared immediately

## Your Rights and Choices

### Access and Control

You have the right to:

- **Access** - View all data we store about you in the ProdSync dashboard
- **Edit** - Update your products, policies, and settings anytime
- **Delete** - Remove specific products/policies or your entire account
- **Export** - Download your data in JSON format (contact support)

### Opt-Out Options

You can:

- **Uninstall the extension** - Removes all local data immediately
- **Sign out** - Clears authentication and cached data
- **Revoke permissions** - Disable the extension in Chrome settings

### Marketing Communications

We currently do NOT send marketing emails. If we do in the future:

- You can opt-out via unsubscribe link in any email
- Transactional emails (password resets, security alerts) cannot be disabled

## Third-Party Services

### Firebase (Google Cloud)

**Purpose:** Authentication, database, hosting
**Data Shared:** Email, user ID, products, policies
**Privacy Policy:** https://firebase.google.com/support/privacy

### AI Providers (Your Choice)

**Purpose:** Generate message replies
**Data Shared:** Buyer messages, selected products, tone preference
**Note:** You control which provider to use and provide your own API keys

### Etsy.com

**Purpose:** Extension integrates with Etsy message pages
**Data Accessed:** Buyer messages on pages you visit
**Note:** ProdSync is not affiliated with Etsy, Inc.

## Cookies and Tracking

- **We do NOT use cookies** in the extension
- **We do NOT use analytics trackers** (e.g., Google Analytics)
- **Chrome storage is used** for authentication and caching (not cookies)

## Children's Privacy

ProdSync is intended for Etsy sellers who are at least 18 years old (per Etsy's terms). We do not knowingly collect information from children under 13. If we learn we have collected data from a child under 13, we will delete it immediately.

## International Users

ProdSync is operated from [Your Country]. If you are located outside this country:

- Your data may be transferred to and stored in [Your Country]
- We comply with applicable data protection laws (GDPR, CCPA, etc.)
- By using ProdSync, you consent to this data transfer

### GDPR Rights (EU Users)

If you are in the European Union, you have additional rights:

- **Right to access** - Request a copy of your data
- **Right to rectification** - Correct inaccurate data
- **Right to erasure** - Request deletion ("right to be forgotten")
- **Right to data portability** - Receive your data in a portable format
- **Right to object** - Object to certain data processing
- **Right to lodge a complaint** - Contact your local data protection authority

**To exercise these rights:** Email privacy@prodsync.com

### CCPA Rights (California Users)

If you are a California resident, you have the right to:

- Know what personal information we collect and how it's used
- Delete your personal information
- Opt-out of the sale of personal information (Note: We do NOT sell your data)

## Data Breach Notification

In the event of a data breach that affects your personal information:

- We will notify affected users within 72 hours
- Notification will be sent via email and in-app alert
- We will provide details about the breach and steps to protect yourself

## Changes to This Privacy Policy

We may update this Privacy Policy periodically. When we do:

- The "Last Updated" date at the top will change
- Significant changes will be announced via email or in-app notification
- Continued use of the extension after changes constitutes acceptance

**Your responsibility:** Review this policy periodically for updates.

## Permissions Explained

The Extension requests the following Chrome permissions:

### `storage`

**Why:** Store your authentication token and cache products/settings locally for offline access and better performance.

### `activeTab`

**Why:** Access the current Etsy message page when you click "Generate Reply" to read the buyer's message.

### `scripting`

**Why:** Inject the "Generate Reply" button into Etsy message pages and insert generated replies into the message box.

### Host Permission: `https://www.etsy.com/*`

**Why:** Detect when you're on Etsy message pages and enable reply generation features.

### Host Permission: `https://your-backend.com/*`

**Why:** Communicate with the ProdSync backend to generate AI replies and sync your products/policies.

## Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or your data:

**Email:** privacy@prodsync.com
**Support:** support@prodsync.com
**Website:** https://prodsync.com/privacy
**Address:** [Your Business Address]

**Response Time:** We aim to respond to all privacy inquiries within 48 hours.

## Legal Compliance

This Privacy Policy complies with:

- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Chrome Web Store Developer Program Policies
- CAN-SPAM Act (if we send emails)

## Consent

By installing and using the ProdSync Chrome Extension, you acknowledge that you have read, understood, and agree to this Privacy Policy.

---

**ProdSync** - AI-Powered Message Assistant for Etsy Sellers

_This extension is an independent tool and is not affiliated with, endorsed by, or sponsored by Etsy, Inc._
