"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AIProvider,
  MODEL_SUGGESTIONS,
  DEFAULT_MODELS,
  ToneType,
  TONE_LABELS,
  PROVIDER_LABELS,
  ApiKeys,
} from "@/types"
import { ModelInput } from "@/components/ui/model-input"

interface ModelSelectorProps {
  selectedProvider: AIProvider
  selectedModel: string
  defaultTone: ToneType
  apiKeys: ApiKeys
  onProviderChange: (provider: AIProvider) => void
  onModelChange: (model: string) => void
  onToneChange: (tone: ToneType) => void
}

export function ModelSelector({
  selectedProvider,
  selectedModel,
  defaultTone,
  apiKeys,
  onProviderChange,
  onModelChange,
  onToneChange,
}: ModelSelectorProps) {
  const availableProviders = Object.keys(PROVIDER_LABELS) as AIProvider[]
  const modelSuggestions = MODEL_SUGGESTIONS[selectedProvider]

  const isProviderConfigured = (provider: AIProvider) =>
    apiKeys[provider] && apiKeys[provider].trim().length > 0

  const handleProviderChange = (value: string) => {
    const provider = value as AIProvider
    onProviderChange(provider)
    // Auto-select default model for the new provider
    onModelChange(DEFAULT_MODELS[provider])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>
          Choose your preferred AI provider and model for generating replies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label>AI Provider</Label>
          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableProviders.map((provider) => (
                <SelectItem
                  key={provider}
                  value={provider}
                  disabled={!isProviderConfigured(provider)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{PROVIDER_LABELS[provider]}</span>
                    {!isProviderConfigured(provider) && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (No API key)
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label>Model</Label>
          <ModelInput
            value={selectedModel}
            suggestions={modelSuggestions}
            placeholder={`e.g., ${DEFAULT_MODELS[selectedProvider]}`}
            onChange={onModelChange}
            disabled={!isProviderConfigured(selectedProvider)}
          />
          <p className="text-xs text-muted-foreground">
            Select a suggested model or type any model name (e.g., gpt-5,
            claude-opus-4.5)
          </p>
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <Label>Default Tone</Label>
          <Select
            value={defaultTone}
            onValueChange={(v) => onToneChange(v as ToneType)}
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
          <p className="text-xs text-muted-foreground">
            This sets the default tone for AI-generated responses.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
