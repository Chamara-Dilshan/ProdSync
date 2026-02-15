/**
 * Rate Limiting Utility
 *
 * Protects API routes from abuse using Upstash Redis-backed rate limiting.
 * Falls back to in-memory rate limiting for local development.
 *
 * Usage:
 * ```typescript
 * const rateLimitResult = await rateLimit(request)
 * if (!rateLimitResult.success) {
 *   return new Response("Rate limit exceeded", { status: 429 })
 * }
 * ```
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextRequest } from "next/server"

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 10 // requests per window
const RATE_LIMIT_WINDOW = "60 s" // time window

/**
 * Initialize Upstash Redis rate limiter (production)
 */
function createUpstashRateLimiter(): Ratelimit | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (
    upstashUrl === undefined ||
    upstashUrl === "" ||
    upstashToken === undefined ||
    upstashToken === ""
  ) {
    console.warn(
      "[RateLimit] Upstash credentials not found. Rate limiting will use in-memory fallback (not suitable for production)."
    )
    return null
  }

  try {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    })

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
      analytics: true,
      prefix: "prodsync_ratelimit",
    })
  } catch (error) {
    console.error(
      "[RateLimit] Failed to initialize Upstash rate limiter:",
      error
    )
    return null
  }
}

/**
 * In-memory rate limiter (fallback for local development)
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) ?? []

    // Remove expired timestamps
    timestamps = timestamps.filter(
      (timestamp: number) => timestamp > windowStart
    )

    // Check if limit exceeded
    const success = timestamps.length < this.maxRequests
    const remaining = Math.max(
      0,
      this.maxRequests - timestamps.length - (success ? 1 : 0)
    )

    // Add current request if allowed
    if (success) {
      timestamps.push(now)
      this.requests.set(identifier, timestamps)
    }

    // Calculate reset time (when oldest request expires)
    const oldestTimestamp = timestamps.length > 0 ? timestamps[0] : now
    const reset = oldestTimestamp + this.windowMs

    return Promise.resolve({
      success,
      limit: this.maxRequests,
      remaining,
      reset: Math.ceil(reset / 1000), // Convert to seconds
    })
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs

    const entries = Array.from(this.requests.entries())
    for (const [identifier, timestamps] of entries) {
      const validTimestamps = timestamps.filter((t: number) => t > windowStart)
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validTimestamps)
      }
    }
  }
}

// Initialize rate limiter (try Upstash first, fallback to in-memory)
const upstashLimiter = createUpstashRateLimiter()
const inMemoryLimiter = new InMemoryRateLimiter(
  RATE_LIMIT_REQUESTS,
  60 * 1000 // 60 seconds in milliseconds
)

// Cleanup in-memory cache every 5 minutes
if (upstashLimiter === null) {
  setInterval(
    () => {
      inMemoryLimiter.cleanup()
    },
    5 * 60 * 1000
  )
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from request (if authenticated)
  // For now, use IP address as identifier
  const forwarded = request.headers.get("x-forwarded-for")
  const ip =
    forwarded !== null && forwarded !== ""
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip")
  return ip !== null && ip !== undefined && ip !== "" ? ip : "anonymous"
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Apply rate limiting to a request
 *
 * @param request - Next.js request object
 * @returns Rate limit result with success status and metadata
 */
export async function rateLimit(
  request: NextRequest
): Promise<RateLimitResult> {
  const identifier = getIdentifier(request)

  try {
    if (upstashLimiter !== null) {
      // Use Upstash Redis rate limiter (production)
      const result = await upstashLimiter.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    } else {
      // Use in-memory rate limiter (development fallback)
      const result = await inMemoryLimiter.limit(identifier)
      return result
    }
  } catch (error) {
    console.error("[RateLimit] Error checking rate limit:", error)
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: RATE_LIMIT_REQUESTS,
      remaining: RATE_LIMIT_REQUESTS - 1,
      reset: Math.ceil((Date.now() + 60000) / 1000),
    }
  }
}

/**
 * Create rate limit exceeded response
 *
 * @param result - Rate limit result
 * @returns Response with 429 status and retry information
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(1, result.reset - Math.floor(Date.now() / 1000))

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  )
}
