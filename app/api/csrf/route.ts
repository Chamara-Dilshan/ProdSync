/**
 * CSRF Token API Endpoint
 *
 * Provides CSRF tokens to authenticated clients.
 * This endpoint is safe to call and generates/returns a CSRF token.
 *
 * GET /api/csrf - Get CSRF token
 */

import { NextRequest, NextResponse } from "next/server"
import { getOrCreateCSRFToken, setCSRFCookie } from "@/lib/csrf"

// Force dynamic rendering (cookies are dynamic)
export const dynamic = "force-dynamic"

export function GET(request: NextRequest): NextResponse {
  try {
    // Get or create CSRF token
    const token = getOrCreateCSRFToken(request)

    // Create response with token
    const response = NextResponse.json({
      token,
      message: "CSRF token generated successfully",
    })

    // Set token in httpOnly cookie
    setCSRFCookie(response, token)

    return response
  } catch (error) {
    console.error("[CSRF API] Error generating token:", error)
    return NextResponse.json(
      {
        error: "Failed to generate CSRF token",
      },
      { status: 500 }
    )
  }
}
