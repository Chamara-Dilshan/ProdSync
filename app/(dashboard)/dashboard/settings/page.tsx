"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { Header } from "@/components/dashboard/Header"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ApiKeyManager } from "@/components/settings/ApiKeyManager"
import { ModelSelector } from "@/components/settings/ModelSelector"
import { getUserSettings, updateUserSettings } from "@/lib/firebase/firestore"
import { UserSettings, DEFAULT_SETTINGS, AIProvider, ToneType } from "@/types"
import { Loader2, CheckCircle2 } from "lucide-react"
import { getErrorMessage } from "@/types/errors"
import type { ValidateKeyResponse } from "@/types/api"

export default function SettingsPage(): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      if (user === null) {
        return
      }
      try {
        const data = await getUserSettings(user.uid)
        if (data !== null) {
          setSettings(data)
        }
      } catch (error: unknown) {
        console.error("Failed to load settings:", error)
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description:
            getErrorMessage(error) ??
            "Failed to load settings. Please check your Firebase configuration.",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchSettings()
  }, [user, toast])

  const handleSave = async (): Promise<void> => {
    if (user === null) {
      return
    }

    setSaving(true)
    try {
      // Validate API key before saving if it has been changed
      const apiKey = settings.apiKeys[settings.selectedProvider]
      if (apiKey !== null && apiKey !== undefined && apiKey.trim().length > 0) {
        // Call validation endpoint
        const validationResponse = await fetch("/api/ai/validate-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: settings.selectedProvider,
            apiKey: apiKey,
          }),
        })

        const validationResult =
          (await validationResponse.json()) as ValidateKeyResponse

        // If validation failed, show error and don't save
        if (!validationResult.valid) {
          toast({
            variant: "destructive",
            title: "Invalid API Key",
            description:
              validationResult.errorMessage ??
              "The API key could not be validated. Please check and try again.",
          })
          setSaving(false)
          return
        }

        // If validation succeeded with warnings (e.g., free tier), show warning but allow save
        if (validationResult.warning === true) {
          toast({
            title: "API Key Validated (with warnings)",
            description:
              validationResult.message ??
              `Your ${settings.selectedProvider} API key is valid but may have limitations.`,
          })
        } else {
          // Full validation success
          toast({
            title: "API Key Validated",
            description:
              validationResult.message ??
              `Your ${settings.selectedProvider} API key is valid and ready to use.`,
          })
        }
      }

      // Save settings to Firestore
      await updateUserSettings(user.uid, settings)
      setHasChanges(false)

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error: unknown) {
      console.error("Failed to save settings:", error)
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description:
          getErrorMessage(error) ??
          "Failed to save settings. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>): void => {
    setSettings((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div>
        <Header title="Settings" description="Configure your AI preferences" />
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Settings"
        description="Configure your API keys and AI preferences"
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-3xl">
        <div className="space-y-4 md:space-y-6">
          {/* API Keys */}
          <ApiKeyManager
            apiKeys={settings.apiKeys}
            onChange={(apiKeys) => updateSettings({ apiKeys })}
          />

          {/* Model Configuration */}
          <ModelSelector
            selectedProvider={settings.selectedProvider}
            selectedModel={settings.selectedModel}
            defaultTone={settings.defaultTone}
            apiKeys={settings.apiKeys}
            onProviderChange={(provider: AIProvider) =>
              updateSettings({ selectedProvider: provider })
            }
            onModelChange={(model: string) =>
              updateSettings({ selectedModel: model })
            }
            onToneChange={(tone: ToneType) =>
              updateSettings({ defaultTone: tone })
            }
          />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                void handleSave()
              }}
              disabled={saving || !hasChanges}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating & Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validate & Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
