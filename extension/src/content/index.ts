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

// Check if we're on an Etsy message page
const ETSY_MESSAGE_PATTERNS = [
  /^https:\/\/www\.etsy\.com\/messages\/.*/,
  /^https:\/\/www\.etsy\.com\/your\/orders\/sold.*/,
]

function isEtsyMessagePage(): boolean {
  return ETSY_MESSAGE_PATTERNS.some((pattern) =>
    pattern.test(window.location.href)
  )
}

if (isEtsyMessagePage()) {
  console.log("[ProdSync] Etsy message page detected")
  // Initialize content script and inject button
  initializeContentScript()
} else {
  console.log("[ProdSync] Not an Etsy message page, content script inactive")
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
  sendResponse: (response: MessageToPopupFromContent) => void
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
  sendResponse: (response: MessageToPopupFromContent) => void
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
 * Initialize content script and inject button
 */
async function initializeContentScript(): Promise<void> {
  try {
    console.log("[ProdSync] Initializing content script")

    // Wait for page to be fully loaded
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", resolve)
      })
    }

    // Wait a bit for React to render (Etsy is a React app)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[ProdSync] Attempting to inject button")

    // Inject the button
    const injected = await injectButton()

    if (!injected) {
      console.warn("[ProdSync] Button injection failed, will retry")
      // Retry after 3 seconds
      setTimeout(() => {
        injectButton()
      }, 3000)
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
  const observer = new MutationObserver(() => {
    // Check if our button is still in the DOM
    if (!document.getElementById("prodsync-generate-btn")) {
      console.log("[ProdSync] Button removed, re-injecting")
      injectButton()
    }
  })

  // Observe the entire document body
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  console.log("[ProdSync] Page change observer started")
}
