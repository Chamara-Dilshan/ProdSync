# CORS Configuration for ProdSync Extension

## Overview

Cross-Origin Resource Sharing (CORS) is configured in the ProdSync backend to allow the Chrome Extension to communicate with the API. Without proper CORS configuration, the extension will receive "CORS policy" errors when making API requests.

## Backend Configuration

### Middleware Setup

The CORS middleware is configured in [middleware.ts](../middleware.ts) at the root of the project.

**Allowed Origins:**

- ✅ `chrome-extension://*` - Chrome extensions (any extension ID)
- ✅ `moz-extension://*` - Firefox extensions (future support)
- ✅ `http://localhost:*` - Development servers (any port)
- ✅ `https://*.vercel.app` - Vercel preview deployments
- ✅ Custom production domain (set via `NEXT_PUBLIC_APP_URL` env variable)

**CORS Headers Set:**

- `Access-Control-Allow-Origin` - Reflects the requesting origin if allowed
- `Access-Control-Allow-Methods` - GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers` - Content-Type, Authorization, X-Requested-With, Accept, Origin
- `Access-Control-Allow-Credentials` - true (allows cookies/auth headers)
- `Access-Control-Max-Age` - 86400 (caches preflight for 24 hours)

### Routes Protected

The middleware applies to:

- `/api/*` - All API routes

The middleware does NOT apply to:

- `/_next/*` - Next.js internal routes
- `/static/*` - Static assets
- `/*.ico` - Favicon and other files

## Testing CORS Configuration

### 1. Development Testing

**Start backend:**

```bash
npm run dev
# Backend runs at http://localhost:3000
```

**Check CORS headers:**

```bash
# Test with curl (simulating extension request)
curl -i -X OPTIONS http://localhost:3000/api/ai/generate-reply \
  -H "Origin: chrome-extension://abcdefghijklmnopqrstuvwxyz123456" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Expected response:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: chrome-extension://abcdefghijklmnopqrstuvwxyz123456
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
# Access-Control-Allow-Credentials: true
```

### 2. Extension Testing

**In Chrome DevTools (while using extension):**

1. Open extension popup
2. Open DevTools (F12) on the popup
3. Go to Network tab
4. Generate a reply (triggers API call)
5. Check the request:
   - Status should be `200 OK` (not `CORS error`)
   - Response Headers should include:
     - `Access-Control-Allow-Origin: chrome-extension://YOUR_EXTENSION_ID`
     - `Access-Control-Allow-Credentials: true`

**Common Issues:**

❌ **Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**

- Cause: Backend middleware not running or misconfigured
- Fix: Ensure backend is running and middleware.ts is in the project root

❌ **Error: "CORS policy: The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '\*' when the request's credentials mode is 'include'"**

- Cause: Using wildcard origin with credentials
- Fix: Our middleware correctly reflects specific origins (already handled)

❌ **Error: "Preflight request didn't succeed"**

- Cause: OPTIONS request blocked or misconfigured
- Fix: Check that middleware handles OPTIONS method correctly

### 3. Production Testing

After deploying to Vercel or another host:

```bash
# Test production API
curl -i -X OPTIONS https://your-app.vercel.app/api/ai/generate-reply \
  -H "Origin: chrome-extension://abcdefghijklmnopqrstuvwxyz123456" \
  -H "Access-Control-Request-Method: POST"

# Should return same CORS headers as development
```

**For production with custom domain:**

1. Set environment variable in Vercel:

   ```
   NEXT_PUBLIC_APP_URL=https://prodsync.com
   ```

2. Redeploy application

3. Test CORS with your extension

## Environment Variables

Add to `.env.local` (development) and Vercel dashboard (production):

```env
# Optional: Production domain for CORS
NEXT_PUBLIC_APP_URL=https://prodsync.com
```

**Note:** This is only needed if you want to allow your production web app domain. Chrome extension origins are always allowed.

## Security Considerations

### Why We Allow All Chrome Extensions

The middleware allows **any** chrome-extension:// origin because:

1. **Extension IDs are unpredictable** - Each user has a different ID when loading unpacked extensions during development
2. **Published extension has one ID** - After Chrome Web Store publication, the extension ID is fixed, but we can't hardcode it before publishing
3. **API requires authentication** - Even if another extension calls our API, it needs a valid Firebase auth token
4. **Firestore security rules** - Users can only access their own data via Firestore rules

### Alternative: Strict Extension ID

If you want to restrict to **only** the published extension after launch:

1. Publish extension to Chrome Web Store
2. Note the extension ID (e.g., `abcdefg1234567890`)
3. Update middleware.ts:

```typescript
function isAllowedOrigin(origin: string): boolean {
  // Only allow published extension
  const PUBLISHED_EXTENSION_ID = "abcdefg1234567890"
  if (origin === `chrome-extension://${PUBLISHED_EXTENSION_ID}`) {
    return true
  }

  // Still allow localhost for development
  if (origin.startsWith("http://localhost:")) {
    return true
  }

  return false
}
```

4. Redeploy backend

**Trade-off:** Development becomes harder (need to use published extension for testing).

## Debugging CORS Issues

### Enable Verbose Logging

Add console logs to middleware.ts:

```typescript
export function middleware(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin")
  console.log("[CORS] Request:", {
    method: request.method,
    url: request.url,
    origin,
    allowed: origin ? isAllowedOrigin(origin) : "no origin",
  })

  // ... rest of middleware
}
```

### Check Browser Console

Look for CORS errors in the extension popup's DevTools console:

```
Access to fetch at 'https://backend.com/api/...' from origin 'chrome-extension://...' has been blocked by CORS policy
```

### Verify Headers

Use browser DevTools → Network tab:

1. Find the failed request
2. Click on it
3. Go to Headers tab
4. Check:
   - Request Headers: `Origin: chrome-extension://...`
   - Response Headers: Should include `Access-Control-Allow-Origin`

### Test with Postman/Insomnia

Simulate extension request:

**Postman:**

1. Create POST request to `http://localhost:3000/api/ai/generate-reply`
2. Add header: `Origin: chrome-extension://test123`
3. Add header: `Content-Type: application/json`
4. Add body (JSON):
   ```json
   {
     "message": "Test message",
     "provider": "openai",
     "apiKey": "test-key",
     "model": "gpt-4",
     "products": [],
     "policies": [],
     "tone": "professional"
   }
   ```
5. Send request
6. Check response headers for CORS headers

## Quick Checklist

Before submitting extension to Chrome Web Store:

- [ ] CORS middleware exists at `middleware.ts` in project root
- [ ] Middleware allows `chrome-extension://*` origins
- [ ] Middleware handles OPTIONS preflight requests
- [ ] Backend is deployed with middleware enabled
- [ ] Extension can successfully call all API endpoints
- [ ] No CORS errors in extension DevTools console
- [ ] Tested with unpacked extension (development)
- [ ] Tested with production backend URL

## Resources

- **CORS MDN Docs:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Chrome Extension CORS:** https://developer.chrome.com/docs/extensions/mv3/xhr/

## Support

If you encounter CORS issues:

1. Check this document first
2. Review middleware.ts configuration
3. Test with curl command above
4. Check browser DevTools console
5. Enable verbose logging in middleware
6. Contact: support@prodsync.com with error logs

---

**Last Updated:** February 3, 2026
