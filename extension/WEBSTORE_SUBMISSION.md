# Chrome Web Store Submission Guide

## Required Assets Checklist

### Icons (REQUIRED)

- [x] 16x16px - Toolbar icon (exists in `public/icons/icon-16.png`)
- [x] 48x48px - Extension management page (exists in `public/icons/icon-48.png`)
- [x] 128x128px - Chrome Web Store listing (exists in `public/icons/icon-128.png`)
- [ ] **TODO: Verify all icons are high-quality PNG with transparent background**

### Store Listing Images (REQUIRED)

#### 1. Small Promotional Tile (440x280px)

- **Purpose:** Appears in Chrome Web Store search results and categories
- **Format:** PNG or JPEG
- **Content Suggestion:**
  - ProdSync logo/icon on left
  - Text: "AI-Powered Message Assistant for Etsy Sellers"
  - Gradient background (purple to pink matching brand)
  - Clean, professional design

#### 2. Screenshots (1280x800px or 640x400px) - Minimum 1, Maximum 5

**Screenshot 1: Authentication**

- Show the login screen with clean UI
- Highlight: "Secure login with your ProdSync account"

**Screenshot 2: Reply Generation in Action**

- Show the popup with buyer message displayed
- Tone selector visible
- Product selector visible
- "Generate Reply" button prominent

**Screenshot 3: Generated Reply**

- Show a professional AI-generated reply
- Preview section with formatted text
- "Copy" and "Insert into Etsy" buttons visible

**Screenshot 4: Seamless Etsy Integration**

- Show the "Generate Reply" button on actual Etsy message page (with blur/anonymize buyer info)
- Highlight how it integrates into Etsy UI

**Screenshot 5: Settings & Products**

- Show product selection interface
- Display multiple products with images
- Professional, organized layout

**Notes for Screenshots:**

- Use Chrome DevTools → Device toolbar to get exact dimensions
- Use high-quality, real data (not lorem ipsum)
- Anonymize any personal/buyer information
- Ensure screenshots are clear and legible
- Add subtle borders or shadows for polish

### Promotional Images (OPTIONAL but RECOMMENDED)

#### Marquee Promotional Tile (1400x560px)

- **Purpose:** Featured placement in Chrome Web Store (if selected by Google)
- **Content:** Same as small tile but larger, more detailed
- **Include:** App screenshot, logo, tagline, key features

### Store Listing Text

#### Name (Maximum 45 characters)

```
ProdSync - AI Message Assistant for Etsy
```

**Characters:** 40/45

#### Summary (Maximum 132 characters)

```
Generate professional, policy-compliant Etsy replies instantly. Save time, boost customer satisfaction with AI.
```

**Characters:** 113/132

#### Detailed Description (Maximum 16,384 characters)

