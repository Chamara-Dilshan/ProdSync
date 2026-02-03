import { NextRequest, NextResponse } from "next/server"

/**
 * CORS Middleware for ProdSync API
 *
 * Allows requests from:
 * - Chrome extension (chrome-extension://* origins)
 * - Same origin (for web app)
 * - Development servers (localhost)
 *
 * This is required for the ProdSync Chrome Extension to communicate
 * with the backend API for generating AI replies.
 */
export function middleware(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin")

  // Handle preflight requests (OPTIONS method)
  if (request.method === "OPTIONS") {
    return handlePreflight(origin)
  }

  // Get response from route handler
  const response = NextResponse.next()

  // Add CORS headers to all API responses
  addCorsHeaders(response, origin)

  return response
}

/**
 * Handle CORS preflight (OPTIONS) requests
 */
function handlePreflight(origin: string | null): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  addCorsHeaders(response, origin)
  return response
}

/**
 * Add CORS headers to response based on origin
 */
function addCorsHeaders(response: NextResponse, origin: string | null): void {
  // Check if origin is allowed
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  // Set other CORS headers
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  )
  response.headers.set("Access-Control-Max-Age", "86400") // 24 hours
}

/**
 * Check if origin is allowed
 *
 * Allowed origins:
 * - Chrome extensions (chrome-extension://*)
 * - Development localhost (http://localhost:* and http://127.0.0.1:*)
 * - Production domain (configured via env)
 * - Same origin (no origin header = same origin)
 */
function isAllowedOrigin(origin: string): boolean {
  // Allow chrome-extension:// origins (for Chrome extension)
  if (origin.startsWith("chrome-extension://")) {
    return true
  }

  // Allow moz-extension:// origins (for Firefox extension, future support)
  if (origin.startsWith("moz-extension://")) {
    return true
  }

  // Allow localhost for development (any port)
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("https://localhost:") ||
    origin.startsWith("https://127.0.0.1:")
  ) {
    return true
  }

  // Allow production domain if set (e.g., https://prodsync.com)
  const allowedDomain = process.env.NEXT_PUBLIC_APP_URL
  if (allowedDomain && origin === allowedDomain) {
    return true
  }

  // Allow Vercel preview deployments
  if (origin.endsWith(".vercel.app")) {
    return true
  }

  // Reject all other origins
  return false
}

/**
 * Configure which routes this middleware applies to
 *
 * Apply to:
 * - /api/* - All API routes need CORS for extension
 *
 * Skip:
 * - /_next/* - Next.js internals
 * - /static/* - Static assets
 * - /*.* - Files with extensions (images, fonts, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/api/:path*",
  ],
}
