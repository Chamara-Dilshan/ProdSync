/**
 * API response type definitions
 */

import type { AIProvider } from "./settings"

/**
 * Response from /api/ai/generate-reply endpoint
 */
export interface GenerateReplyResponse {
  reply: string
  provider: AIProvider
  model: string
}

/**
 * Response from /api/ai/validate-key endpoint
 */
export interface ValidateKeyResponse {
  valid: boolean
  message?: string
  warning?: boolean
  errorMessage?: string
  errorCode?: number
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string
  errorCode?: number
  suggestion?: string
}
