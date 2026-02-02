import { Storage } from "./index"
import { StorageKeys } from "./storage-keys"

export interface AuthData {
  token: string
  expiry: number // Unix timestamp
  userId: string
  email: string
}

/**
 * Auth-specific storage utilities
 * Handles Firebase authentication token storage
 */
export class AuthStorage {
  /**
   * Store authentication data
   */
  static async setAuthData(data: AuthData): Promise<void> {
    await Promise.all([
      Storage.set(StorageKeys.AUTH_TOKEN, data.token),
      Storage.set(StorageKeys.AUTH_TOKEN_EXPIRY, data.expiry),
      Storage.set(StorageKeys.USER_ID, data.userId),
      Storage.set(StorageKeys.USER_EMAIL, data.email),
    ])
  }

  /**
   * Get authentication token if valid
   * Returns null if token is expired or missing
   */
  static async getAuthToken(): Promise<string | null> {
    const token = await Storage.get<string>(StorageKeys.AUTH_TOKEN)
    const expiry = await Storage.get<number>(StorageKeys.AUTH_TOKEN_EXPIRY)

    if (!token || !expiry) {
      return null
    }

    // Check if token is expired (with 5-minute buffer)
    const now = Date.now()
    if (now >= expiry - 5 * 60 * 1000) {
      console.log("Auth token expired or expiring soon")
      return null
    }

    return token
  }

  /**
   * Get full auth data
   */
  static async getAuthData(): Promise<AuthData | null> {
    const [token, expiry, userId, email] = await Promise.all([
      Storage.get<string>(StorageKeys.AUTH_TOKEN),
      Storage.get<number>(StorageKeys.AUTH_TOKEN_EXPIRY),
      Storage.get<string>(StorageKeys.USER_ID),
      Storage.get<string>(StorageKeys.USER_EMAIL),
    ])

    if (!token || !expiry || !userId || !email) {
      return null
    }

    return { token, expiry, userId, email }
  }

  /**
   * Get user ID
   */
  static async getUserId(): Promise<string | null> {
    return Storage.get<string>(StorageKeys.USER_ID)
  }

  /**
   * Clear all authentication data
   */
  static async clearAuth(): Promise<void> {
    await Promise.all([
      Storage.remove(StorageKeys.AUTH_TOKEN),
      Storage.remove(StorageKeys.AUTH_TOKEN_EXPIRY),
      Storage.remove(StorageKeys.USER_ID),
      Storage.remove(StorageKeys.USER_EMAIL),
    ])
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken()
    return token !== null
  }
}
