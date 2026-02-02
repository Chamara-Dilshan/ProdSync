/**
 * Type-safe Chrome Storage wrapper
 * Provides get/set/remove methods with proper typing
 */

export class Storage {
  /**
   * Get a value from Chrome Storage
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key)
      return result[key] !== undefined ? (result[key] as T) : null
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error)
      return null
    }
  }

  /**
   * Set a value in Chrome Storage
   */
  static async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error)
      throw error
    }
  }

  /**
   * Remove a value from Chrome Storage
   */
  static async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key)
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error)
      throw error
    }
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear()
    } catch (error) {
      console.error("Failed to clear storage:", error)
      throw error
    }
  }

  /**
   * Get multiple values at once
   */
  static async getMultiple<T extends Record<string, unknown>>(
    keys: string[]
  ): Promise<Partial<T>> {
    try {
      const result = await chrome.storage.local.get(keys)
      return result as Partial<T>
    } catch (error) {
      console.error("Failed to get multiple storage keys:", error)
      return {}
    }
  }
}

export { StorageKeys } from "./storage-keys"
export { AuthStorage } from "./auth-storage"
export { CacheStorage } from "./cache-storage"
