import { useEffect, useState } from "react"
import { User } from "firebase/auth"
import { signOut } from "../../shared/firebase/auth"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { sendToBackground } from "../../shared/messaging/messages"
import {
  Product,
  Policy,
  UserSettings,
} from "../../shared/storage/cache-storage"

interface GeneratorProps {
  user: User
}

type ToneType = "professional" | "friendly" | "formal" | "casual"

export default function Generator({ user }: GeneratorProps) {
  const [buyerMessage, setBuyerMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)

  // Form state
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional")

  // Reply state
  const [generatedReply, setGeneratedReply] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  useEffect(() => {
    loadBuyerMessage()
    loadUserData()
  }, [])

  async function loadBuyerMessage(): Promise<void> {
    try {
      setIsLoading(true)
      setError(null)

      // First, check if there's a pending message stored from the "Generate Reply" button
      const storage = await chrome.storage.local.get([
        "pendingMessage",
        "pendingMessageTimestamp",
      ])

      if (storage.pendingMessage && storage.pendingMessageTimestamp) {
        const messageAge = Date.now() - storage.pendingMessageTimestamp

        // Use stored message if it's less than 5 minutes old
        if (messageAge < 5 * 60 * 1000) {
          console.log("[ProdSync Popup] Using stored pending message")
          setBuyerMessage(storage.pendingMessage)

          // Clear the pending message from storage
          await chrome.storage.local.remove([
            "pendingMessage",
            "pendingMessageTimestamp",
          ])

          setIsLoading(false)
          return
        } else {
          console.log("[ProdSync Popup] Stored message expired, fetching fresh")
          // Clear expired message
          await chrome.storage.local.remove([
            "pendingMessage",
            "pendingMessageTimestamp",
          ])
        }
      }

      // If no stored message, try to extract from current page
      console.log("[ProdSync Popup] No stored message, extracting from page")

      // Get current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (!tab?.id) {
        console.warn("[ProdSync Popup] No active tab found")
        setError("No active tab found")
        setIsLoading(false)
        return
      }

      // Check if we're on an Etsy message page
      if (!tab.url?.includes("etsy.com")) {
        setError("Please navigate to an Etsy message page")
        setIsLoading(false)
        return
      }

      console.log("[ProdSync Popup] Requesting message from content script")

      // Request message from content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_CURRENT_MESSAGE",
      })

      console.log("[ProdSync Popup] Response:", response)

      if (response.type === "CURRENT_MESSAGE" && response.payload.message) {
        setBuyerMessage(response.payload.message)
        console.log("[ProdSync Popup] Buyer message loaded successfully")
      } else {
        setError("Could not extract buyer message from page")
        console.warn("[ProdSync Popup] No message found in response")
      }
    } catch (error) {
      console.error("[ProdSync Popup] Error loading buyer message:", error)
      setError("Error loading buyer message. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUserData(): Promise<void> {
    try {
      console.log("[ProdSync Popup] Loading user data...")

      // Fetch products, policies, and settings in parallel
      const [productsResponse, policiesResponse, settingsResponse] =
        await Promise.all([
          sendToBackground({
            type: "FETCH_PRODUCTS",
            payload: { userId: user.uid },
          }),
          sendToBackground({
            type: "FETCH_POLICIES",
            payload: { userId: user.uid },
          }),
          sendToBackground({
            type: "FETCH_SETTINGS",
            payload: { userId: user.uid },
          }),
        ])

      // Handle products
      if (productsResponse.type === "PRODUCTS_FETCHED") {
        setProducts(productsResponse.payload)
        console.log(
          "[ProdSync Popup] Loaded",
          productsResponse.payload.length,
          "products"
        )
      }

      // Handle policies
      if (policiesResponse.type === "POLICIES_FETCHED") {
        setPolicies(policiesResponse.payload)
        console.log(
          "[ProdSync Popup] Loaded",
          policiesResponse.payload.length,
          "policies"
        )
      }

      // Handle settings
      if (settingsResponse.type === "SETTINGS_FETCHED") {
        setSettings(settingsResponse.payload)
        setSelectedTone(settingsResponse.payload.defaultTone)
        console.log("[ProdSync Popup] Loaded user settings")
      } else if (settingsResponse.type === "ERROR") {
        console.warn(
          "[ProdSync Popup] Settings error:",
          settingsResponse.payload.message
        )
      }
    } catch (error) {
      console.error("[ProdSync Popup] Error loading user data:", error)
    }
  }

  async function handleGenerateReply(): Promise<void> {
    if (!settings) {
      setGenerationError(
        "Please configure your API keys in the main ProdSync app"
      )
      return
    }

    const apiKey = settings.apiKeys[settings.selectedProvider]
    if (!apiKey) {
      setGenerationError(
        `No API key found for ${settings.selectedProvider}. Please add it in Settings.`
      )
      return
    }

    try {
      setIsGenerating(true)
      setGenerationError(null)
      setGeneratedReply("")

      console.log("[ProdSync Popup] Generating reply...")

      // Filter selected products
      const selectedProductsData = products.filter((p) =>
        selectedProducts.includes(p.id)
      )

      // Filter active policies
      const activePolicies = policies.filter((p) => p.isActive)

      const response = await sendToBackground({
        type: "GENERATE_REPLY",
        payload: {
          message: buyerMessage,
          products: selectedProductsData,
          policies: activePolicies,
          provider: settings.selectedProvider,
          model: settings.selectedModel,
          apiKey,
          tone: selectedTone,
        },
      })

      if (response.type === "REPLY_GENERATED") {
        setGeneratedReply(response.payload.reply)
        console.log("[ProdSync Popup] Reply generated successfully")
      } else if (response.type === "ERROR") {
        setGenerationError(response.payload.message)
      }
    } catch (error: any) {
      console.error("[ProdSync Popup] Error generating reply:", error)
      setGenerationError(
        error.message || "Failed to generate reply. Please try again."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopyReply(): Promise<void> {
    try {
      await navigator.clipboard.writeText(generatedReply)
      console.log("[ProdSync Popup] Reply copied to clipboard")
    } catch (error) {
      console.error("[ProdSync Popup] Failed to copy:", error)
    }
  }

  async function handleInsertReply(): Promise<void> {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (!tab?.id) {
        console.error("[ProdSync Popup] No active tab found")
        return
      }

      // Send insert command to content script
      await chrome.tabs.sendMessage(tab.id, {
        type: "INSERT_REPLY",
        payload: { reply: generatedReply },
      })

      console.log("[ProdSync Popup] Reply insertion requested")
      // Close popup after inserting
      window.close()
    } catch (error) {
      console.error("[ProdSync Popup] Error inserting reply:", error)
    }
  }

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const toggleProduct = (productId: string): void => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <div className="extension-popup bg-background p-4 space-y-4 max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">ProdSync</h2>
          <p className="text-xs text-muted-foreground">
            {user.displayName || user.email}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {/* Buyer Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buyer Message</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center py-4">
              <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full"></div>
              <p className="ml-2 text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-2">
              <p className="text-xs text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={loadBuyerMessage}>
                Retry
              </Button>
            </div>
          ) : buyerMessage ? (
            <div className="bg-muted p-2 rounded text-xs whitespace-pre-wrap max-h-24 overflow-y-auto">
              {buyerMessage}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No message detected</p>
          )}
        </CardContent>
      </Card>

      {/* Reply Configuration */}
      {buyerMessage && !isLoading && !error && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reply Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tone Selector */}
              <div>
                <Label className="text-xs">Tone</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(
                    ["professional", "friendly", "formal", "casual"] as const
                  ).map((tone) => (
                    <Button
                      key={tone}
                      variant={selectedTone === tone ? "default" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      onClick={() => setSelectedTone(tone)}
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Product Selector */}
              {products.length > 0 && (
                <div>
                  <Label className="text-xs">
                    Products ({selectedProducts.length} selected)
                  </Label>
                  <div className="mt-1 max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                    {products.slice(0, 10).map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="rounded"
                        />
                        <span className="text-xs truncate">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReply}
                disabled={isGenerating || !settings}
                className="w-full"
                size="sm"
              >
                {isGenerating ? "Generating..." : "Generate Reply"}
              </Button>

              {generationError && (
                <p className="text-xs text-destructive">{generationError}</p>
              )}
            </CardContent>
          </Card>

          {/* Generated Reply */}
          {generatedReply && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Generated Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-2 rounded text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {generatedReply}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReply}
                    className="flex-1 text-xs"
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleInsertReply}
                    className="flex-1 text-xs"
                  >
                    Insert into Etsy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
