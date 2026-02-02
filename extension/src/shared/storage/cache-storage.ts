import { Storage } from "./index"
import { StorageKeys } from "./storage-keys"

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
   * Check if cache is still valid (not expired)
   */
  static async isCacheValid(): Promise<boolean> {
    const timestamp = await Storage.get<number>(StorageKeys.CACHE_TIMESTAMP)
    if (!timestamp) return false

    const now = Date.now()
    return now - timestamp < CACHE_TTL
  }

  /**
   * Get cached products
   */
  static async getProducts(): Promise<Product[] | null> {
    if (!(await this.isCacheValid())) {
      return null
    }
    return Storage.get<Product[]>(StorageKeys.PRODUCTS_CACHE)
  }

  /**
   * Set products cache
   */
  static async setProducts(products: Product[]): Promise<void> {
    await Storage.set(StorageKeys.PRODUCTS_CACHE, products)
    await Storage.set(StorageKeys.CACHE_TIMESTAMP, Date.now())
  }

  /**
   * Get cached policies
   */
  static async getPolicies(): Promise<Policy[] | null> {
    if (!(await this.isCacheValid())) {
      return null
    }
    return Storage.get<Policy[]>(StorageKeys.POLICIES_CACHE)
  }

  /**
   * Set policies cache
   */
  static async setPolicies(policies: Policy[]): Promise<void> {
    await Storage.set(StorageKeys.POLICIES_CACHE, policies)
    await Storage.set(StorageKeys.CACHE_TIMESTAMP, Date.now())
  }

  /**
   * Get cached user settings
   */
  static async getUserSettings(): Promise<UserSettings | null> {
    if (!(await this.isCacheValid())) {
      return null
    }
    return Storage.get<UserSettings>(StorageKeys.USER_SETTINGS)
  }

  /**
   * Set user settings cache
   */
  static async setUserSettings(settings: UserSettings): Promise<void> {
    await Storage.set(StorageKeys.USER_SETTINGS, settings)
    await Storage.set(StorageKeys.CACHE_TIMESTAMP, Date.now())
  }

  /**
   * Clear all cache
   */
  static async clearCache(): Promise<void> {
    await Promise.all([
      Storage.remove(StorageKeys.PRODUCTS_CACHE),
      Storage.remove(StorageKeys.POLICIES_CACHE),
      Storage.remove(StorageKeys.USER_SETTINGS),
      Storage.remove(StorageKeys.CACHE_TIMESTAMP),
    ])
  }

  /**
   * Invalidate cache (set timestamp to 0)
   */
  static async invalidateCache(): Promise<void> {
    await Storage.set(StorageKeys.CACHE_TIMESTAMP, 0)
  }
}
