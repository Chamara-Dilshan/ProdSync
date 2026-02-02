/**
 * Storage keys for Chrome Storage API
 * All keys are prefixed with 'prodsync_' to avoid conflicts
 */
export const StorageKeys = {
  // Authentication
  AUTH_TOKEN: "prodsync_auth_token",
  AUTH_TOKEN_EXPIRY: "prodsync_auth_token_expiry",
  USER_ID: "prodsync_user_id",
  USER_EMAIL: "prodsync_user_email",

  // User Settings (cached from Firestore)
  USER_SETTINGS: "prodsync_user_settings",
  SETTINGS_LAST_SYNC: "prodsync_settings_last_sync",

  // Data Cache
  PRODUCTS_CACHE: "prodsync_products_cache",
  POLICIES_CACHE: "prodsync_policies_cache",
  CACHE_TIMESTAMP: "prodsync_cache_timestamp",

  // Extension Settings
  AUTO_DETECT: "prodsync_auto_detect",
  BUTTON_POSITION: "prodsync_button_position",

  // Session
  LAST_USED_TONE: "prodsync_last_tone",
  LAST_SELECTED_PRODUCT: "prodsync_last_product",
} as const

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys]
