/**
 * Content Script
 * Runs on Etsy message pages to detect messages and inject UI
 */

import {
  MessageToContent,
  MessageToPopupFromContent,
} from "../shared/messaging/messages"

console.log("ProdSync content script loaded on:", window.location.href)

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
  console.log("ProdSync: Etsy message page detected")
  // DOM manipulation and button injection coming in Phase 2
} else {
  console.log("ProdSync: Not an Etsy message page, content script inactive")
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
) {
  try {
    // Reply insertion implementation coming in Phase 2
    console.log("Insert reply:", reply)
    sendResponse({
      type: "REPLY_INSERTED",
      payload: { success: false },
    })
  } catch (error) {
    console.error("Error inserting reply:", error)
    sendResponse({
      type: "REPLY_INSERTED",
      payload: { success: false },
    })
  }
}

function handleGetCurrentMessage(
  sendResponse: (response: MessageToPopupFromContent) => void
) {
  try {
    // Message extraction implementation coming in Phase 2
    console.log("Get current message")
    sendResponse({
      type: "CURRENT_MESSAGE",
      payload: { message: null },
    })
  } catch (error) {
    console.error("Error getting current message:", error)
    sendResponse({
      type: "CURRENT_MESSAGE",
      payload: { message: null },
    })
  }
}
