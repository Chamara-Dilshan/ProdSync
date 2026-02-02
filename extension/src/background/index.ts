/**
 * Background Service Worker
 * Handles API communication, token refresh, and message routing
 */

import {
  MessageToBackground,
  MessageToPopup,
} from "../shared/messaging/messages"
import { AuthStorage } from "../shared/storage/auth-storage"

console.log("ProdSync background service worker started")

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender, sendResponse) => {
    console.log("Background received message:", message.type)

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

      default:
        sendResponse({
          type: "ERROR",
          payload: { message: "Unknown message type" },
        })
        return false
    }
  }
)

async function handleGetAuthToken(
  sendResponse: (response: MessageToPopup) => void
) {
  try {
    const token = await AuthStorage.getAuthToken()
    sendResponse({
      type: "AUTH_TOKEN",
      payload: { token },
    })
  } catch (error) {
    console.error("Error getting auth token:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to get auth token" },
    })
  }
}

async function handleRefreshToken(
  sendResponse: (response: MessageToPopup) => void
) {
  try {
    // Token refresh will be implemented in Phase 2
    const token = await AuthStorage.getAuthToken()
    sendResponse({
      type: "TOKEN_REFRESHED",
      payload: { token: token || "" },
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to refresh token" },
    })
  }
}

async function handleGenerateReply(
  payload: Extract<MessageToBackground, { type: "GENERATE_REPLY" }>["payload"],
  sendResponse: (response: MessageToPopup) => void
) {
  try {
    // API call implementation coming in Phase 3
    console.log("Generate reply request:", payload)
    sendResponse({
      type: "ERROR",
      payload: { message: "API integration coming in Phase 3" },
    })
  } catch (error) {
    console.error("Error generating reply:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to generate reply" },
    })
  }
}

async function handleFetchProducts(
  userId: string,
  sendResponse: (response: MessageToPopup) => void
) {
  try {
    // Firestore fetch implementation coming in Phase 3
    console.log("Fetch products for user:", userId)
    sendResponse({
      type: "PRODUCTS_FETCHED",
      payload: [],
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to fetch products" },
    })
  }
}

async function handleFetchPolicies(
  userId: string,
  sendResponse: (response: MessageToPopup) => void
) {
  try {
    // Firestore fetch implementation coming in Phase 3
    console.log("Fetch policies for user:", userId)
    sendResponse({
      type: "POLICIES_FETCHED",
      payload: [],
    })
  } catch (error) {
    console.error("Error fetching policies:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to fetch policies" },
    })
  }
}

async function handleFetchSettings(
  userId: string,
  sendResponse: (response: MessageToPopup) => void
) {
  try {
    // Firestore fetch implementation coming in Phase 3
    console.log("Fetch settings for user:", userId)
    sendResponse({
      type: "ERROR",
      payload: { message: "Settings fetch coming in Phase 3" },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    sendResponse({
      type: "ERROR",
      payload: { message: "Failed to fetch settings" },
    })
  }
}

// Set up periodic token refresh (every 55 minutes)
const REFRESH_INTERVAL = 55 * 60 * 1000 // 55 minutes

setInterval(async () => {
  console.log("Checking token expiry...")
  const isAuth = await AuthStorage.isAuthenticated()
  if (isAuth) {
    console.log("Token is still valid")
  } else {
    console.log("Token expired or missing")
  }
}, REFRESH_INTERVAL)