```markdown
## ProdSync - Your AI-Powered Etsy Message Assistant

Save hours every week responding to buyer messages with ProdSync, the intelligent Chrome extension that generates professional, on-brand replies in seconds.

### ✨ Key Features

**One-Click Reply Generation**

- Click "Generate Reply" directly on Etsy message pages
- AI analyzes the buyer's message and creates a professional response
- No copy-pasting between apps - seamless integration

**Smart Product Recommendations**

- Select relevant products to include in your reply
- AI incorporates product details naturally into responses
- Help buyers find exactly what they need

**Tone Control**

- Choose from 4 reply tones: Professional, Friendly, Formal, or Casual
- Maintain consistent brand voice across all messages
- Match your shop's personality perfectly

**Policy-Compliant Responses**

- Your shop policies are automatically considered
- Never worry about violating Etsy guidelines
- Responses align with your return, shipping, and custom order policies

**Multiple AI Providers**

- Supports OpenAI, Google Gemini, and Anthropic Claude
- Choose the AI model that works best for your needs
- Fallback options if one provider has issues

### 🚀 How It Works

1. **Visit Etsy Messages** - Open any buyer conversation on Etsy.com
2. **Click "Generate Reply"** - Find the ProdSync button near the message box
3. **Customize** - Select products, choose tone, review the generated reply
4. **Insert** - Click "Insert into Etsy" and send your professional response

### 🔒 Privacy & Security

- **Secure Authentication** - Sign in with your ProdSync account
- **No Data Storage** - Messages are processed in real-time, never stored by the extension
- **API Keys Protected** - Your AI provider keys are encrypted and stored securely
- **Etsy-Only Access** - Extension only activates on Etsy message pages

### 💼 Perfect For

- **Busy Etsy Sellers** - Respond to 10x more messages in the same time
- **Multi-Shop Owners** - Maintain professional communication across all shops
- **New Sellers** - Sound professional even when you're still learning
- **High-Volume Shops** - Scale your customer service without hiring

### 📋 Requirements

- Active ProdSync account (free signup at ProdSync.com)
- At least one AI provider API key configured (OpenAI, Gemini, or Claude)
- Etsy seller account with access to Messages

### 🎯 Use Cases

**Common Questions** - "When will this ship?" → Instant reply with your shipping policy
**Custom Orders** - "Can you make this in blue?" → Professional quote with product details
**Order Issues** - "Where's my package?" → Helpful response with tracking info
**Product Inquiries** - "Do you have more like this?" → Suggest relevant products

### 🔄 Always Improving

ProdSync is actively developed with regular updates:

- New AI models and providers
- Enhanced message analysis
- Improved Etsy integration
- Feature requests welcome!

### 💡 Pro Tips

1. Add your most popular products to ProdSync for quick selection
2. Set up your shop policies in the main app for accurate responses
3. Always review AI-generated replies before sending
4. Use different tones for different buyer types
5. Save time by using keyboard shortcuts

### 🆓 Pricing

- Free forever for basic features
- Pay only for AI API usage (typically $0.001-0.01 per reply)
- No ProdSync subscription required
- Use your own AI provider keys for full control

### 📞 Support & Feedback

- Documentation: ProdSync.com/docs
- Support: support@prodsync.com
- Feature Requests: github.com/yourrepo/issues
- Video Tutorials: ProdSync.com/tutorials

### 🏆 Why ProdSync?

Unlike other tools that require manual copy-pasting or separate apps:

- ✅ **Native Etsy Integration** - Works directly on Etsy.com
- ✅ **Context-Aware** - Understands your products and policies
- ✅ **Flexible** - Choose your own AI provider and model
- ✅ **Fast** - Generate replies in under 5 seconds
- ✅ **Professional** - Every reply sounds polished and helpful

Transform your Etsy customer service today with ProdSync - the smart way to handle buyer messages.

---

_Note: ProdSync is an independent tool and is not affiliated with, endorsed by, or sponsored by Etsy, Inc._
```

#### Category

**Primary:** Productivity
**Secondary:** Shopping (if available)

#### Language

English (United States)

### Privacy Policy (REQUIRED)

A privacy policy is **mandatory** for Chrome Web Store submission. See `PRIVACY_POLICY.md` (to be created).

### Developer Information

#### Developer Name

```
[Your Name or Company Name]
```

#### Developer Email (visible to users)

```
support@prodsync.com
```

#### Developer Website

```
https://prodsync.com
```

#### Support Email

```
support@prodsync.com
```

### Permissions Justification (REQUIRED)

Chrome Web Store requires explanation for each permission in manifest.json:

#### `storage`

**Why:** Store user authentication tokens and cached data (products, settings) for offline access and improved performance.

#### `activeTab`

**Why:** Access the current Etsy message page to inject the "Generate Reply" button and extract buyer messages.

#### `scripting`

**Why:** Inject content scripts into Etsy message pages to enable seamless integration.

#### `host_permissions: ["https://www.etsy.com/*"]`

**Why:** Access Etsy message pages to detect conversations, extract buyer messages, and insert generated replies.

#### `host_permissions: ["https://your-backend.com/*"]` or `["http://localhost:3000/*"]`

**Why:** Communicate with ProdSync backend API to generate AI replies and fetch user data (products, policies, settings).

### Single Purpose Description (REQUIRED)

```
This extension helps Etsy sellers generate professional, AI-powered replies to buyer messages directly on Etsy.com. It integrates with the ProdSync platform to analyze buyer messages and create contextually appropriate responses based on the seller's products and policies.
```

### Optional: Video Preview

**If creating a video (highly recommended for better conversion):**

- Length: 30-60 seconds
- Format: YouTube link
- Content:
  1. Show problem: "Spending hours replying to Etsy messages?"
  2. Show solution: Open Etsy, click Generate button, insert reply
  3. Show result: "Professional replies in 5 seconds"
  4. Call to action: "Install ProdSync now"
- Tools: Loom, OBS Studio, or Camtasia

## Asset Creation Tools

### Design Tools (Free)

- **Canva** (recommended) - Browser-based, templates available
- **Figma** - Professional design tool
- **GIMP** - Free Photoshop alternative
- **Inkscape** - Vector graphics editor

### Screenshot Tools

- **Chrome DevTools** - Built-in, perfect dimensions
- **Lightshot** - Quick screenshot with annotations
- **ShareX** - Advanced screenshot tool (Windows)
- **Skitch** - Screenshot with markup (Mac)

### Icon Tools

