/**
 * Content Script
 * Runs on Etsy message pages to detect messages and inject UI
 */

import {
  MessageToContent,
  MessageToPopupFromContent,
} from "../shared/messaging/messages"
import { injectButton, extractBuyerMessage } from "./ui-injector"
import {
  findElementWithFallback,
  insertTextIntoTextarea,
  scrollToElement,
} from "./dom-helpers"
import { TEXTAREA_SELECTORS } from "./etsy-selectors"

console.log("[ProdSync] Content script loaded on:", window.location.href)

// URL pattern matching
const ETSY_MESSAGE_PATTERNS = [
  /^https:\/\/www\.etsy\.com\/messages/,
  /^https:\/\/www\.etsy\.com\/your\/orders\/sold/,
]

/**
 * Check if we're on an individual conversation page (not inbox/list)
 * Conversation URLs have format: /messages/{conversation-id}
 * Inbox URL is just: /messages
 */
function isConversationPage(): boolean {
  const url = window.location.pathname

  // Check for conversation page patterns:
  // - /messages/{anything} where {anything} is not empty
  // - Must have content after /messages/
  const conversationPattern = /^\/messages\/.+/

  return conversationPattern.test(url)
}

function isEtsyMessagePage(): boolean {
  return ETSY_MESSAGE_PATTERNS.some((pattern) =>
    pattern.test(window.location.href)
  )
}

/**
 * Intercept History API to detect SPA navigation
 * Etsy uses pushState/replaceState to navigate without full page reload
 */
function setupUrlChangeDetection(): void {
  let lastUrl = window.location.href

  // Create a custom event for URL changes
  const urlChangeEvent = new Event("urlchange")

  // Intercept pushState
  const originalPushState = history.pushState
  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    window.dispatchEvent(urlChangeEvent)
  }

  // Intercept replaceState
  const originalReplaceState = history.replaceState
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    window.dispatchEvent(urlChangeEvent)
  }

  // Listen for popstate (back/forward navigation)
  window.addEventListener("popstate", () => {
    window.dispatchEvent(urlChangeEvent)
  })

  // Listen for our custom urlchange event
  window.addEventListener("urlchange", () => {
    const currentUrl = window.location.href
    if (currentUrl !== lastUrl) {
      console.log(`[ProdSync] URL changed: ${lastUrl} → ${currentUrl}`)
      lastUrl = currentUrl
      handleUrlChange()
    }
  })

  console.log("[ProdSync] URL change detection enabled")
}

/**
 * Handle URL changes during SPA navigation
 * Decides whether to initialize or cleanup based on new URL
 */
function handleUrlChange(): void {
  const isMessagePage = isEtsyMessagePage()
  const isConversation = isConversationPage()
  const buttonExists = document.getElementById("prodsync-generate-btn")

  if (isMessagePage && isConversation && !buttonExists) {
    // Navigated TO a conversation page - initialize
    console.log("[ProdSync] Navigated to conversation page, initializing...")
    initializeContentScript(true) // Pass true to indicate SPA navigation
  } else if ((!isMessagePage || !isConversation) && buttonExists) {
    // Navigated AWAY from conversation page - cleanup
    console.log("[ProdSync] Navigated away from conversation, cleaning up...")
    cleanupContentScript()
  } else if (isMessagePage && isConversation && buttonExists) {
    // Already on conversation page with button - check if button is still valid
    console.log("[ProdSync] Already on conversation page, verifying button...")
    verifyButtonInjection()
  }
}

// Set up URL change detection for SPA navigation
setupUrlChangeDetection()

// Initial check and initialization
if (isEtsyMessagePage() && isConversationPage()) {
  console.log("[ProdSync] Etsy conversation page detected")
  initializeContentScript()
} else if (isEtsyMessagePage()) {
  console.log(
    "[ProdSync] On Etsy messages page (inbox), waiting for conversation..."
  )
} else {
  console.log(
    "[ProdSync] Not an Etsy message page, monitoring for navigation..."
  )
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  (message: MessageToContent, _sender, sendResponse) => {
    console.log("Content script received message:", message.type)

    switch (message.type) {
      case "INSERT_REPLY":
        handleInsertReply(message.payload.reply, sendResponse)
        return true

      case "GET_CURRENT_MESSAGE":
        handleGetCurrentMessage(sendResponse)
        return true

      default:
        sendResponse({ type: "REPLY_INSERTED", payload: { success: false } })
        return false
    }
  }
)

