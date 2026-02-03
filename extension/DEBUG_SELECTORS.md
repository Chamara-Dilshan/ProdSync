# Debug Extension Message Extraction

## Problem

The extension cannot extract the buyer message from the Etsy page, showing "Error loading buyer message".

## Step-by-Step Debugging

### Step 1: Verify Content Script is Running

1. Open the Etsy messages page in Chrome: https://www.etsy.com/messages
2. Navigate to an actual conversation (you should see the buyer's message)
3. Press **F12** to open DevTools
4. Go to the **Console** tab
5. Look for these logs:
   - `[ProdSync] Content script loaded on: https://www.etsy.com/messages/...`
   - `[ProdSync] Etsy message page detected`
   - `[ProdSync] Initializing content script`

**If you DON'T see these logs:**

- The content script is not loading
- Go to `chrome://extensions`
- Find ProdSync extension
- Click **Reload** button
- Refresh the Etsy page and check Console again

### Step 2: Inspect the DOM Structure

With DevTools open on the Etsy page, **copy and paste this entire script** into the Console and press Enter:

```javascript
// ProdSync Selector Debugger
console.clear()
console.log("=== ProdSync Selector Debugger ===\n")

// Find all potential message containers
console.log("1. Looking for message containers...")
const msgContainers = [
  ".msg-list-container",
  ".scrolling-message-list",
  '[class*="message"]',
  '[class*="conversation"]',
  "[data-message]",
]

msgContainers.forEach((selector) => {
  const found = document.querySelectorAll(selector)
  if (found.length > 0) {
    console.log(`✅ Found ${found.length} elements with: ${selector}`)
  }
})

// Find all text elements with .wt-text-body-01
console.log("\n2. Looking for message text elements...")
const textElements = document.querySelectorAll(".wt-text-body-01")
console.log(`Found ${textElements.length} elements with .wt-text-body-01`)

if (textElements.length > 0) {
  console.log("\nFirst 5 text elements:")
  Array.from(textElements)
    .slice(0, 5)
    .forEach((el, i) => {
      const text = el.textContent?.trim().substring(0, 50)
      console.log(`  ${i + 1}. "${text}..."`)
      console.log(`     Classes: ${el.className}`)
      console.log(`     Parent classes: ${el.parentElement?.className}`)
    })
}

// Find textarea
console.log("\n3. Looking for message textarea...")
const textareas = document.querySelectorAll("textarea")
console.log(`Found ${textareas.length} textarea(s)`)

textareas.forEach((ta, i) => {
  console.log(`  Textarea ${i + 1}:`)
  console.log(`    Placeholder: "${ta.placeholder}"`)
  console.log(`    Name: "${ta.name}"`)
  console.log(`    ID: "${ta.id}"`)
  console.log(`    Classes: ${ta.className}`)
})

// Find the actual buyer message
console.log("\n4. Searching for buyer message text...")
const allText = Array.from(document.querySelectorAll("*"))
  .filter((el) => {
    const text = el.textContent?.trim()
    return (
      text && text.length > 20 && text.length < 500 && el.children.length === 0
    ) // Only leaf nodes
  })
  .map((el) => ({
    text: el.textContent?.trim().substring(0, 80),
    tag: el.tagName.toLowerCase(),
    classes: el.className,
    id: el.id,
  }))
  .slice(0, 10)

console.log("Potential message elements:")
allText.forEach((item, i) => {
  console.log(`\n  ${i + 1}. ${item.tag}.${item.classes}`)
  console.log(`     "${item.text}..."`)
})

console.log("\n=== Debugger Complete ===")
console.log("Copy the output above and share it for selector updates.")
```

**This script will:**

- Find all message containers
- List all text elements with `.wt-text-body-01` class
- Find all textareas (for reply insertion)
- Show potential message elements with their CSS selectors

### Step 3: Analyze the Output

After running the script, you'll see output like:

```
✅ Found 3 elements with: .msg-list-container
Found 25 elements with .wt-text-body-01

First 5 text elements:
  1. "Hello my friend, I'm just wondering if you could..."
     Classes: wt-text-body-01 wt-rounded
     Parent classes: message-bubble buyer-message
```

**Look for:**

1. Which selector actually contains the buyer message text?
2. What are the unique classes or attributes?
3. Does the textarea have the placeholder "Type your reply"?

### Step 4: Test Message Extraction

Once you identify the correct selector (let's say it's `.message-bubble`), test extraction:

```javascript
// Test extraction
const messageElement = document.querySelector(".message-bubble") // Replace with your selector
if (messageElement) {
  console.log("Found message:", messageElement.textContent.trim())
} else {
  console.log("❌ Selector not found")
}
```

### Step 5: Update the Selectors

Based on your findings, update `extension/src/content/etsy-selectors.ts`:

```typescript
export const ETSY_SELECTORS = {
  // Update these with the actual selectors you found:
  conversationContainer: ".msg-list-container", // From Step 2
  buyerMessage: ".message-bubble.buyer-message", // From Step 2
  messageTextarea: 'textarea[placeholder="Type your reply"]', // From Step 2
  // ... etc
}
```

### Step 6: Rebuild and Test

```bash
cd extension
npm run build
```

Then:

1. Go to `chrome://extensions`
2. Click **Reload** on ProdSync extension
3. Refresh the Etsy page
4. Click the "Generate Reply with ProdSync" button
5. Check if the message loads in the popup

## Common Issues

### Issue 1: Content Script Not Loading

**Solution:** Check `manifest.json` content_scripts matches property. Should include:

```json
"matches": ["https://www.etsy.com/messages/*"]
```

### Issue 2: Button Doesn't Appear

**Solution:** The submit button selector is wrong. Use the debugger to find the actual button selector.

### Issue 3: Message Extraction Returns null

**Solution:** The `.wt-text-body-01` selector might be too generic. Look for more specific classes like:

- `.message-text`
- `.buyer-message-text`
- `[data-message-id]`

## Next Steps

After finding the correct selectors:

1. Share the debugger output
2. Update `etsy-selectors.ts`
3. Rebuild extension
4. Test the full flow (button click → popup opens → message appears)
