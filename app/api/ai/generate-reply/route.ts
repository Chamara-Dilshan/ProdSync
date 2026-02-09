import { NextRequest, NextResponse } from "next/server"
import { getAIProvider } from "@/lib/ai"
import { AIContext, AIProvider, ToneType } from "@/types"
import { getErrorCode, getErrorMessage, errorIncludes } from "@/types/errors"
import type { GenerateReplyResponse, ApiErrorResponse } from "@/types/api"

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateReplyResponse | ApiErrorResponse>> {
  let provider: AIProvider | undefined
  try {
    const body = (await request.json()) as {
      message: string
      products: AIContext["products"]
      policies: AIContext["policies"]
      provider: AIProvider
      model: string
      apiKey: string
      tone: ToneType
    }
    const {
      message,
      products,
      policies,
      provider: providerFromBody,
      model,
      apiKey,
      tone,
    } = body
    provider = providerFromBody

    // TEMPORARY: Auto-migrate deprecated models (remove after Feb 2026)
    // Users can now update models directly in Settings with flexible model input
    let modelToUse = model
    if (model === "gemini-2.0-flash") {
      modelToUse = "gemini-2.5-flash"
      // eslint-disable-next-line no-console
      console.log(
        `⚠️ Auto-migrating from deprecated model ${model} to ${modelToUse}`
      )
    }

    // Validate required fields
    if (message.length === 0 || provider.length === 0 || apiKey.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: message, provider, apiKey" },
        { status: 400 }
      )
    }

    // Build context
    const context: AIContext = {
      products: products ?? [],
      policies: policies ?? [],
      tone: tone ?? "professional",
    }

    // Get AI provider and generate reply
    const aiProvider = getAIProvider(provider, apiKey)
    const reply = await aiProvider.generateReply(message, context, modelToUse)

    return NextResponse.json<GenerateReplyResponse>({
      reply,
      provider,
      model,
    })
  } catch (error: unknown) {
    const errorCode = getErrorCode(error)
    const errorMessage = getErrorMessage(error).toLowerCase()

    // eslint-disable-next-line no-console
    console.error("AI generation error:", {
      code: errorCode,
      message: errorMessage,
      provider,
    })

    // Invalid API key (authentication errors)
    if (
      errorCode === 401 ||
      errorCode === 403 ||
      errorIncludes(error, "api key") ||
      errorIncludes(error, "authentication")
    ) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: `Invalid API key for ${provider ?? "provider"}. Please check your Settings and ensure you've entered the correct key.`,
          errorCode: 403,
        },
        { status: 403 }
      )
    }

    // Rate limit - distinguish between quota and rate
    if (
      errorCode === 429 ||
      errorIncludes(error, "rate") ||
      errorIncludes(error, "quota")
    ) {
      // Check if it's quota exceeded (common with free-tier keys)
      if (
        errorIncludes(error, "quota") ||
        errorIncludes(error, "limit exceeded")
      ) {
        return NextResponse.json<ApiErrorResponse>(
          {
            error: `API quota exceeded for ${provider ?? "provider"}. If you're using a free-tier API key, you may have hit your daily/monthly limit. Consider upgrading your API plan or try again later.`,
            errorCode: 429,
            suggestion: "Wait 1-2 minutes or upgrade to a paid API tier",
          },
          { status: 429 }
        )
      }

      // General rate limiting
      return NextResponse.json<ApiErrorResponse>(
        {
          error: `Rate limit exceeded for ${provider ?? "provider"}. Please wait 1-2 minutes and try again. If this persists, you may have exceeded your API quota.`,
          errorCode: 429,
          suggestion: "Wait 1-2 minutes before trying again",
        },
        { status: 429 }
      )
    }

    // Service errors
    if (errorCode >= 500) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: `${provider ?? "Provider"} service is temporarily unavailable. Please try again in a moment.`,
          errorCode,
        },
        { status: 503 }
      )
    }

    // Bad request errors
    if (errorCode >= 400 && errorCode < 500) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: `Invalid request to ${provider ?? "provider"}: ${errorMessage !== "" ? errorMessage : "Please check your input and try again."}`,
          errorCode,
        },
        { status: errorCode }
      )
    }

    // Generic error
    return NextResponse.json<ApiErrorResponse>(
      {
        error:
          errorMessage !== ""
            ? errorMessage
            : "Failed to generate reply. Please try again.",
        errorCode: 500,
      },
      { status: 500 }
    )
  }
}
