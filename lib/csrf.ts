/**
 * CSRF Protection Utility
 *
 * Protects API routes from Cross-Site Request Forgery (CSRF) attacks using
 * a custom header verification strategy combined with double-submit cookie pattern.
 *
 * Strategy:
 * 1. Generate a CSRF token and store in httpOnly cookie
 * 2. Require the same token in X-CSRF-Token header
 * 3. Verify both match on server side
 *
 * Why this works:
 * - Attackers can't read httpOnly cookies (XSS protection)
 * - Attackers can't set custom headers cross-origin (CORS protection)
 * - Simple, stateless, no database required
 *
 * Usage:
 * ```typescript
 * // In API route:
 * const csrfCheck = await verifyCSRF(request)
 * if (!csrfCheck.valid) {
 *   return new Response("CSRF verification failed", { status: 403 })
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// Cookie name for CSRF token
const CSRF_COOKIE_NAME = "prodsync_csrf_token"

// Header name for CSRF token
const CSRF_HEADER_NAME = "x-csrf-token"

// Token expiry (24 hours)
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCSRFToken(): string {
  return randomBytes(32).toString("base64url")
}

/**
 * CSRF verification result
 */
export interface CSRFVerificationResult {
  valid: boolean
  error?: string
  newToken?: string
}

/**
 * Check if request originates from a Chrome/Firefox extension
 *
 * Extension requests don't need CSRF protection because:
 * - CSRF exploits cookie-based auth (browser auto-sends cookies)
 * - Extensions use token-based auth (explicitly sends Bearer token)
 * - Browsers prevent web pages from spoofing extension origins
 */
export function isExtensionRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  if (!origin) {
    return false
  }
  return (
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("moz-extension://")
  )
}

/**
 * Verify CSRF token from request
 *
 * Checks that:
 * 1. CSRF token exists in cookie
 * 2. CSRF token exists in header
 * 3. Both tokens match
 *
 * @param request - Next.js request object
 * @returns Verification result with validity status
 */
export function verifyCSRF(request: NextRequest): CSRFVerificationResult {
  try {
    // Get CSRF token from cookie
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value

    // Get CSRF token from header
    const headerToken = request.headers.get(CSRF_HEADER_NAME)

    // If no cookie token exists, generate a new one (first request)
    if (!cookieToken) {
      const newToken = generateCSRFToken()
      return {
        valid: false,
        error: "CSRF token missing. A new token has been generated.",
        newToken,
      }
    }

    // Check header token exists
    if (!headerToken) {
      return {
        valid: false,
        error: "CSRF token required in X-CSRF-Token header",
      }
    }

    // Verify tokens match (constant-time comparison to prevent timing attacks)
    const tokensMatch = constantTimeCompare(cookieToken, headerToken)

    if (!tokensMatch) {
      return {
        valid: false,
        error: "CSRF token mismatch",
      }
    }

    return {
      valid: true,
    }
  } catch (error) {
    console.error("[CSRF] Verification error:", error)
    return {
      valid: false,
      error: "CSRF verification failed",
    }
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if strings match
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Set CSRF token cookie in response
 *
 * @param response - Next.js response object
 * @param token - CSRF token to set
 */
export function setCSRFCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Prevent cross-site requests
    maxAge: TOKEN_EXPIRY_MS / 1000, // 24 hours
    path: "/",
  })

  return response
}

/**
 * Generate and set a new CSRF token
 *
 * @returns Object with token and response setter function
 */
export function generateAndSetCSRFToken(): {
  token: string
  setCookie: (response: NextResponse) => NextResponse
} {
  const token = generateCSRFToken()

  return {
    token,
    setCookie: (response: NextResponse) => setCSRFCookie(response, token),
  }
}

/**
 * Create CSRF error response with new token
 *
 * @param result - CSRF verification result
 * @returns Response with 403 status and optional new token
 */
export function createCSRFErrorResponse(
  result: CSRFVerificationResult
): NextResponse {
  const response = NextResponse.json(
    {
      error: "CSRF verification failed",
      message: result.error ?? "Invalid CSRF token",
    },
    { status: 403 }
  )

  // If a new token was generated, set it in cookie
  if (result.newToken) {
    setCSRFCookie(response, result.newToken)
    // Also return token in header for client to read
    response.headers.set(CSRF_HEADER_NAME, result.newToken)
  }

  return response
}

/**
 * Get CSRF token from request (for client-side use)
 *
 * This should be called from a safe endpoint to provide the token to the client.
 *
 * @param request - Next.js request object
 * @returns CSRF token from cookie or new token if none exists
 */
export function getOrCreateCSRFToken(request: NextRequest): string {
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (existingToken) {
    return existingToken
  }

  return generateCSRFToken()
}
