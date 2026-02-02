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
  // Message conversation area
  conversationContainer: "[data-conversation-thread]",
  messageList: "[data-message-list]",

  // Individual messages (buyer messages have specific attributes)
  messageItem: "[data-message-id]",
  buyerMessage: '[data-message-from="buyer"]', // Hypothetical - needs testing
  sellerMessage: '[data-message-from="seller"]', // Hypothetical - needs testing

  // Message textarea (where seller types reply)
  messageTextarea: 'textarea[name="message"]',
  messageTextareaAlt: '[data-testid="message-textarea"]',
  messageTextareaFallback: "textarea",

  // Submit button area (where we'll inject our button)
  messageActions: "[data-message-actions]",
  submitButton: 'button[type="submit"]',
  sendButton: "button[data-send]",

  // Message text content
  messageText: "[data-message-text]",
  messageContent: ".message-content",
  messageBody: ".message-body",
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
