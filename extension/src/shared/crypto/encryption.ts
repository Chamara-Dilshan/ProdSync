/**
 * Client-Side Encryption Utilities using Web Crypto API
 *
 * This module provides AES-256-GCM encryption for API keys before storing in Chrome Storage.
 * Uses PBKDF2 for key derivation from user password + unique salt.
 *
 * Security:
 * - AES-256-GCM (Authenticated Encryption)
 * - PBKDF2 with 100,000 iterations
 * - Random salt per user (32 bytes)
 * - Random IV per encryption (12 bytes)
 * - Derived keys never stored persistently
 */

export interface EncryptedData {
  ciphertext: string // Base64 encoded encrypted data
  iv: string // Base64 encoded initialization vector (IV)
  salt: string // Base64 encoded salt for key derivation
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EncryptionError"
  }
}

/**
 * Generate a random salt for PBKDF2 key derivation
 * @returns Base64 encoded salt (32 bytes)
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  return arrayBufferToBase64(salt)
}

/**
 * Derive an AES-256 encryption key from password + salt using PBKDF2
 * @param password - User's password
 * @param salt - Base64 encoded salt (or Uint8Array)
 * @returns CryptoKey for AES-GCM encryption/decryption
 */
export async function deriveKey(
  password: string,
  salt: string | Uint8Array
): Promise<CryptoKey> {
  if (!password || password.length === 0) {
    throw new EncryptionError("Password cannot be empty")
  }

  // Convert salt to Uint8Array if it's a string
  const saltBytes: Uint8Array =
    typeof salt === "string" ? base64ToArrayBuffer(salt) : salt

  // Encode password as UTF-8
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)

  // Import password as CryptoKey
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  // Derive AES-256 key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes as BufferSource,
      iterations: 100000, // OWASP recommendation for PBKDF2
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256, // AES-256
    },
    false, // Key not extractable (security best practice)
    ["encrypt", "decrypt"]
  )

  return derivedKey
}

/**
 * Encrypt API key using AES-256-GCM
 * @param apiKey - Plaintext API key to encrypt
 * @param password - User's password for key derivation
 * @param salt - Optional salt (generates new one if not provided)
 * @returns EncryptedData object with ciphertext, IV, and salt
 */
