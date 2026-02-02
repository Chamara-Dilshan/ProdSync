/**
 * UI injection logic for the "Generate Reply" button
 * Handles button creation, styling, and click events
 */

import {
  waitForElement,
  findElementWithFallback,
  extractTextFromElement,
  findMostRecentVisibleMessage,
} from "./dom-helpers"
import {
  ETSY_SELECTORS,
  TEXTAREA_SELECTORS,
  SUBMIT_BUTTON_SELECTORS,
  MESSAGE_TEXT_SELECTORS,
} from "./etsy-selectors"

const BUTTON_ID = "prodsync-generate-btn"

/**
 * Create the "Generate Reply" button element
 * @returns Button element with styling and hover effects
 */
export function createGenerateButton(): HTMLButtonElement {
  const button = document.createElement("button")
  button.id = BUTTON_ID
  button.textContent = "✨ Generate Reply with ProdSync"
  button.type = "button" // Prevent form submission

  // Inline styles (can't use external CSS in content script)
  button.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-right: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `

  // Hover effects
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)"
    button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)"
  })

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)"
    button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"
  })

  return button
}

/**
 * Extract buyer message from the Etsy conversation
 * Uses multiple strategies to find the most recent buyer message
 * @returns Buyer message text or null if not found
 */
export function extractBuyerMessage(): string | null {
  try {
    // Strategy 1: Look for most recent buyer message using specific selector
    const buyerMessages = document.querySelectorAll(ETSY_SELECTORS.buyerMessage)

    if (buyerMessages.length > 0) {
      const lastMessage = findMostRecentVisibleMessage(buyerMessages)
      if (lastMessage) {
        const textElement = findElementWithFallback([
          ...MESSAGE_TEXT_SELECTORS,
        ]) as Element | null
        if (textElement) {
          const text = extractTextFromElement(textElement)
          if (text) {
            console.log("[ProdSync] Strategy 1: Found buyer message")
            return text
          }
        }

        // Fallback: extract from message element directly
        const text = extractTextFromElement(lastMessage)
        if (text) {
          console.log("[ProdSync] Strategy 1 (fallback): Found buyer message")
          return text
        }
      }
    }

    // Strategy 2: Find all messages and filter by role/attributes
    const allMessages = document.querySelectorAll(ETSY_SELECTORS.messageItem)

    if (allMessages.length > 0) {
      // Reverse iterate to get most recent
      for (let i = allMessages.length - 1; i >= 0; i--) {
        const message = allMessages[i]

        // Check if it's from buyer (not seller)
        const isSeller =
          message.getAttribute("data-is-seller") === "true" ||
          message.getAttribute("data-from") === "seller" ||
          message.classList.contains("seller-message")

        if (!isSeller) {
          const text = extractTextFromElement(message)
          if (text) {
            console.log("[ProdSync] Strategy 2: Found buyer message")
            return text
          }
        }
      }
    }

    // Strategy 3: Fallback - get all text from conversation
    const conversationContainer = document.querySelector(
      ETSY_SELECTORS.conversationContainer
    )

    if (conversationContainer) {
      const text = extractTextFromElement(conversationContainer)
      if (text) {
        console.log("[ProdSync] Strategy 3 (fallback): Using conversation text")
        // Return first 500 characters to avoid overwhelming the popup
        return text.substring(0, 500)
      }
    }

    console.warn("[ProdSync] Could not extract buyer message")
    return null
  } catch (error) {
    console.error("[ProdSync] Error extracting buyer message:", error)
    return null
  }
}

/**
 * Handle button click event
 * Extracts message and triggers popup to open
 */
async function handleGenerateButtonClick(): Promise<void> {
  try {
    console.log("[ProdSync] Generate button clicked")

    // Extract current buyer message
    const message = extractBuyerMessage()

    if (!message) {
      alert(
        "Could not find buyer message. Please ensure you are viewing a conversation."
      )
      return
    }

    // Store message temporarily in Chrome Storage
    await chrome.storage.local.set({
      pendingMessage: message,
      pendingMessageTimestamp: Date.now(),
    })

    console.log("[ProdSync] Message stored, opening popup")

    // Open popup by sending message to background script
    // The background script will handle opening the popup window
    chrome.runtime.sendMessage({
      type: "OPEN_POPUP",
    })
  } catch (error) {
    console.error("[ProdSync] Error handling button click:", error)
    alert("Error opening ProdSync. Please try again.")
  }
}

/**
 * Inject the "Generate Reply" button into the Etsy page
 * @returns Promise that resolves to true if injection succeeded
 */
export async function injectButton(): Promise<boolean> {
  try {
    // Check if button already exists
    const existingButton = document.getElementById(BUTTON_ID)
    if (existingButton) {
      console.log("[ProdSync] Button already injected")
      return true
    }

    // Wait for message textarea to appear (indicates message form is ready)
    console.log("[ProdSync] Waiting for textarea...")
    await waitForElement(TEXTAREA_SELECTORS[0], 5000).catch(() => {
      // If primary selector fails, try fallbacks
      return findElementWithFallback(TEXTAREA_SELECTORS)
    })

    // Find submit button or message actions area
    const submitButton = findElementWithFallback(SUBMIT_BUTTON_SELECTORS)

    if (!submitButton) {
      console.error("[ProdSync] Could not find submit button area")
      return false
    }

    // Create and inject our button
    const button = createGenerateButton()

    // Attach click handler
    button.addEventListener("click", handleGenerateButtonClick)

    // Insert before submit button
    if (submitButton.parentElement) {
      submitButton.parentElement.insertBefore(button, submitButton)
    } else {
      // Fallback: insert after submit button
      submitButton.after(button)
    }

    console.log("[ProdSync] Generate button injected successfully")
    return true
  } catch (error) {
    console.error("[ProdSync] Failed to inject button", error)
    return false
  }
}

/**
 * Remove the injected button from the page
 */
export function removeButton(): void {
  const button = document.getElementById(BUTTON_ID)
  if (button) {
    button.remove()
    console.log("[ProdSync] Button removed")
  }
}
