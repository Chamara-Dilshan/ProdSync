"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { Header } from "@/components/dashboard/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { MessageInput } from "@/components/messages/MessageInput"
import { ReplyPreview } from "@/components/messages/ReplyPreview"
import { ProductSelector } from "@/components/messages/ProductSelector"
import {
  getProducts,
  getPolicies,
  getUserSettings,
} from "@/lib/firebase/firestore"
import {
  Product,
  Policy,
  UserSettings,
  ToneType,
  TONE_LABELS,
  DEFAULT_SETTINGS,
} from "@/types"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getErrorMessage } from "@/types/errors"
import type { GenerateReplyResponse, ApiErrorResponse } from "@/types/api"

export default function MessagesPage(): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()

  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // Form state
  const [message, setMessage] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )
  const [tone, setTone] = useState<ToneType>("professional")

  // Generation state
  const [generatedReply, setGeneratedReply] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [lastProvider, setLastProvider] = useState("")
  const [lastModel, setLastModel] = useState("")

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (user === null) {
        return
      }
      try {
        const [productsData, policiesData, settingsData] = await Promise.all([
          getProducts(user.uid),
          getPolicies(user.uid),
          getUserSettings(user.uid),
        ])

        setProducts(productsData)
        setPolicies(policiesData.filter((p) => p.isActive))
        if (settingsData !== null) {
          setSettings(settingsData)
          setTone(settingsData.defaultTone)
        }
      } catch (error: unknown) {
        console.error("Failed to load message page data:", error)
        toast({
          variant: "destructive",
          title: "Error loading data",
          description:
            getErrorMessage(error) ??
            "Failed to load data. Please check your Firebase configuration.",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [user, toast])

  const hasApiKey =
    (settings.apiKeys[settings.selectedProvider]?.trim().length ?? 0) > 0

  const handleGenerate = async (): Promise<void> => {
    if (message.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a buyer message",
      })
      return
    }

    if (!hasApiKey) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please configure an API key in Settings",
      })
      return
    }

    setGenerating(true)
    setGeneratedReply(null)

    try {
      // Prepare context
      const contextProducts =
        selectedProductId !== null
          ? products.filter((p) => p.id === selectedProductId)
          : products.slice(0, 5) // Limit to 5 products if none selected

      const response = await fetch("/api/ai/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          products: contextProducts.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            sizes: p.sizes,
            colors: p.colors,
            careInstructions: p.careInstructions,
            customizationOptions: p.customizationOptions,
          })),
          policies: policies.map((p) => ({
            type: p.type,
            title: p.title,
            content: p.content,
          })),
          provider: settings.selectedProvider,
          model: settings.selectedModel,
          apiKey: settings.apiKeys[settings.selectedProvider],
          tone,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse
        // Create detailed error message based on error type
        let errorMessage = errorData.error ?? "Failed to generate reply"

        // Customize error messages based on error code
        if (response.status === 403 || response.status === 401) {
          errorMessage =
            errorData.error ??
            "Your API key appears to be invalid. Please check your Settings."
        } else if (response.status === 429) {
          errorMessage =
            errorData.error ??
            "You've hit the API rate limit. Please wait a moment and try again."
        } else if (response.status >= 500) {
          errorMessage =
            errorData.error ??
            "The AI service is temporarily unavailable. Please try again later."
        }

        throw new Error(errorMessage)
      }

      const data = (await response.json()) as GenerateReplyResponse
      setGeneratedReply(data.reply)
      setLastProvider(data.provider)
      setLastModel(data.model)
    } catch (error: unknown) {
      console.error("Generation error:", error)

      // Determine error title and add helpful suggestions
      let errorTitle = "Generation failed"
      const errorMsg = getErrorMessage(error)
      let errorDescription = errorMsg ?? "Failed to generate reply"

      // Add helpful suggestions based on error message
      if (
        errorMsg?.includes("Invalid API key") === true ||
        errorMsg?.includes("API key") === true
      ) {
        errorTitle = "Invalid API Key"
        errorDescription = `${errorMsg}\n\nPlease go to Settings and verify your API key is correct.`
      } else if (
        errorMsg?.includes("quota") === true ||
        errorMsg?.includes("Rate limit") === true
      ) {
        errorTitle = "Rate Limit Exceeded"
        errorDescription = `${errorMsg}\n\nTip: Wait 1-2 minutes before trying again, or consider upgrading to a paid API tier.`
      } else if (
        errorMsg?.includes("unavailable") === true ||
        errorMsg?.includes("Service") === true
      ) {
        errorTitle = "Service Unavailable"
        errorDescription = `${errorMsg}\n\nPlease try again in a few moments.`
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="Messages" description="Generate AI-powered replies" />
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Message Reply Generator"
        description="Generate professional responses to buyer messages"
      />

      <div className="p-8">
        {/* Setup Warning */}
        {!hasApiKey && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">API key required</p>
                <p className="text-sm text-yellow-700">
                  Please add an API key in Settings to generate replies.
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/settings">Go to Settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MessageInput
                  value={message}
                  onChange={setMessage}
                  disabled={generating}
                />

                <ProductSelector
                  products={products}
                  selectedProductId={selectedProductId}
                  onSelect={setSelectedProductId}
                  disabled={generating}
                />

                <div className="space-y-2">
                  <Label>Response Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={(v) => setTone(v as ToneType)}
                    disabled={generating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TONE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => {
                    void handleGenerate()
                  }}
                  disabled={generating || message.trim() === "" || !hasApiKey}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Reply
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Context Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Products</p>
                    <p className="font-medium">{products.length} available</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Policies</p>
                    <p className="font-medium">{policies.length} configured</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Provider</p>
                    <p className="font-medium capitalize">
                      {settings.selectedProvider}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium">{settings.selectedModel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div>
            {generatedReply !== null ? (
              <ReplyPreview
                reply={generatedReply}
                provider={lastProvider}
                model={lastModel}
                onRegenerate={() => {
                  void handleGenerate()
                }}
                isRegenerating={generating}
              />
            ) : (
              <Card className="h-full min-h-[300px] flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No reply generated yet
                  </h3>
                  <p className="text-sm text-gray-400">
                    Enter a buyer message and click Generate Reply
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
