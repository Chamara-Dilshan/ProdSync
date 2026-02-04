/**
 * Error handling utilities for type-safe error management
 */

/**
 * Standard error interface for API errors
 */
export interface ApiError {
  message: string
  code?: number
  status?: number
  provider?: string
}

/**
 * Type guard to check if an unknown error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

/**
 * Safely extract error message from unknown error
 * @param error - Unknown error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unknown error occurred"
}

/**
 * Safely extract error code from unknown error
 * @param error - Unknown error object
 * @returns HTTP status code or 500 as default
 */
export function getErrorCode(error: unknown): number {
  if (isApiError(error)) {
    return error.code ?? error.status ?? 500
  }
  return 500
}

/**
 * Check if error message contains a specific string
 * @param error - Unknown error object
 * @param searchString - String to search for in error message
 * @returns True if error message includes search string
 */
export function errorIncludes(error: unknown, searchString: string): boolean {
  const message = getErrorMessage(error).toLowerCase()
  return message.includes(searchString.toLowerCase())
}
