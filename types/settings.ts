export type AIProvider = "openai" | "gemini" | "anthropic"

export type ToneType = "professional" | "friendly" | "formal" | "casual"

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  description?: string
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable OpenAI model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast and affordable",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "Previous generation flagship",
  },

  // Google Gemini Models
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    description: "Most capable Gemini model",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    description: "Fast and efficient",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    description: "Latest Gemini model",
  },

  // Anthropic Models
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Best for most tasks",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    description: "Most powerful Claude",
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    description: "Fast and compact",
  },
]

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
