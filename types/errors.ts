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

/**
 * Extract Firebase error code from an unknown error
 * Firebase errors have a `code` string property (e.g. "auth/invalid-credential")
 */
function getFirebaseCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  ) {
    return (error as Record<string, string>).code
  }
  return null
}

const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential":
    "The email or password you entered is incorrect. Please check your details and try again.",
  "auth/user-not-found":
    "No account found with this email address. Please check your email or sign up.",
  "auth/wrong-password":
    "Incorrect password. Please try again or use 'Forgot password?' to reset it.",
  "auth/invalid-email":
    "The email address is not valid. Please enter a correct email.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/too-many-requests":
    "Too many failed attempts. Please wait a moment and try again.",
  "auth/network-request-failed":
    "Network error. Please check your internet connection and try again.",
  "auth/email-already-in-use":
    "An account with this email already exists. Please sign in instead.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
  "auth/cancelled-popup-request":
    "Only one sign-in popup can be open at a time.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
}

/**
 * Get a user-friendly message for Firebase Auth errors.
 * Falls back to the raw error message if no mapping exists.
 */
export function getFirebaseAuthError(error: unknown): string {
  const code = getFirebaseCode(error)
  if (code !== null && code in FIREBASE_AUTH_ERRORS) {
    return FIREBASE_AUTH_ERRORS[code] ?? getErrorMessage(error)
  }
  return getErrorMessage(error)
}
