/**
 * DOM selectors for Etsy message pages
 *
 * NOTE: These selectors are hypothetical based on common e-commerce patterns.
 * They MUST be verified and updated by inspecting the actual Etsy HTML structure.
 *
 * To find the correct selectors:
 * 1. Visit https://www.etsy.com/messages
 * 2. Open DevTools (F12) → Elements tab
 * 3. Inspect the conversation area, textarea, and buttons
 * 4. Update the selectors below with the actual values
 */

export const ETSY_SELECTORS = {
  // Message conversation area (from actual Etsy HTML)
  conversationContainer: ".msg-list-container",
  messageList: ".scrolling-message-list",

  // Individual messages
  messageItem: ".wt-rounded.wt-text-body-01",
  buyerMessage: ".wt-rounded.wt-text-body-01", // All buyer messages have these classes
  sellerMessage: ".wt-rounded.wt-text-body-01",

  // Message textarea (where seller types reply)
  messageTextarea: 'textarea[placeholder*="Type your reply"]',
  messageTextareaAlt: "textarea",
  messageTextareaFallback: "textarea.wt-input",

  // Submit button area (where we'll inject our button)
  messageActions: "form",
  submitButton: 'button[type="submit"]',
  sendButton: "button:has(svg)", // Etsy uses icon buttons

  // Message text content (actual Etsy classes from DevTools)
  messageText: ".wt-text-body-01",
  messageContent: ".wt-rounded",
  messageBody: ".wt-display-inline-block",
} as const

/**
 * Priority-ordered selector arrays for fallback strategies
 */
export const TEXTAREA_SELECTORS = [
  ETSY_SELECTORS.messageTextarea,
  ETSY_SELECTORS.messageTextareaAlt,
  ETSY_SELECTORS.messageTextareaFallback,
] as const

export const SUBMIT_BUTTON_SELECTORS = [
  ETSY_SELECTORS.submitButton,
  ETSY_SELECTORS.sendButton,
  ETSY_SELECTORS.messageActions,
] as const

export const MESSAGE_TEXT_SELECTORS = [
  ETSY_SELECTORS.messageText,
  ETSY_SELECTORS.messageContent,
  ETSY_SELECTORS.messageBody,
] as const
