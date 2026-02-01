"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { ApiKeys, PROVIDER_LABELS, AIProvider } from "@/types"

interface ApiKeyManagerProps {
  apiKeys: ApiKeys
  onChange: (keys: ApiKeys) => void
}

export function ApiKeyManager({ apiKeys, onChange }: ApiKeyManagerProps) {
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    gemini: false,
    anthropic: false,
  })

  const handleKeyChange = (provider: AIProvider, value: string) => {
    onChange({
      ...apiKeys,
      [provider]: value,
    })
  }

  const toggleVisibility = (provider: AIProvider) => {
    setShowKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }))
  }

  const isKeySet = (key: string) => key && key.trim().length > 0

  const providers: { key: AIProvider; placeholder: string; link: string }[] = [
    {
      key: "openai",
      placeholder: "sk-...",
      link: "https://platform.openai.com/api-keys",
    },
    {
      key: "gemini",
      placeholder: "AI...",
      link: "https://aistudio.google.com/app/apikey",
    },
    {
      key: "anthropic",
      placeholder: "sk-ant-...",
      link: "https://console.anthropic.com/settings/keys",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Add your API keys to enable AI-powered reply generation. Keys are
          stored securely and never shared.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {providers.map(({ key, placeholder, link }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={key}>{PROVIDER_LABELS[key]}</Label>
              <div className="flex items-center gap-2">
                {isKeySet(apiKeys[key]) ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Configured
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <X className="h-3 w-3" /> Not set
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={key}
                  type={showKeys[key] ? "text" : "password"}
                  placeholder={placeholder}
                  value={apiKeys[key]}
                  onChange={(e) => handleKeyChange(key, e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleVisibility(key)}
                >
                  {showKeys[key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {PROVIDER_LABELS[key]} Console
              </a>
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
