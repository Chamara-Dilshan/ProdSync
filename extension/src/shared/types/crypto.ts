/**
 * Cryptography Type Definitions
 *
 * Types for API key encryption, key derivation, and secure storage.
 */

/**
 * Encrypted data structure returned by encryption functions
 */
export interface EncryptedData {
  /** Base64 encoded ciphertext */
  ciphertext: string
  /** Base64 encoded initialization vector (IV) */
  iv: string
  /** Base64 encoded salt for PBKDF2 key derivation */
  salt: string
}

/**
 * Encryption error class
 */
export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EncryptionError"
  }
}

/**
 * Password prompt dialog props
 */
export interface PasswordPromptProps {
  /** Callback when password is submitted */
  onPasswordSubmit: (password: string) => Promise<void>
  /** Dialog title */
  title?: string
  /** Dialog description */
  description?: string
  /** Loading state during password verification */
  loading?: boolean
  /** Error message to display */
  error?: string | null
  /** Callback when error state changes */
  onErrorChange?: (error: string | null) => void
}

/**
 * Encryption status for UI display
 */
export type EncryptionStatus =
  | "unencrypted" // API keys stored in plaintext
  | "encrypted" // API keys encrypted
  | "needs-password" // User needs to enter password to decrypt
  | "migration-needed" // Plaintext keys need migration to encrypted

/**
 * API key encryption metadata
 */
export interface ApiKeyEncryptionMetadata {
  /** Whether API key is encrypted */
  isEncrypted: boolean
  /** When the API key was encrypted (timestamp) */
  encryptedAt?: Date
  /** Encryption algorithm used */
  algorithm?: "AES-256-GCM"
  /** PBKDF2 iterations used */
  iterations?: number
}
