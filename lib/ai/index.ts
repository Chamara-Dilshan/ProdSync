import { OpenAIProvider } from "./providers/openai"
import { GeminiProvider } from "./providers/gemini"
import { AnthropicProvider } from "./providers/anthropic"
import { AIContext, AIProvider as AIProviderType } from "@/types"

export interface AIProviderInterface {
  generateReply(
    message: string,
    context: AIContext,
    model?: string
  ): Promise<string>
}

export function getAIProvider(
  provider: AIProviderType,
  apiKey: string
): AIProviderInterface {
  switch (provider) {
    case "openai":
      return new OpenAIProvider(apiKey)
    case "gemini":
      return new GeminiProvider(apiKey)
    case "anthropic":
      return new AnthropicProvider(apiKey)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

export function validateApiKey(
  provider: AIProviderType,
  apiKey: string
): boolean {
  if (!apiKey || apiKey.trim() === "") {
    return false
  }

  switch (provider) {
    case "openai":
      return apiKey.startsWith("sk-")
    case "gemini":
      return apiKey.length > 20
    case "anthropic":
      return apiKey.startsWith("sk-ant-")
    default:
      return false
  }
}
