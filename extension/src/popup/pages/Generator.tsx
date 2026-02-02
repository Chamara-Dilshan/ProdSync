import { useEffect, useState } from "react"
import { User } from "firebase/auth"
import { signOut } from "../../shared/firebase/auth"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

interface GeneratorProps {
  user: User
}

export default function Generator({ user }: GeneratorProps) {
  const [buyerMessage, setBuyerMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBuyerMessage()
  }, [])

  async function loadBuyerMessage(): Promise<void> {
    try {
      setIsLoading(true)
      setError(null)

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

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <div className="extension-popup bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome, {user.displayName || user.email}
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate AI-powered replies for Etsy
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Message</CardTitle>
          <CardDescription>
            Extracted from the Etsy conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="ml-3 text-sm text-muted-foreground">
                Loading message...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={loadBuyerMessage}>
                Retry
              </Button>
            </div>
          ) : buyerMessage ? (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{buyerMessage}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Reply generation UI coming in Phase 1.4
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                No buyer message found
              </p>
              <Button variant="outline" size="sm" onClick={loadBuyerMessage}>
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
