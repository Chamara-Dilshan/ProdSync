/**
 * Input Sanitization Utilities
 *
 * Prevents XSS (Cross-Site Scripting) and other injection attacks by sanitizing
 * user inputs before storing or displaying them.
 *
 * Security Strategy:
 * 1. Sanitize at input (API routes) - Primary defense
 * 2. Sanitize before storage (Firestore) - Defense in depth
 * 3. Escape on display (React) - Final safety net
 *
 * Usage:
 * ```typescript
 * const cleanName = sanitizeText(userInput)
 * const cleanHtml = sanitizeHtml(richTextInput)
 * const cleanPrice = sanitizeNumber(priceInput)
 * ```
 */

import DOMPurify from "isomorphic-dompurify"
import validator from "validator"

/**
 * Maximum lengths for different input types (prevent DoS)
 */
export const MAX_LENGTHS = {
  SHORT_TEXT: 100, // Names, titles
  MEDIUM_TEXT: 500, // Descriptions, short content
  LONG_TEXT: 5000, // Policies, long descriptions
  MESSAGE: 10000, // Buyer messages, AI replies
  API_KEY: 500, // API keys (encrypted are longer)
} as const

/**
 * Sanitize plain text (removes HTML/script tags, trims whitespace)
 *
 * Use for: Product names, policy titles, user names, etc.
 *
 * @param input - Raw user input
 * @param maxLength - Maximum allowed length (default: MEDIUM_TEXT)
 * @returns Sanitized text
 */
export function sanitizeText(
  input: string | null | undefined,
  maxLength: number = MAX_LENGTHS.MEDIUM_TEXT
): string {
  if (!input) {return ""}

  // Remove null bytes (prevent null byte injection)
  let clean = input.replace(/\0/g, "")

  // Strip all HTML tags (prevents XSS)
  clean = DOMPurify.sanitize(clean, { ALLOWED_TAGS: [] })

  // Normalize whitespace
  clean = clean.replace(/\s+/g, " ").trim()

  // Truncate to max length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }

  return clean
}

/**
 * Sanitize HTML content (allows safe HTML tags, removes dangerous ones)
 *
 * Use for: Rich text content, formatted descriptions
 *
 * Allowed tags: b, i, em, strong, u, p, br, ul, ol, li, a (with safe href)
 *
 * @param input - Raw HTML input
 * @param maxLength - Maximum allowed length (default: LONG_TEXT)
 * @returns Sanitized HTML
 */
export function sanitizeHtml(
  input: string | null | undefined,
  maxLength: number = MAX_LENGTHS.LONG_TEXT
): string {
  if (!input) {return ""}

  // Remove null bytes
  let clean = input.replace(/\0/g, "")

  // Sanitize HTML with safe whitelist
  clean = DOMPurify.sanitize(clean, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })

  // Add rel="noopener noreferrer" to all links (security best practice)
  clean = clean.replace(/<a /g, '<a rel="noopener noreferrer" ')

  // Truncate to max length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }

  return clean
}

/**
 * Sanitize multiline text (preserves line breaks, removes HTML)
 *
 * Use for: Messages, policy content, descriptions
 *
 * @param input - Raw text input with line breaks
 * @param maxLength - Maximum allowed length (default: LONG_TEXT)
 * @returns Sanitized text with line breaks
 */
export function sanitizeMultilineText(
  input: string | null | undefined,
  maxLength: number = MAX_LENGTHS.LONG_TEXT
): string {
  if (!input) {return ""}

  // Remove null bytes
  let clean = input.replace(/\0/g, "")

  // Strip HTML tags but preserve line breaks
  clean = DOMPurify.sanitize(clean, { ALLOWED_TAGS: [] })

  // Normalize line breaks (CRLF → LF)
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Remove excessive line breaks (max 2 consecutive)
  clean = clean.replace(/\n{3,}/g, "\n\n")

  // Trim
  clean = clean.trim()

  // Truncate to max length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }

  return clean
}

