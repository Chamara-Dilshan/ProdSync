import { useEffect, useState, useRef } from "react"
import { User } from "firebase/auth"
import { signOut } from "../../shared/firebase/auth"
import { createLogger } from "../../shared/utils/logger"
import { cn } from "../../shared/utils/cn"

const logger = createLogger("GeneratorPopup")
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
import { PasswordPrompt } from "../../components/PasswordPrompt"
import { isEncrypted, decryptApiKeys } from "../../shared/crypto/encryption"
import { getEncryptionSalt } from "../../shared/firebase/firestore"

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

  // Encryption state
  const [needsPassword, setNeedsPassword] = useState(false)
  const [encryptionSalt, setEncryptionSalt] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)

  // Track userId changes for cache invalidation
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    loadBuyerMessage()
    loadUserData()
  }, [])

  // Detect userId changes and clear old user's cache
  useEffect(() => {
    if (user && prevUserIdRef.current && prevUserIdRef.current !== user.uid) {
      logger.info("User changed, invalidating old cache", {
        oldUserId: prevUserIdRef.current,
        newUserId: user.uid,
      })
      chrome.runtime.sendMessage({
        type: "CLEAR_USER_CACHE",
        payload: { userId: prevUserIdRef.current },
      })
    }
    prevUserIdRef.current = user ? user.uid : null
  }, [user])

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
        const fetchedSettings = settingsResponse.payload
        setSettings(fetchedSettings)
        setSelectedTone(fetchedSettings.defaultTone)
        logger.info("Loaded user settings")

        // Check if any API keys are encrypted
        const hasEncryptedKeys =
          (fetchedSettings.apiKeys.openai &&
            isEncrypted(fetchedSettings.apiKeys.openai)) ||
          (fetchedSettings.apiKeys.gemini &&
            isEncrypted(fetchedSettings.apiKeys.gemini)) ||
          (fetchedSettings.apiKeys.anthropic &&
            isEncrypted(fetchedSettings.apiKeys.anthropic))

        if (hasEncryptedKeys) {
          logger.info("API keys are encrypted, fetching salt")
          // Fetch encryption salt
          const salt = await getEncryptionSalt(user.uid)
          if (salt) {
            setEncryptionSalt(salt)
            setNeedsPassword(true)
            logger.info("Salt fetched, prompting for password")
          } else {
            logger.error("Failed to fetch encryption salt")
            setError(
              "Failed to fetch encryption data. Please try again or re-configure API keys in the main app."
            )
          }
        } else {
          logger.info("API keys are not encrypted (plaintext)")
        }
      } else if (settingsResponse.type === "ERROR") {
        logger.warn("Settings error", {
          message: settingsResponse.payload.message,
        })
      }
    } catch (error) {
      logger.error("Error loading user data", error)
    }
  }

  async function handlePasswordSubmit(password: string): Promise<void> {
    if (!settings || !encryptionSalt) {
      throw new Error("Settings or salt not available")
    }

    try {
      setIsDecrypting(true)
      logger.info("Decrypting API keys")

      // Decrypt API keys
      const decryptedKeys = await decryptApiKeys(settings.apiKeys, password)

      // Update settings with decrypted keys (provide defaults for optional properties)
      setSettings({
        ...settings,
        apiKeys: {
          openai: decryptedKeys.openai ?? "",
          gemini: decryptedKeys.gemini ?? "",
          anthropic: decryptedKeys.anthropic ?? "",
        },
      })

      logger.info("API keys decrypted successfully")
      setNeedsPassword(false)
    } catch (error) {
      logger.error("Failed to decrypt API keys", error)
      throw new Error("Invalid password or decryption failed")
    } finally {
      setIsDecrypting(false)
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

  // Show password prompt if API keys are encrypted
  if (needsPassword) {
    return (
      <div className="extension-popup bg-background max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <div className="flex items-center gap-0.5">
              <span className="text-base font-bold text-primary">Prod</span>
              <span className="text-base font-bold">Sync</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {user.displayName ?? user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="p-4">
          <PasswordPrompt
            onPasswordSubmit={handlePasswordSubmit}
            title="Enter Password to Decrypt API Keys"
            description="Your API keys are encrypted. Enter your account password to decrypt them."
            loading={isDecrypting}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="extension-popup bg-background max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <div className="flex items-center gap-0.5">
            <span className="text-base font-bold text-primary">Prod</span>
            <span className="text-base font-bold">Sync</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {user.displayName ?? user.email}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Buyer Message */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              💬 Buyer Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center py-3">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full flex-shrink-0"></div>
                <p className="ml-2 text-xs text-muted-foreground">
                  Finding buyer message...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-2">
                <p className="text-xs text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={loadBuyerMessage}>
                  Retry
                </Button>
              </div>
            ) : buyerMessage ? (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 text-xs text-gray-700 whitespace-pre-wrap max-h-24 overflow-y-auto leading-relaxed">
                {buyerMessage}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No message detected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Reply Configuration */}
        {buyerMessage && !isLoading && !error && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  ⚙️ Reply Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Tone Selector */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tone
                  </Label>
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {(
                      ["professional", "friendly", "formal", "casual"] as const
                    ).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
                          selectedTone === tone
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary hover:text-primary"
                        )}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Selector */}
                {products.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      Products
                      {selectedProducts.length > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                          {selectedProducts.length}
                        </span>
                      )}
                    </Label>
                    <div className="mt-1.5 max-h-32 overflow-y-auto border rounded-lg divide-y">
                      {products.slice(0, 10).map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-orange-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            className="rounded accent-orange-500 flex-shrink-0"
                          />
                          <span className="text-xs truncate text-foreground">
                            {product.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReply}
                  disabled={isGenerating || !settings}
                  className="w-full font-medium"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate Reply</>
                  )}
                </Button>

                {generationError && (
                  <p className="text-xs text-destructive">{generationError}</p>
                )}
              </CardContent>
            </Card>

            {/* Generated Reply */}
            {generatedReply && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="text-green-600">✓</span> Reply Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
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
                      className="flex-1 text-xs font-medium"
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
    </div>
  )
}
