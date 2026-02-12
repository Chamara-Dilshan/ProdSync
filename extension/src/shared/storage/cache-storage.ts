import { Storage } from "./index"
import { StorageKeys } from "./storage-keys"
import { createLogger } from "../utils/logger"

const logger = createLogger("Cache")

const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

export interface Product {
  id: string
  name: string
  description?: string
  price?: number
  currency?: string
  sizes?: string[]
  colors?: string[]
  materials?: string[]
  careInstructions?: string
  customizationOptions?: string
  processingTime?: string
  tags?: string[]
  sku?: string
  createdAt: Date
  updatedAt: Date
}

export interface Policy {
  id: string
  type:
    | "refund"
    | "shipping"
    | "cancellation"
    | "exchange"
    | "processing"
    | "custom"
  title: string
  content: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  selectedProvider: "openai" | "gemini" | "anthropic"
  selectedModel: string
  defaultTone: "professional" | "friendly" | "formal" | "casual"
  apiKeys: {
    openai: string
    gemini: string
    anthropic: string
  }
}

/**
 * Cache management for products, policies, and user settings
 */
export class CacheStorage {
  /**
   * Check if cache is still valid (not expired) for a specific user
   */
  static async isCacheValid(userId: string): Promise<boolean> {
    const key = `${StorageKeys.CACHE_TIMESTAMP}_${userId}`
    const timestamp = await Storage.get<number>(key)
    if (!timestamp) return false

    const now = Date.now()
    return now - timestamp < CACHE_TTL
  }

  /**
   * Get cached products for a specific user
   */
  static async getProducts(userId: string): Promise<Product[] | null> {
    if (!(await this.isCacheValid(userId))) {
      logger.debug("Cache miss: products cache expired or invalid", { userId })
      return null
    }
    const key = `${StorageKeys.PRODUCTS_CACHE}_${userId}`
    const products = await Storage.get<Product[]>(key)
    if (products) {
      logger.debug("Cache hit: products", { userId, count: products.length })
    }
    return products
  }

  /**
   * Set products cache for a specific user
   */
  static async setProducts(userId: string, products: Product[]): Promise<void> {
    logger.debug("Cache set: products", { userId, count: products.length, ttl: `${CACHE_TTL / 1000 / 60}min` })
    const productKey = `${StorageKeys.PRODUCTS_CACHE}_${userId}`
    const timestampKey = `${StorageKeys.CACHE_TIMESTAMP}_${userId}`
    await Storage.set(productKey, products)
    await Storage.set(timestampKey, Date.now())
  }

  /**
   * Get cached policies for a specific user
   */
  static async getPolicies(userId: string): Promise<Policy[] | null> {
    if (!(await this.isCacheValid(userId))) {
      logger.debug("Cache miss: policies cache expired or invalid", { userId })
      return null
    }
    const key = `${StorageKeys.POLICIES_CACHE}_${userId}`
    const policies = await Storage.get<Policy[]>(key)
    if (policies) {
      logger.debug("Cache hit: policies", { userId, count: policies.length })
    }
    return policies
  }

  /**
   * Set policies cache for a specific user
   */
  static async setPolicies(userId: string, policies: Policy[]): Promise<void> {
    logger.debug("Cache set: policies", { userId, count: policies.length, ttl: `${CACHE_TTL / 1000 / 60}min` })
    const policyKey = `${StorageKeys.POLICIES_CACHE}_${userId}`
    const timestampKey = `${StorageKeys.CACHE_TIMESTAMP}_${userId}`
    await Storage.set(policyKey, policies)
    await Storage.set(timestampKey, Date.now())
  }

  /**
   * Get cached user settings for a specific user
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    if (!(await this.isCacheValid(userId))) {
      logger.debug("Cache miss: settings cache expired or invalid", { userId })
      return null
    }
    const key = `${StorageKeys.USER_SETTINGS}_${userId}`
    const settings = await Storage.get<UserSettings>(key)
    if (settings) {
      logger.debug("Cache hit: settings", { userId, provider: settings.selectedProvider })
    }
    return settings
  }

  /**
   * Set user settings cache for a specific user
   */
  static async setUserSettings(userId: string, settings: UserSettings): Promise<void> {
    logger.debug("Cache set: settings", { userId, provider: settings.selectedProvider, ttl: `${CACHE_TTL / 1000 / 60}min` })
    const settingsKey = `${StorageKeys.USER_SETTINGS}_${userId}`
    const timestampKey = `${StorageKeys.CACHE_TIMESTAMP}_${userId}`
    await Storage.set(settingsKey, settings)
    await Storage.set(timestampKey, Date.now())
  }

  /**
   * Clear cache for a specific user
   */
  static async clearUserCache(userId: string): Promise<void> {
    logger.info("Clearing cache for user", { userId })
    await Promise.all([
      Storage.remove(`${StorageKeys.PRODUCTS_CACHE}_${userId}`),
      Storage.remove(`${StorageKeys.POLICIES_CACHE}_${userId}`),
      Storage.remove(`${StorageKeys.USER_SETTINGS}_${userId}`),
      Storage.remove(`${StorageKeys.CACHE_TIMESTAMP}_${userId}`),
    ])
  }

  /**
   * Clear all cache (all users) - used on logout
   */
  static async clearCache(): Promise<void> {
    logger.info("Clearing all cache")
    // Get all storage keys
    const allKeys = await chrome.storage.local.get(null)
    const cacheKeys = Object.keys(allKeys).filter(
      key => key.startsWith('prodsync_products_cache_') ||
             key.startsWith('prodsync_policies_cache_') ||
             key.startsWith('prodsync_user_settings_') ||
             key.startsWith('prodsync_cache_timestamp_')
    )

    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map(key => Storage.remove(key)))
      logger.info("Cleared cache keys", { count: cacheKeys.length })
    }
  }

  /**
   * Invalidate cache for a specific user (set timestamp to 0)
   */
  static async invalidateCache(userId: string): Promise<void> {
    logger.info("Invalidating cache for user", { userId })
    const timestampKey = `${StorageKeys.CACHE_TIMESTAMP}_${userId}`
    await Storage.set(timestampKey, 0)
  }
}