/**
 * Sanitize number input (ensures valid number, removes non-numeric chars)
 *
 * Use for: Prices, quantities, numeric IDs
 *
 * @param input - Raw number input (string or number)
 * @param options - Validation options
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(
  input: string | number | null | undefined,
  options: {
    min?: number
    max?: number
    decimals?: number
  } = {}
): number | null {
  if (input === null || input === undefined || input === "") {return null}

  // Convert to string
  const str = String(input)

  // Check if valid number
  if (!validator.isNumeric(str, { no_symbols: false })) {
    return null
  }

  // Parse as float
  let num = parseFloat(str)

  // Check min/max
  if (options.min !== undefined && num < options.min) {return null}
  if (options.max !== undefined && num > options.max) {return null}

  // Round to specified decimals
  if (options.decimals !== undefined) {
    const factor = Math.pow(10, options.decimals)
    num = Math.round(num * factor) / factor
  }

  return num
}

/**
 * Sanitize email address
 *
 * Use for: User emails, contact forms
 *
 * @param input - Raw email input
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input) {return null}

  // Trim and lowercase
  const email = input.trim().toLowerCase()

  // Validate email format
  if (!validator.isEmail(email)) {
    return null
  }

  // Normalize (remove dots in gmail, etc.)
  return validator.normalizeEmail(email) ?? null
}

/**
 * Sanitize URL
 *
 * Use for: Website links, image URLs
 *
 * @param input - Raw URL input
 * @param options - Validation options
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(
  input: string | null | undefined,
  options: {
    requireProtocol?: boolean
    allowedProtocols?: string[]
  } = {}
): string | null {
  if (!input) {return null}

  // Trim
  const url = input.trim()

  // Check if valid URL
  const isValid = validator.isURL(url, {
    require_protocol: options.requireProtocol ?? true,
    protocols: options.allowedProtocols ?? ["http", "https"],
  })

  if (!isValid) {return null}

  return url
}

/**
 * Sanitize array of strings
 *
 * Use for: Tags, categories, lists
 *
 * @param input - Array of strings
 * @param maxLength - Maximum length per item
 * @param maxItems - Maximum number of items
 * @returns Sanitized array
 */
export function sanitizeStringArray(
  input: string[] | null | undefined,
  maxLength: number = MAX_LENGTHS.SHORT_TEXT,
  maxItems: number = 50
): string[] {
  if (!input || !Array.isArray(input)) {return []}

  return input
    .map((item) => sanitizeText(item, maxLength))
    .filter((item) => item.length > 0)
    .slice(0, maxItems)
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

/**
 * Validate and sanitize product data
 *
 * @param data - Raw product data
 * @returns Sanitized product data
 * @throws ValidationError if invalid
 */
export function sanitizeProductData(data: {
  name?: unknown
  description?: unknown
  price?: unknown
  sizes?: unknown
  colors?: unknown
  careInstructions?: unknown
  customizationOptions?: unknown
}): {
  name: string
  description: string
  price: number
  sizes: string[]
  colors: string[]
  careInstructions: string
  customizationOptions: string
} {
  // Validate name
  const name = sanitizeText(
    typeof data.name === "string" ? data.name : "",
    MAX_LENGTHS.SHORT_TEXT
  )
  if (name.length === 0) {
    throw new ValidationError("Product name is required", "name")
  }

  // Validate description
  const description = sanitizeMultilineText(
    typeof data.description === "string" ? data.description : "",
    MAX_LENGTHS.LONG_TEXT
  )

  // Validate price
  const price = sanitizeNumber(
    typeof data.price === "number" || typeof data.price === "string"
      ? data.price
      : undefined,
    { min: 0, max: 1000000, decimals: 2 }
  )
  if (price === null || price < 0) {
    throw new ValidationError("Valid price is required (0 or greater)", "price")
  }

  // Validate arrays
  const sizes = sanitizeStringArray(
    Array.isArray(data.sizes) ? data.sizes : [],
    MAX_LENGTHS.SHORT_TEXT,
    20
  )
  const colors = sanitizeStringArray(
    Array.isArray(data.colors) ? data.colors : [],
    MAX_LENGTHS.SHORT_TEXT,
    20
  )

  // Validate optional text fields
  const careInstructions = sanitizeMultilineText(
    typeof data.careInstructions === "string" ? data.careInstructions : "",
    MAX_LENGTHS.MEDIUM_TEXT
  )
  const customizationOptions = sanitizeMultilineText(
    typeof data.customizationOptions === "string" ? data.customizationOptions : "",
    MAX_LENGTHS.MEDIUM_TEXT
  )

  return {
    name,
    description,
    price,
    sizes,
    colors,
    careInstructions,
    customizationOptions,
  }
}

/**
 * Validate and sanitize policy data
 *
 * @param data - Raw policy data
 * @returns Sanitized policy data
 * @throws ValidationError if invalid
 */
export function sanitizePolicyData(data: {
  title?: unknown
  content?: unknown
}): {
  title: string
  content: string
} {
  // Validate title
  const title = sanitizeText(
    typeof data.title === "string" ? data.title : "",
    MAX_LENGTHS.SHORT_TEXT
  )
  if (title.length === 0) {
    throw new ValidationError("Policy title is required", "title")
  }

  // Validate content
  const content = sanitizeMultilineText(
    typeof data.content === "string" ? data.content : "",
    MAX_LENGTHS.LONG_TEXT
  )
  if (content.length === 0) {
    throw new ValidationError("Policy content is required", "content")
  }

  return { title, content }
}

/**
 * Validate and sanitize message text
 *
 * @param message - Raw message text
 * @returns Sanitized message
 * @throws ValidationError if invalid
 */
export function sanitizeMessage(message: unknown): string {
  const clean = sanitizeMultilineText(
    typeof message === "string" ? message : "",
    MAX_LENGTHS.MESSAGE
  )

  if (clean.length === 0) {
    throw new ValidationError("Message cannot be empty", "message")
  }

  if (clean.length < 3) {
    throw new ValidationError("Message must be at least 3 characters", "message")
  }

  return clean
}