export async function encryptApiKey(
  apiKey: string,
  password: string,
  salt?: string
): Promise<EncryptedData> {
  if (!apiKey || apiKey.length === 0) {
    throw new EncryptionError("API key cannot be empty")
  }

  try {
    // Generate salt if not provided
    const saltToUse = salt ?? generateSalt()

    // Derive encryption key from password + salt
    const key = await deriveKey(password, saltToUse)

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 bytes for AES-GCM

    // Encrypt API key
    const encoder = new TextEncoder()
    const apiKeyBytes = encoder.encode(apiKey)

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      apiKeyBytes
    )

    // Return encrypted data
    return {
      ciphertext: arrayBufferToBase64(new Uint8Array(ciphertext)),
      iv: arrayBufferToBase64(iv),
      salt: saltToUse,
    }
  } catch (error) {
    throw new EncryptionError(
      `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Decrypt API key using AES-256-GCM
 * @param encrypted - EncryptedData object with ciphertext, IV, and salt
 * @param password - User's password for key derivation
 * @returns Decrypted plaintext API key
 */
export async function decryptApiKey(
  encrypted: EncryptedData,
  password: string
): Promise<string> {
  if (!encrypted.ciphertext || !encrypted.iv || !encrypted.salt) {
    throw new EncryptionError(
      "Invalid encrypted data: missing ciphertext, IV, or salt"
    )
  }

  try {
    // Derive decryption key from password + salt
    const key = await deriveKey(password, encrypted.salt)

    // Convert Base64 strings to Uint8Array
    const ciphertextBytes = base64ToArrayBuffer(encrypted.ciphertext)
    const ivBytes = base64ToArrayBuffer(encrypted.iv)

    // Decrypt ciphertext
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes as BufferSource,
      },
      key,
      ciphertextBytes as BufferSource
    )

    // Convert decrypted bytes to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    // Wrong password or corrupted data causes decryption failure
    if (error instanceof Error && error.message.includes("operation failed")) {
      throw new EncryptionError("Decryption failed: Invalid password")
    }

    throw new EncryptionError(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Check if a string is encrypted (JSON format)
 * @param value - String to check
 * @returns True if value appears to be encrypted JSON
 */
export function isEncrypted(value: string): boolean {
  if (!value || value.length === 0) {
    return false
  }

  // Encrypted data is JSON with ciphertext, iv, and salt fields
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    return (
      typeof parsed.ciphertext === "string" &&
      typeof parsed.iv === "string" &&
      typeof parsed.salt === "string"
    )
  } catch {
    return false
  }
}

/**
 * Encrypt multiple API keys (for all providers)
 * @param apiKeys - Object with provider keys (openai, gemini, anthropic)
 * @param password - User's password
 * @param salt - Salt for key derivation
 * @returns Object with encrypted API keys
 */
export async function encryptApiKeys(
  apiKeys: { openai?: string; gemini?: string; anthropic?: string },
  password: string,
  salt: string
): Promise<{ openai?: string; gemini?: string; anthropic?: string }> {
  const encrypted: {
    openai?: string
    gemini?: string
    anthropic?: string
  } = {}

  // Encrypt each non-empty API key
  if (apiKeys.openai && apiKeys.openai.trim().length > 0) {
    const encryptedData = await encryptApiKey(apiKeys.openai, password, salt)
    encrypted.openai = JSON.stringify(encryptedData)
  }

  if (apiKeys.gemini && apiKeys.gemini.trim().length > 0) {
    const encryptedData = await encryptApiKey(apiKeys.gemini, password, salt)
    encrypted.gemini = JSON.stringify(encryptedData)
  }

  if (apiKeys.anthropic && apiKeys.anthropic.trim().length > 0) {
    const encryptedData = await encryptApiKey(
      apiKeys.anthropic,
      password,
      salt
    )
    encrypted.anthropic = JSON.stringify(encryptedData)
  }

  return encrypted
}

/**
 * Decrypt multiple API keys (for all providers)
 * @param encryptedKeys - Object with encrypted provider keys
 * @param password - User's password
 * @returns Object with decrypted API keys
 */
export async function decryptApiKeys(
  encryptedKeys: { openai?: string; gemini?: string; anthropic?: string },
  password: string
): Promise<{ openai?: string; gemini?: string; anthropic?: string }> {
  const decrypted: {
    openai?: string
    gemini?: string
    anthropic?: string
  } = {}

  // Decrypt each encrypted API key
  if (encryptedKeys.openai && isEncrypted(encryptedKeys.openai)) {
    const encryptedData = JSON.parse(encryptedKeys.openai) as EncryptedData
    decrypted.openai = await decryptApiKey(encryptedData, password)
  } else if (encryptedKeys.openai) {
    // Plaintext (backward compatibility during migration)
    decrypted.openai = encryptedKeys.openai
  }

  if (encryptedKeys.gemini && isEncrypted(encryptedKeys.gemini)) {
    const encryptedData = JSON.parse(encryptedKeys.gemini) as EncryptedData
    decrypted.gemini = await decryptApiKey(encryptedData, password)
  } else if (encryptedKeys.gemini) {
    decrypted.gemini = encryptedKeys.gemini
  }

  if (encryptedKeys.anthropic && isEncrypted(encryptedKeys.anthropic)) {
    const encryptedData = JSON.parse(encryptedKeys.anthropic) as EncryptedData
    decrypted.anthropic = await decryptApiKey(encryptedData, password)
  } else if (encryptedKeys.anthropic) {
    decrypted.anthropic = encryptedKeys.anthropic
  }

  return decrypted
}

// ==================== Helper Functions ====================

/**
 * Convert ArrayBuffer/Uint8Array to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