- **RealFaviconGenerator.net** - Generate all icon sizes from one image
- **Favicon.io** - Create icons from text, emoji, or image

## Pre-Submission Checklist

### Technical Requirements

- [ ] Extension ID is generated (obtained after first upload)
- [ ] Version number in manifest.json is correct (e.g., 1.0.0)
- [ ] All permissions are listed and justified
- [ ] No malicious code or obfuscated code
- [ ] No cryptocurrency mining or unexpected network requests
- [ ] Follows Chrome extension best practices

### Content Requirements

- [ ] All text is proofread and error-free
- [ ] Screenshots accurately represent extension functionality
- [ ] No misleading claims or fake reviews
- [ ] Privacy policy is comprehensive and accurate
- [ ] Contact information is valid and monitored

### Legal Requirements

- [ ] You own rights to all images and content
- [ ] No copyrighted material without permission
- [ ] No Etsy trademarks used improperly (avoid "Etsy Extension" in name)
- [ ] Terms of service accepted
- [ ] Developer agreement accepted

## Submission Process

### 1. Create Developer Account

- Visit: https://chrome.google.com/webstore/devconsole
- Sign in with Google account
- Pay one-time $5 developer registration fee
- Verify email address

### 2. Prepare ZIP File

```bash
cd extension
npm run build
cd dist
# Create ZIP of dist/ folder contents (not the folder itself)
```

**Important:** ZIP should contain `manifest.json` at the root, not inside a folder.

### 3. Upload Extension

1. Click "New Item" in Developer Dashboard
2. Upload ZIP file
3. Wait for upload to complete and auto-checks to pass

### 4. Fill Store Listing

1. Upload all required images
2. Fill in description, summary, category
3. Add privacy policy URL (host on prodsync.com or GitHub)
4. Set pricing (Free)
5. Select regions (Worldwide recommended)

### 5. Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Wait 1-7 days for Google review

### 6. Review Process

- **Automated checks:** Immediate (malware, policy violations)
- **Manual review:** 1-3 business days typically
- **Possible outcomes:**
  - ✅ Approved - Extension goes live immediately
  - ❌ Rejected - Email with reasons, fix and resubmit
  - ⚠️ Needs Info - Respond to Google's questions

## Post-Submission

### If Approved

- [ ] Extension is live on Chrome Web Store
- [ ] Add Web Store link to ProdSync.com website
- [ ] Update README.md with installation link
- [ ] Announce on social media, email list
- [ ] Monitor reviews and ratings

### If Rejected

- [ ] Read rejection email carefully
- [ ] Fix all mentioned issues
- [ ] Update version number in manifest.json
- [ ] Resubmit with explanation of changes

### Monitoring

- [ ] Check Developer Dashboard daily for user reviews
- [ ] Respond to user feedback within 48 hours
- [ ] Monitor crash reports and errors
- [ ] Track installation stats

## Update Process (Post-Launch)

1. Make changes to extension code
2. Increment version in manifest.json (e.g., 1.0.0 → 1.0.1)
3. Build and test thoroughly
4. Create ZIP of updated dist/
5. Upload to Developer Dashboard (replaces previous version)
6. Submit for review
7. Updates auto-install for existing users after approval

## Resources

- **Chrome Web Store Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- **Extension Publishing Guide:** https://developer.chrome.com/docs/webstore/publish
- **Program Policies:** https://developer.chrome.com/docs/webstore/program-policies
- **Branding Guidelines:** https://developer.chrome.com/docs/webstore/branding
- **Best Practices:** https://developer.chrome.com/docs/extensions/mv3/quality_guidelines

## Asset File Naming Convention

Save all assets in `extension/store-assets/` folder:

```
extension/store-assets/
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── promotional/
│   ├── small-tile-440x280.png
│   └── marquee-tile-1400x560.png
├── screenshots/
│   ├── 01-authentication.png (1280x800)
│   ├── 02-reply-generation.png
│   ├── 03-generated-reply.png
│   ├── 04-etsy-integration.png
│   └── 05-product-selection.png
├── privacy-policy.html
└── description.txt
```

## Timeline Estimate

- **Asset Creation:** 4-8 hours (design, screenshots, copy)
- **Privacy Policy:** 2-4 hours (write, legal review)
- **Store Listing Setup:** 1-2 hours
- **Review Process:** 1-7 days (Google)
- **Total:** ~2 weeks from start to live

## Next Steps

1. Complete [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - ensure extension works perfectly
2. Create all required assets (icons, screenshots, promotional images)
3. Write and host privacy policy
4. Configure CORS in backend
5. Submit to Chrome Web Store
6. Monitor review process

---

**Ready to submit?** Double-check this entire document and [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) before uploading!
