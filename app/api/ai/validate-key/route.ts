import { NextRequest, NextResponse } from "next/server"
import { getAIProvider } from "@/lib/ai"
import { AIProvider } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, apiKey } = body as {
      provider: AIProvider
      apiKey: string
    }

    // Validate required fields
    if (!provider || !apiKey) {
      return NextResponse.json(
        {
          valid: false,
          errorMessage: "Provider and API key are required",
        },
        { status: 400 }
      )
    }

    // Validate API key format
    if (apiKey.trim().length < 10) {
      return NextResponse.json({
        valid: false,
        errorMessage:
          "API key appears to be too short. Please check and try again.",
      })
    }

    // Test the API key with a minimal request
    try {
      const aiProvider = getAIProvider(provider, apiKey)

      // Make a minimal test request
      await aiProvider.generateReply(
        "Hi",
        { products: [], policies: [], tone: "professional" },
        undefined // Use default model
      )

      return NextResponse.json({
        valid: true,
        message: `${provider} API key is valid and ready to use.`,
      })
    } catch (error: any) {
      console.error(`API key validation error for ${provider}:`, error)

      const errorCode = error.status || error.code || 500
      const errorMessage = error.message?.toLowerCase() || ""

      // Invalid API key (authentication errors)
      if (
        errorCode === 401 ||
        errorCode === 403 ||
        errorMessage.includes("api key") ||
        errorMessage.includes("authentication")
      ) {
        return NextResponse.json({
          valid: false,
          errorCode,
          errorMessage: `Invalid ${provider} API key. Please verify your key is correct and try again.`,
        })
      }

      // Rate limit during validation (likely free tier)
      if (
        errorCode === 429 ||
        errorMessage.includes("rate") ||
        errorMessage.includes("quota")
      ) {
        return NextResponse.json({
          valid: true, // Key is likely valid, just hitting limits
          warning: true,
          message: `Your ${provider} API key appears to be valid, but you're on a free tier with limited requests. Consider upgrading for better performance.`,
        })
      }

      // Network or service errors
      if (errorCode >= 500) {
        return NextResponse.json({
          valid: false,
          errorCode,
          errorMessage: `${provider} service is temporarily unavailable. Your API key may be valid, but we couldn't verify it. Please try again later.`,
        })
      }

      // Generic error
      return NextResponse.json({
        valid: false,
        errorCode,
        errorMessage: `Validation failed: ${error.message || "Unknown error"}. Please check your API key and try again.`,
      })
    }
  } catch (error: any) {
    console.error("Validation endpoint error:", error)
    return NextResponse.json(
      {
        valid: false,
        errorMessage: "An error occurred during validation. Please try again.",
      },
      { status: 500 }
    )
  }
}
