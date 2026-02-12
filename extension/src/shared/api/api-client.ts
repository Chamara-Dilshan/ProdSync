/**
 * API Client for ProdSync Backend
 * Handles all HTTP requests to the main application API
 */

import { createLogger } from "../utils/logger"
import { AuthStorage } from "../storage/auth-storage"
import { Product, Policy } from "../storage/cache-storage"

const logger = createLogger("API")

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

export interface APIError {
  message: string
  code?: number
  suggestion?: string
}

export interface GenerateReplyRequest {
  message: string
  products: Product[]
  policies: Policy[]
  provider: "openai" | "gemini" | "anthropic"
  model: string
  apiKey: string
  tone: "professional" | "friendly" | "formal" | "casual"
}

export interface GenerateReplyResponse {
  reply: string
  provider: string
  model: string
}

/**
 * API Client class with authentication handling
 */
export class APIClient {
  /**
   * Make authenticated request to backend
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await AuthStorage.getAuthToken()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    // Add auth token if available (for future authenticated endpoints)
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const url = `${BACKEND_URL}${endpoint}`

    logger.info(`${options.method || "GET"} ${url}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Unknown error occurred",
        }))

        const apiError: APIError = {
          message:
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`,
          code: response.status,
          suggestion: errorData.suggestion,
        }

        logger.error("API request failed", undefined, {
          status: response.status,
          statusText: response.statusText,
          message: apiError.message,
          suggestion: apiError.suggestion,
        })
        throw apiError
      }

      const data = await response.json()
      return data as T
    } catch (error: any) {
      // Network errors or fetch failures
      if (error.message && error.code) {
        // Already formatted as APIError
        throw error
      }

      // Generic network error
      const apiError: APIError = {
        message:
          error.message || "Network error. Please check your connection.",
        code: 0,
      }
      logger.error("Network error", error, {
        message: apiError.message,
      })
      throw apiError
    }
  }

  /**
   * Generate AI reply to buyer message
   */
  static async generateReply(
    request: GenerateReplyRequest
  ): Promise<GenerateReplyResponse> {
    return this.makeRequest<GenerateReplyResponse>("/api/ai/generate-reply", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Validate API key for a provider
   */
  static async validateApiKey(
    provider: "openai" | "gemini" | "anthropic",
    apiKey: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await this.makeRequest<{ valid: boolean }>(
        "/api/ai/validate-key",
        {
          method: "POST",
          body: JSON.stringify({ provider, apiKey }),
        }
      )
      return response
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || "Validation failed",
      }
    }
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ status: string }> {
    try {
      return this.makeRequest<{ status: string }>("/api/health", {
        method: "GET",
      })
    } catch {
      return { status: "unavailable" }
    }
  }
}
