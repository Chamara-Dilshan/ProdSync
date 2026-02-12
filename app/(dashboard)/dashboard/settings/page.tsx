"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { useEncryption } from "@/lib/context/EncryptionContext"
import { useCSRF } from "@/lib/context/CSRFContext"
import { Header } from "@/components/dashboard/Header"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ApiKeyManager } from "@/components/settings/ApiKeyManager"
import { ModelSelector } from "@/components/settings/ModelSelector"
import { PasswordPromptDialog } from "@/components/settings/PasswordPromptDialog"
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton"
import { getUserSettings, updateUserSettings } from "@/lib/firebase/firestore"
import { getEncryptionSalt } from "@/lib/firebase/auth"
import { UserSettings, DEFAULT_SETTINGS, AIProvider, ToneType } from "@/types"
import { Loader2, CheckCircle2 } from "lucide-react"
import { getErrorMessage } from "@/types/errors"
import type { ValidateKeyResponse } from "@/types/api"
import {
  encryptApiKeys,
  decryptApiKeys,
  deriveKey,
  isEncrypted,
} from "@/lib/crypto/encryption"

export default function SettingsPage(): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const { getCSRFHeaders } = useCSRF()
  const { salt, setSalt, derivedKey, setDerivedKey } = useEncryption()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordDialogLoading, setPasswordDialogLoading] = useState(false)
  const [passwordDialogPurpose, setPasswordDialogPurpose] = useState<
    "encrypt" | "decrypt"
  >("encrypt")
  const [pendingEncryptedSettings, setPendingEncryptedSettings] =
    useState<UserSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      if (user === null) {
        return
      }
      try {
        // Fetch encryption salt if not already loaded
        if (salt === null) {
          const fetchedSalt = await getEncryptionSalt(user.uid)
          if (fetchedSalt !== null) {
            setSalt(fetchedSalt)
          }
        }

        const data = await getUserSettings(user.uid)
        if (data !== null) {
          // Check if any API keys are encrypted
          const hasEncryptedKeys =
            isEncrypted(data.apiKeys.openai ?? "") ||
            isEncrypted(data.apiKeys.gemini ?? "") ||
            isEncrypted(data.apiKeys.anthropic ?? "")

          if (hasEncryptedKeys && derivedKey === null) {
            // Keys are encrypted but we don't have derived key - prompt for password
            setPendingEncryptedSettings(data)
            setPasswordDialogPurpose("decrypt")
            setShowPasswordDialog(true)
          } else if (hasEncryptedKeys && derivedKey !== null) {
            // Keys are encrypted and we have derived key - decrypt them
            const decryptedKeys = await decryptApiKeys(
              data.apiKeys,
              "" // Password not needed, will use salt from encrypted data
            )
            setSettings({ ...data, apiKeys: decryptedKeys })
          } else {
            // Keys are plaintext (backward compatibility)
            setSettings(data)
          }
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
  }, [user, toast, salt, setSalt, derivedKey])

  const handleSave = async (): Promise<void> => {
    if (user === null || salt === null) {
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
          headers: {
            "Content-Type": "application/json",
            ...getCSRFHeaders(),
          },
          credentials: "include",
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

      // Check if any API keys have been set
      const hasApiKeys =
        (settings.apiKeys.openai?.trim().length ?? 0) > 0 ||
        (settings.apiKeys.gemini?.trim().length ?? 0) > 0 ||
        (settings.apiKeys.anthropic?.trim().length ?? 0) > 0

      if (hasApiKeys && derivedKey === null) {
        // API keys need to be encrypted - prompt for password
        setSaving(false) // Reset saving state while waiting for password
        setPasswordDialogPurpose("encrypt")
        setShowPasswordDialog(true)
        // proceedWithSave will be called from handlePasswordSubmit
        return // Exit early, will continue after password
      } else if (hasApiKeys && derivedKey !== null) {
        // We have derived key - encrypt directly
        const encryptedKeys = await encryptApiKeys(
          settings.apiKeys,
          "", // Password not needed, using derivedKey
          salt
        )

        const encryptedSettings: UserSettings = {
          ...settings,
          apiKeys: encryptedKeys,
        }

        await updateUserSettings(user.uid, encryptedSettings)
        setHasChanges(false)

        toast({
          title: "Settings saved",
          description:
            "Your settings have been encrypted and saved successfully.",
        })
        setSaving(false)
      } else {
        // No API keys - save settings as-is
        await updateUserSettings(user.uid, settings)
        setHasChanges(false)

        toast({
          title: "Settings saved",
          description: "Your settings have been updated successfully.",
        })
        setSaving(false)
      }
    } catch (error: unknown) {
      console.error("Failed to save settings:", error)
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description:
          getErrorMessage(error) ??
          "Failed to save settings. Please try again.",
      })
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>): void => {
    setSettings((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handlePasswordSubmit = async (password: string): Promise<void> => {
    if (user === null || salt === null) {
      throw new Error("User or salt not available")
    }

    setPasswordDialogLoading(true)
    try {
      // Derive encryption key from password + salt
      const key = await deriveKey(password, salt)
      setDerivedKey(key)

      if (passwordDialogPurpose === "decrypt" && pendingEncryptedSettings !== null) {
        // Decrypt the pending settings
        const decryptedKeys = await decryptApiKeys(
          pendingEncryptedSettings.apiKeys,
          password
        )
        setSettings({ ...pendingEncryptedSettings, apiKeys: decryptedKeys })
        setPendingEncryptedSettings(null)

        toast({
          title: "API Keys Decrypted",
          description: "Your API keys have been decrypted successfully.",
        })
      } else if (passwordDialogPurpose === "encrypt") {
        // Continue with save process (encryption will happen in proceedWithSave)
        await proceedWithSave(password)
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to process password"
      )
    } finally {
      setPasswordDialogLoading(false)
    }
  }

  const proceedWithSave = async (password: string): Promise<void> => {
    if (user === null || salt === null) {
      return
    }

    try {
      // Encrypt API keys before saving
      const encryptedKeys = await encryptApiKeys(
        settings.apiKeys,
        password,
        salt
      )

      const encryptedSettings: UserSettings = {
        ...settings,
        apiKeys: encryptedKeys,
      }

      // Save encrypted settings to Firestore
      await updateUserSettings(user.uid, encryptedSettings)
      setHasChanges(false)

      toast({
        title: "Settings saved",
        description:
          "Your settings have been encrypted and saved successfully.",
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

  if (loading) {
    return (
      <div>
        <Header title="Settings" description="Configure your AI preferences" />
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-3xl">
          <SettingsSkeleton />
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

      {/* Password Prompt Dialog */}
      <PasswordPromptDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onPasswordSubmit={handlePasswordSubmit}
        title={
          passwordDialogPurpose === "encrypt"
            ? "Enter Password to Encrypt API Keys"
            : "Enter Password to Decrypt API Keys"
        }
        description={
          passwordDialogPurpose === "encrypt"
            ? "Your API keys will be encrypted using your account password for security. You'll need to enter your password once per session to access them."
            : "Your API keys are encrypted. Please enter your account password to decrypt and view them."
        }
        loading={passwordDialogLoading}
      />
    </div>
  )
}
