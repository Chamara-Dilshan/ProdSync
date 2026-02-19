/**
 * UI injection logic for the "Generate Reply" button
 * Handles button creation, styling, and click events
 */

import {
  waitForElement,
  findElementWithFallback,
  extractTextFromElement,
} from "./dom-helpers"
import { TEXTAREA_SELECTORS, SUBMIT_BUTTON_SELECTORS } from "./etsy-selectors"

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
    background: #FF6600;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-right: 8px;
    box-shadow: 0 2px 6px rgba(255, 102, 0, 0.35);
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `

  // Hover effects
  button.addEventListener("mouseenter", () => {
    button.style.background = "#e65c00"
    button.style.transform = "translateY(-1px)"
    button.style.boxShadow = "0 4px 10px rgba(255, 102, 0, 0.45)"
  })

  button.addEventListener("mouseleave", () => {
    button.style.background = "#FF6600"
    button.style.transform = "translateY(0)"
    button.style.boxShadow = "0 2px 6px rgba(255, 102, 0, 0.35)"
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
    // First, find the conversation container to scope our search
    const conversationContainer = document.querySelector(
      ".scrolling-message-list"
    )

    if (!conversationContainer) {
      console.warn("[ProdSync] Conversation container not found")
      return null
    }

    // Find all message text elements ONLY within the conversation container
    const messageElements =
      conversationContainer.querySelectorAll(".wt-text-body-01")

    console.log(
      `[ProdSync] Found ${messageElements.length} message elements in conversation`
    )

    if (messageElements.length === 0) {
      console.warn("[ProdSync] No messages found in conversation")
      return null
    }

    // Iterate BACKWARDS to get the most recent message (last in list)
    for (let i = messageElements.length - 1; i >= 0; i--) {
      const message = messageElements[i]

      // Extract text from message element
      const text = extractTextFromElement(message)

      // Return first substantial message found (which is the last/most recent one)
      if (text && text.length > 10) {
        console.log(
          `[ProdSync] Extracted most recent message (index ${i}):`,
          text.substring(0, 50) + "..."
        )
        return text
      }
    }

    console.warn("[ProdSync] No substantial messages found in conversation")
    return null
  } catch (error) {
    console.error("[ProdSync] Error extracting message:", error)
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

    // Try to open popup by sending message to background script
    const response = await chrome.runtime.sendMessage({
      type: "OPEN_POPUP",
    })

    // If popup couldn't be opened automatically, show instructions
    if (response && !response.payload.success) {
      console.log(
        "[ProdSync] Auto-open failed, prompting user to click extension icon"
      )
      // Create a notification-style message
      showNotification(
        "✨ Message captured! Click the ProdSync extension icon to generate your reply."
      )
    } else {
      console.log("[ProdSync] Popup opened successfully")
    }
  } catch (error) {
    console.error("[ProdSync] Error handling button click:", error)
    // Fallback: Show instruction to user
    showNotification(
      "✨ Message captured! Click the ProdSync extension icon to generate your reply."
    )
  }
}

/**
 * Show a notification message on the page
 */
function showNotification(message: string): void {
  // Create notification element
  const notification = document.createElement("div")
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #FF6600;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
  `

  // Add animation keyframes
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)

  // Add to page
  document.body.appendChild(notification)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease-out reverse"
    setTimeout(() => {
      notification.remove()
      style.remove()
    }, 300)
  }, 5000)
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
    console.log("[ProdSync] Trying selectors:", TEXTAREA_SELECTORS)

    let textarea
    try {
      textarea = await waitForElement(TEXTAREA_SELECTORS[0], 5000)
      console.log("[ProdSync] Found textarea with primary selector")
    } catch {
      console.log("[ProdSync] Primary selector failed, trying fallbacks...")
      textarea = findElementWithFallback(TEXTAREA_SELECTORS)
    }

    if (!textarea) {
      console.error("[ProdSync] ❌ Could not find textarea with any selector")
      console.log(
        "[ProdSync] Available textareas on page:",
        document.querySelectorAll("textarea").length
      )
      return false
    }

    console.log("[ProdSync] ✓ Textarea found, looking for submit button...")
    console.log("[ProdSync] Trying selectors:", SUBMIT_BUTTON_SELECTORS)

    // Find submit button or message actions area
    const submitButton = findElementWithFallback(SUBMIT_BUTTON_SELECTORS)

    if (!submitButton) {
      console.error("[ProdSync] ❌ Could not find submit button area")
      console.log(
        "[ProdSync] Available buttons on page:",
        document.querySelectorAll("button").length
      )
      // Try to find any button with text "Send"
      const sendButtons = Array.from(
        document.querySelectorAll("button")
      ).filter((btn) => btn.textContent?.trim().toLowerCase() === "send")
      console.log("[ProdSync] Buttons with 'Send' text:", sendButtons.length)
      return false
    }

    console.log("[ProdSync] ✓ Submit button found")

    // Create and inject our button
    const button = createGenerateButton()

    // Attach click handler
    button.addEventListener("click", handleGenerateButtonClick)

    // Insert before submit button
    if (submitButton.parentElement) {
      submitButton.parentElement.insertBefore(button, submitButton)
      console.log("[ProdSync] ✓ Button inserted before submit button")
    } else {
      // Fallback: insert after submit button
      submitButton.after(button)
      console.log("[ProdSync] ✓ Button inserted after submit button")
    }

    console.log("[ProdSync] ✅ Generate button injected successfully")
    return true
  } catch (error) {
    console.error("[ProdSync] ❌ Failed to inject button:", error)
    console.log("[ProdSync] Page URL:", window.location.href)
    console.log("[ProdSync] Document ready state:", document.readyState)
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