function handleInsertReply(
  reply: string,
  sendResponse: (_response: MessageToPopupFromContent) => void
): void {
  try {
    console.log("[ProdSync] Inserting reply:", reply.substring(0, 50) + "...")

    // Find message textarea using fallback selectors
    const textarea = findElementWithFallback(
      TEXTAREA_SELECTORS
    ) as HTMLTextAreaElement

    if (!textarea) {
      console.error("[ProdSync] Could not find message textarea")
      sendResponse({
        type: "REPLY_INSERTED",
        payload: { success: false },
      })
      return
    }

    // Insert text and trigger events
    const success = insertTextIntoTextarea(textarea, reply)

    if (success) {
      // Scroll textarea into view
      scrollToElement(textarea)

      // Focus textarea
      textarea.focus()

      console.log("[ProdSync] Reply inserted successfully")
    }

    sendResponse({
      type: "REPLY_INSERTED",
      payload: { success },
    })
  } catch (error) {
    console.error("[ProdSync] Error inserting reply:", error)
    sendResponse({
      type: "REPLY_INSERTED",
      payload: { success: false },
    })
  }
}

function handleGetCurrentMessage(
  sendResponse: (_response: MessageToPopupFromContent) => void
): void {
  try {
    console.log("[ProdSync] Extracting current message")

    // Extract buyer message from the page
    const message = extractBuyerMessage()

    console.log(
      "[ProdSync] Get current message:",
      message ? "found" : "not found"
    )

    sendResponse({
      type: "CURRENT_MESSAGE",
      payload: { message },
    })
  } catch (error) {
    console.error("[ProdSync] Error getting current message:", error)
    sendResponse({
      type: "CURRENT_MESSAGE",
      payload: { message: null },
    })
  }
}

/**
 * Cleanup content script when navigating away from message pages
 */
function cleanupContentScript(): void {
  console.log("[ProdSync] Cleaning up content script")

  // Remove button if it exists
  const button = document.getElementById("prodsync-generate-btn")
  if (button) {
    button.remove()
    console.log("[ProdSync] Button removed")
  }

  // Note: MutationObserver cleanup is handled automatically when page changes
}

/**
 * Verify button is still properly injected
 * Re-inject if button exists but is not in the correct location
 */
async function verifyButtonInjection(): Promise<void> {
  const button = document.getElementById("prodsync-generate-btn")
  if (!button) {
    console.log("[ProdSync] Button not found, re-injecting...")
    await injectButton()
    return
  }

  // Check if button is still in the DOM and visible
  if (!document.body.contains(button)) {
    console.log("[ProdSync] Button not in DOM, re-injecting...")
    button.remove()
    await injectButton()
    return
  }

  console.log("[ProdSync] Button verified OK")
}

/**
 * Initialize content script and inject button
 * @param isSpaNavigation - True if called during SPA navigation (not initial page load)
 */
async function initializeContentScript(
  isSpaNavigation: boolean = false
): Promise<void> {
  try {
    console.log(
      `[ProdSync] Initializing content script (SPA: ${isSpaNavigation})`
    )

    // Wait for page to be fully loaded
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", resolve)
      })
    }

    // Wait longer for React to render during SPA navigation
    // During SPA navigation, React needs to tear down old page and render new one
    const waitTime = isSpaNavigation ? 2000 : 1000
    console.log(`[ProdSync] Waiting ${waitTime}ms for React to render...`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))

    console.log("[ProdSync] Attempting to inject button")

    // Inject the button
    const injected = await injectButton()

    if (!injected) {
      console.warn("[ProdSync] Button injection failed, will retry")
      // Retry with longer delay
      setTimeout(() => {
        console.log("[ProdSync] Retry attempt 1...")
        injectButton().then((success) => {
          if (!success) {
            // Second retry after even longer delay
            setTimeout(() => {
              console.log("[ProdSync] Retry attempt 2...")
              injectButton()
            }, 3000)
          }
        })
      }, 2000)
    }

    // Set up MutationObserver to re-inject button if page changes
    observePageChanges()
  } catch (error) {
    console.error("[ProdSync] Initialization error:", error)
  }
}

/**
 * Observe page changes and re-inject button if needed
 * Useful for single-page applications like Etsy
 */
function observePageChanges(): void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const observer = new MutationObserver(() => {
    // Debounce to avoid excessive re-injection attempts
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      // Only re-inject if we're still on a conversation page
      if (!isEtsyMessagePage() || !isConversationPage()) {
        return
      }

      // Check if our button is still in the DOM
      if (!document.getElementById("prodsync-generate-btn")) {
        console.log("[ProdSync] Button removed by DOM change, re-injecting")
        injectButton()
      }
    }, 500) // Wait 500ms after last DOM change
  })

  // Observe the entire document body
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  console.log("[ProdSync] Page change observer started")
}
