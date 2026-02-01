import { NextRequest, NextResponse } from "next/server"
import { getAIProvider } from "@/lib/ai"
import { AIContext, AIProvider, ToneType } from "@/types"

export async function POST(request: NextRequest) {
  let provider: AIProvider | undefined
  try {
    const body = await request.json()
    const {
      message,
      products,
      policies,
      provider: providerFromBody,
      model,
      apiKey,
      tone,
    } = body as {
      message: string
      products: AIContext["products"]
      policies: AIContext["policies"]
      provider: AIProvider
      model: string
      apiKey: string
      tone: ToneType
    }
    provider = providerFromBody

    // Validate required fields
    if (!message || !provider || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: message, provider, apiKey" },
        { status: 400 }
      )
    }

    // Build context
    const context: AIContext = {
      products: products || [],
      policies: policies || [],
      tone: tone || "professional",
    }

    // Get AI provider and generate reply
    const aiProvider = getAIProvider(provider, apiKey)
    const reply = await aiProvider.generateReply(message, context, model)

    return NextResponse.json({
      reply,
      provider,
      model,
    })
  } catch (error: any) {
    console.error("AI generation error:", {
      code: error.status || error.code,
      message: error.message,
      provider,
    })

    const errorCode = error.status || error.code || 500
    const errorMessage = error.message?.toLowerCase() || ""

    // Invalid API key (authentication errors)
    if (
      errorCode === 401 ||
      errorCode === 403 ||
      errorMessage.includes("api key") ||
      errorMessage.includes("authentication")
    ) {
      return NextResponse.json(
        {
          error: `Invalid API key for ${provider}. Please check your Settings and ensure you've entered the correct key.`,
          errorCode: 403,
        },
        { status: 403 }
      )
    }

    // Rate limit - distinguish between quota and rate
    if (
      errorCode === 429 ||
      errorMessage.includes("rate") ||
      errorMessage.includes("quota")
    ) {
      // Check if it's quota exceeded (common with free-tier keys)
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("limit exceeded")
      ) {
        return NextResponse.json(
          {
            error: `API quota exceeded for ${provider}. If you're using a free-tier API key, you may have hit your daily/monthly limit. Consider upgrading your API plan or try again later.`,
            errorCode: 429,
            suggestion: "Wait 1-2 minutes or upgrade to a paid API tier",
          },
          { status: 429 }
        )
      }

      // General rate limiting
      return NextResponse.json(
        {
          error: `Rate limit exceeded for ${provider}. Please wait 1-2 minutes and try again. If this persists, you may have exceeded your API quota.`,
          errorCode: 429,
          suggestion: "Wait 1-2 minutes before trying again",
        },
        { status: 429 }
      )
    }

    // Service errors
    if (errorCode >= 500) {
      return NextResponse.json(
        {
          error: `${provider} service is temporarily unavailable. Please try again in a moment.`,
          errorCode,
        },
        { status: 503 }
      )
    }

    // Bad request errors
    if (errorCode >= 400 && errorCode < 500) {
      return NextResponse.json(
        {
          error: `Invalid request to ${provider}: ${error.message || "Please check your input and try again."}`,
          errorCode,
        },
        { status: errorCode }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: error.message || "Failed to generate reply. Please try again.",
        errorCode: 500,
      },
      { status: 500 }
    )
  }
}
