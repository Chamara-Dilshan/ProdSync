/**
 * Background Service Worker
 * Handles API communication, token refresh, and message routing
 */

import {
  MessageToBackground,
  MessageToPopup,
} from "../shared/messaging/messages"
import { AuthStorage } from "../shared/storage/auth-storage"
import { CacheStorage } from "../shared/storage/cache-storage"
import { APIClient, APIError } from "../shared/api/api-client"
import {
  fetchProducts,
  fetchPolicies,
  fetchUserSettings,
} from "../shared/firebase/firestore"
import { auth } from "../shared/firebase/config"
import { User } from "firebase/auth"

console.log("[ProdSync] Background service worker started")

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender, sendResponse) => {
    console.log("[ProdSync] Background received message:", message.type)

    switch (message.type) {
      case "GET_AUTH_TOKEN":
        handleGetAuthToken(sendResponse)
        return true // Keep channel open for async response

      case "REFRESH_TOKEN":
        handleRefreshToken(sendResponse)
        return true

      case "GENERATE_REPLY":
        handleGenerateReply(message.payload, sendResponse)
        return true

      case "FETCH_PRODUCTS":
        handleFetchProducts(message.payload.userId, sendResponse)
        return true

      case "FETCH_POLICIES":
        handleFetchPolicies(message.payload.userId, sendResponse)
        return true

      case "FETCH_SETTINGS":
        handleFetchSettings(message.payload.userId, sendResponse)
        return true

      case "OPEN_POPUP":
        handleOpenPopup(sendResponse)
        return true

      default:
        sendResponse({
          type: "ERROR",
          payload: { message: "Unknown message type" },
        })
        return false
    }
  }
)

/**
 * Get current auth token
 */
async function handleGetAuthToken(
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    const token = await AuthStorage.getAuthToken()
    sendResponse({
      type: "AUTH_TOKEN",
      payload: { token },
    })
  } catch (error) {
    console.error("[ProdSync] Error getting auth token:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to get auth token" },
    })
  }
}

/**
 * Refresh Firebase authentication token
 */
async function handleRefreshToken(
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    const user: User | null = auth.currentUser

    if (!user) {
      console.log("[ProdSync] No user logged in, cannot refresh token")
      sendResponse({
        type: "ERROR",
        payload: { message: "No user logged in" },
      })
      return
    }

    console.log("[ProdSync] Refreshing Firebase token...")
    const token = await user.getIdToken(true) // Force refresh
    const tokenResult = await user.getIdTokenResult()
    const expiry = new Date(tokenResult.expirationTime).getTime()

    // Store refreshed token
    await AuthStorage.setAuthData({
      token,
      expiry,
      userId: user.uid,
      email: user.email || "",
    })

    console.log("[ProdSync] Token refreshed successfully")
    sendResponse({
      type: "TOKEN_REFRESHED",
      payload: { token },
    })
  } catch (error: any) {
    console.error("[ProdSync] Error refreshing token:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: error.message || "Failed to refresh token" },
    })
  }
}

/**
 * Generate AI reply via backend API
 */
async function handleGenerateReply(
  payload: Extract<MessageToBackground, { type: "GENERATE_REPLY" }>["payload"],
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    console.log("[ProdSync] Generating reply with:", {
      provider: payload.provider,
      model: payload.model,
      tone: payload.tone,
      productsCount: payload.products.length,
      policiesCount: payload.policies.length,
    })

    const response = await APIClient.generateReply({
      message: payload.message,
      products: payload.products,
      policies: payload.policies,
      provider: payload.provider,
      model: payload.model,
      apiKey: payload.apiKey,
      tone: payload.tone,
    })

    console.log("[ProdSync] Reply generated successfully")
    sendResponse({
      type: "REPLY_GENERATED",
      payload: {
        reply: response.reply,
        provider: response.provider,
        model: response.model,
      },
    })
  } catch (error: any) {
    console.error("[ProdSync] Error generating reply:", error)

    const apiError = error as APIError
    sendResponse({
      type: "ERROR",
      payload: {
        message:
          apiError.message || "Failed to generate reply. Please try again.",
        code: apiError.code,
      },
    })
  }
}

/**
 * Fetch products from Firestore with caching
 */
async function handleFetchProducts(
  userId: string,
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    console.log("[ProdSync] Fetching products for user:", userId)

    // Try cache first
    const cachedProducts = await CacheStorage.getProducts()
    if (cachedProducts) {
      console.log("[ProdSync] Returning cached products")
      sendResponse({
        type: "PRODUCTS_FETCHED",
        payload: cachedProducts,
      })
      return
    }

    // Fetch from Firestore
    const products = await fetchProducts(userId)

    // Cache the results
    await CacheStorage.setProducts(products)

    sendResponse({
      type: "PRODUCTS_FETCHED",
      payload: products,
    })
  } catch (error: any) {
    console.error("[ProdSync] Error fetching products:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: error.message || "Failed to fetch products" },
    })
  }
}

