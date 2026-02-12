/**
 * DOM manipulation utility functions
 * Reusable helpers for interacting with Etsy page elements
 */

import { createLogger } from "../shared/utils/logger"

const logger = createLogger("DOMHelpers")

/**
 * Wait for an element to appear in the DOM
 * @param selector CSS selector to watch for
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise that resolves with the element when found
 */
export function waitForElement(
  selector: string,
  timeout = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    const existingElement = document.querySelector(selector)
    if (existingElement) {
      logger.debug("Element already exists in DOM", { selector })
      resolve(existingElement)
      return
    }

    logger.debug("Waiting for element", { selector, timeout: `${timeout}ms` })

    // Set up timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect()
      logger.warn("Element not found after timeout", {
        selector,
        timeout: `${timeout}ms`,
      })
      reject(new Error(`Timeout waiting for element: ${selector}`))
    }, timeout)

    // Set up MutationObserver to watch for element
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        clearTimeout(timeoutId)
        observer.disconnect()
        logger.debug("Element found in DOM", { selector })
        resolve(element)
      }
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

/**
 * Try multiple selectors and return the first match
 * Useful when Etsy changes their HTML structure
 * @param selectors Array of CSS selectors to try
 * @returns First matching element or null
 */
export function findElementWithFallback(
  selectors: readonly string[]
): Element | null {
  logger.debug(`Trying ${selectors.length} selectors`, {
    selectors: selectors.slice(0, 3).join(", ") + "...",
  })

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]
    const element = document.querySelector(selector)
    if (element) {
      logger.info(`Found element with selector (attempt ${i + 1}/${selectors.length})`, {
        selector,
      })
      return element
    }
    logger.debug(`Selector ${i + 1}/${selectors.length} not found`, { selector })
  }

  logger.warn("No elements found with any selector", {
    triedCount: selectors.length,
  })
  return null
}

/**
 * Extract clean text content from an element
 * Handles nested elements and trims whitespace
 * @param element DOM element to extract text from
 * @returns Extracted text or null if empty
 */
export function extractTextFromElement(element: Element): string | null {
  if (!element) return null

  // Get text content and clean it up
  const text = element.textContent || ""
  const cleaned = text.trim()

  return cleaned.length > 0 ? cleaned : null
}

/**
 * Insert text into a textarea and trigger React input events
 * This ensures React-based forms recognize the change
 * @param textarea Textarea element to insert text into
 * @param text Text to insert
 * @returns Success status
 */
export function insertTextIntoTextarea(
  textarea: HTMLTextAreaElement,
  text: string
): boolean {
  try {
    // Set the value
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, text)
    } else {
      textarea.value = text
    }

    // Trigger React input event
    const inputEvent = new Event("input", { bubbles: true })
    textarea.dispatchEvent(inputEvent)

    // Trigger change event as fallback
    const changeEvent = new Event("change", { bubbles: true })
    textarea.dispatchEvent(changeEvent)

    // Trigger focus event to ensure textarea is active
    textarea.focus()

    logger.info("Text inserted successfully", { length: text.length })
    return true
  } catch (error) {
    logger.error("Failed to insert text", error, { length: text.length })
    return false
  }
}

/**
 * Check if an element is visible in the viewport
 * @param element Element to check
 * @returns True if element is visible
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  )
}

/**
 * Find the most recent visible message element
 * @param messageElements Array of message elements
 * @returns Most recent visible message or null
 */
export function findMostRecentVisibleMessage(
  messageElements: NodeListOf<Element>
): Element | null {
  // Iterate backwards to find most recent
  for (let i = messageElements.length - 1; i >= 0; i--) {
    const message = messageElements[i]
    if (isElementVisible(message)) {
      return message
    }
  }

  return null
}

/**
 * Scroll element into view smoothly
 * @param element Element to scroll to
 */
export function scrollToElement(element: Element): void {
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  })
}
