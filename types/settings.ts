export type AIProvider = "openai" | "gemini" | "anthropic"

export type ToneType = "professional" | "friendly" | "formal" | "casual"

// Model suggestions (not constraints) - users can enter any model name
export const MODEL_SUGGESTIONS: Record<AIProvider, string[]> = {
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4-turbo-preview",
    "o1",
    "o1-mini",
  ],
  gemini: [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ],
  anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
    "claude-3-haiku-20240307",
    "claude-3-5-haiku-20241022",
  ],
}

// Default models per provider
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash",
  anthropic: "claude-3-5-sonnet-20241022",
}

export interface ApiKeys {
  openai: string
  gemini: string
  anthropic: string
}

export interface UserSettings {
  selectedProvider: AIProvider
  selectedModel: string
  defaultTone: ToneType
  apiKeys: ApiKeys
}

export const DEFAULT_SETTINGS: UserSettings = {
  selectedProvider: "openai",
  selectedModel: "gpt-4o-mini",
  defaultTone: "professional",
  apiKeys: {
    openai: "",
    gemini: "",
    anthropic: "",
  },
}

export const TONE_LABELS: Record<ToneType, string> = {
  professional: "Professional",
  friendly: "Friendly",
  formal: "Formal",
  casual: "Casual",
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  anthropic: "Anthropic Claude",
}
