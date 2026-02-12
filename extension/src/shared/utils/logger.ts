/**
 * Centralized logging utility for ProdSync Chrome Extension
 * Provides consistent logging with prefixes, log levels, and contextual information
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Get log level from environment - default to DEBUG in development, INFO in production
const getEnvironmentLogLevel = (): LogLevel => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.MODE === "production" ? LogLevel.INFO : LogLevel.DEBUG
  }
  // Fallback for contexts without import.meta.env
  return LogLevel.DEBUG
}

const CURRENT_LOG_LEVEL = getEnvironmentLogLevel()

interface LogMetadata {
  [key: string]: unknown
}

export interface Logger {
  debug: (message: string, metadata?: LogMetadata) => void
  info: (message: string, metadata?: LogMetadata) => void
  warn: (message: string, metadata?: LogMetadata) => void
  error: (message: string, error?: Error | unknown, metadata?: LogMetadata) => void
}

/**
 * Format metadata object for console output
 */
function formatMetadata(metadata?: LogMetadata): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return ""
  }
  try {
    return " " + JSON.stringify(metadata, null, 2)
  } catch {
    return " [Unable to serialize metadata]"
  }
}

/**
 * Get error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return String(error)
}

/**
 * Format log prefix with optional module name
 */
function formatPrefix(moduleName?: string): string {
  return moduleName ? `[ProdSync:${moduleName}]` : "[ProdSync]"
}

/**
 * Create a logger instance for a specific module
 *
 * @param moduleName - Optional module name for prefixing (e.g., "Background", "Content", "Popup")
 * @returns Logger instance with debug, info, warn, error methods
 *
 * @example
 * ```typescript
 * const logger = createLogger("Background")
 * logger.info("Service worker started")
 * logger.debug("Token expiry", { expiresAt: new Date() })
 * logger.error("Failed to fetch products", error)
 * ```
 */
export function createLogger(moduleName?: string): Logger {
  const prefix = formatPrefix(moduleName)

  return {
    debug: (message: string, metadata?: LogMetadata): void => {
      if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
        const metadataStr = formatMetadata(metadata)
        console.log(`${prefix} [DEBUG] ${message}${metadataStr}`)
      }
    },

    info: (message: string, metadata?: LogMetadata): void => {
      if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
        const metadataStr = formatMetadata(metadata)
        console.log(`${prefix} ${message}${metadataStr}`)
      }
    },

    warn: (message: string, metadata?: LogMetadata): void => {
      if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
        const metadataStr = formatMetadata(metadata)
        console.warn(`${prefix} [WARN] ${message}${metadataStr}`)
      }
    },

    error: (message: string, error?: Error | unknown, metadata?: LogMetadata): void => {
      if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
        const errorMsg = error ? `: ${getErrorMessage(error)}` : ""
        const metadataStr = formatMetadata(metadata)
        console.error(`${prefix} [ERROR] ${message}${errorMsg}${metadataStr}`)

        // Log full error object if available
        if (error instanceof Error) {
          console.error(error)
        }
      }
    },
  }
}

/**
 * Default logger instance without module name
 */
export const logger = createLogger()