/**
 * Fetch policies from Firestore with caching
 */
async function handleFetchPolicies(
  userId: string,
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    console.log("[ProdSync] Fetching policies for user:", userId)

    // Try cache first
    const cachedPolicies = await CacheStorage.getPolicies()
    if (cachedPolicies) {
      console.log("[ProdSync] Returning cached policies")
      sendResponse({
        type: "POLICIES_FETCHED",
        payload: cachedPolicies,
      })
      return
    }

    // Fetch from Firestore
    const policies = await fetchPolicies(userId)

    // Cache the results
    await CacheStorage.setPolicies(policies)

    sendResponse({
      type: "POLICIES_FETCHED",
      payload: policies,
    })
  } catch (error: any) {
    console.error("[ProdSync] Error fetching policies:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: error.message || "Failed to fetch policies" },
    })
  }
}

/**
 * Fetch user settings from Firestore with caching
 */
async function handleFetchSettings(
  userId: string,
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    console.log("[ProdSync] Fetching settings for user:", userId)

    // Try cache first
    const cachedSettings = await CacheStorage.getUserSettings()
    if (cachedSettings) {
      console.log("[ProdSync] Returning cached settings")
      sendResponse({
        type: "SETTINGS_FETCHED",
        payload: cachedSettings,
      })
      return
    }

    // Fetch from Firestore
    const settings = await fetchUserSettings(userId)

    if (!settings) {
      console.log("[ProdSync] No settings found for user")
      sendResponse({
        type: "ERROR",
        payload: {
          message:
            "No settings found. Please configure your API keys in the main ProdSync app.",
        },
      })
      return
    }

    // Cache the results
    await CacheStorage.setUserSettings(settings)

    sendResponse({
      type: "SETTINGS_FETCHED",
      payload: settings,
    })
  } catch (error: any) {
    console.error("[ProdSync] Error fetching settings:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: error.message || "Failed to fetch settings" },
    })
  }
}

/**
 * Open the extension popup
 * Note: In Chrome MV3, opening popup programmatically has limitations
 */
async function handleOpenPopup(
  sendResponse: (_response: MessageToPopup) => void
): Promise<void> {
  try {
    console.log("[ProdSync] Attempting to open popup...")

    // Try to open popup using chrome.action API
    if (chrome.action && chrome.action.openPopup) {
      await chrome.action.openPopup()
      console.log("[ProdSync] Popup opened successfully")
      sendResponse({
        type: "POPUP_OPENED",
        payload: { success: true },
      })
    } else {
      console.warn("[ProdSync] chrome.action.openPopup not available")
      sendResponse({
        type: "POPUP_OPENED",
        payload: { success: false },
      })
    }
  } catch (error: any) {
    console.error("[ProdSync] Error opening popup:", error)
    // Popup opening can fail if:
    // 1. User action context is lost
    // 2. Popup is already open
    // 3. Browser doesn't support the API
    sendResponse({
      type: "POPUP_OPENED",
      payload: { success: false },
    })
  }
}

/**
 * Periodic token refresh
 * Runs every 55 minutes to keep token fresh (Firebase tokens expire in 1 hour)
 */
const REFRESH_INTERVAL = 55 * 60 * 1000 // 55 minutes

setInterval(async () => {
  console.log("[ProdSync] Checking if token refresh needed...")

  const isAuth = await AuthStorage.isAuthenticated()
  if (!isAuth) {
    console.log("[ProdSync] Not authenticated, skipping refresh")
    return
  }

  // Get current auth data to check expiry
  const authData = await AuthStorage.getAuthData()
  if (!authData) {
    console.log("[ProdSync] No auth data, skipping refresh")
    return
  }

  const now = Date.now()
  const timeUntilExpiry = authData.expiry - now

  // Refresh if expiring within 10 minutes
  if (timeUntilExpiry < 10 * 60 * 1000) {
    console.log(
      "[ProdSync] Token expiring soon, refreshing... (time until expiry: " +
        Math.round(timeUntilExpiry / 60000) +
        " minutes)"
    )

    try {
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken(true)
        const tokenResult = await user.getIdTokenResult()
        const expiry = new Date(tokenResult.expirationTime).getTime()

        await AuthStorage.setAuthData({
          token,
          expiry,
          userId: user.uid,
          email: user.email || "",
        })

        console.log("[ProdSync] Token refreshed successfully in background")
      }
    } catch (error) {
      console.error("[ProdSync] Background token refresh failed:", error)
    }
  } else {
    console.log(
      "[ProdSync] Token still valid (expires in " +
        Math.round(timeUntilExpiry / 60000) +
        " minutes)"
    )
  }
}, REFRESH_INTERVAL)
