/**
 * Message types for cross-context communication
 * Between popup, content script, and background worker
 */

import { Product, Policy, UserSettings } from "../storage/cache-storage"

// ============ Popup → Background ============

export type MessageToBackground =
  | {
      type: "GENERATE_REPLY"
      payload: {
        message: string
        products: Product[]
        policies: Policy[]
        provider: "openai" | "gemini" | "anthropic"
        model: string
        apiKey: string
        tone: "professional" | "friendly" | "formal" | "casual"
      }
    }
  | {
      type: "FETCH_PRODUCTS"
      payload: { userId: string }
    }
  | {
      type: "FETCH_POLICIES"
      payload: { userId: string }
    }
  | {
      type: "FETCH_SETTINGS"
      payload: { userId: string }
    }
  | {
      type: "REFRESH_TOKEN"
    }
  | {
      type: "GET_AUTH_TOKEN"
    }

// ============ Background → Popup ============

export type MessageToPopup =
  | {
      type: "REPLY_GENERATED"
      payload: {
        reply: string
        provider: string
        model: string
      }
    }
  | {
      type: "PRODUCTS_FETCHED"
      payload: Product[]
    }
  | {
      type: "POLICIES_FETCHED"
      payload: Policy[]
    }
  | {
      type: "SETTINGS_FETCHED"
      payload: UserSettings
    }
  | {
      type: "ERROR"
      payload: {
        message: string
        code?: number
      }
    }
  | {
      type: "TOKEN_REFRESHED"
      payload: { token: string }
    }
  | {
      type: "AUTH_TOKEN"
      payload: { token: string | null }
    }

// ============ Popup → Content Script ============

export type MessageToContent =
  | {
      type: "INSERT_REPLY"
      payload: { reply: string }
    }
  | {
      type: "GET_CURRENT_MESSAGE"
    }

// ============ Content Script → Popup ============

export type MessageToPopupFromContent =
  | {
      type: "MESSAGE_DETECTED"
      payload: { message: string }
    }
  | {
      type: "REPLY_INSERTED"
      payload: { success: boolean }
    }
  | {
      type: "CURRENT_MESSAGE"
      payload: { message: string | null }
    }

// ============ Helper Types ============

export type Message =
  | MessageToBackground
  | MessageToPopup
  | MessageToContent
  | MessageToPopupFromContent

/**
 * Send message to background script
 */
export function sendToBackground(
  message: MessageToBackground
): Promise<MessageToPopup> {
  return chrome.runtime.sendMessage(message)
}

/**
 * Send message to content script
 */
export async function sendToContent(
  tabId: number,
  message: MessageToContent
): Promise<MessageToPopupFromContent> {
  return chrome.tabs.sendMessage(tabId, message)
}

/**
 * Send message to popup (from background)
 */
export function sendToPopup(message: MessageToPopup): Promise<void> {
  return chrome.runtime.sendMessage(message)
}
