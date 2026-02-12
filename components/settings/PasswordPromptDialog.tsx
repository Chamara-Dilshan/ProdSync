"use client"

/**
 * Password Prompt Dialog
 *
 * Prompts user to enter their password for API key encryption/decryption.
 * Used when:
 * - Saving API keys for the first time (encryption)
 * - Loading encrypted API keys after login (decryption)
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock } from "lucide-react"

export interface PasswordPromptDialogProps {
  /** Whether dialog is open */
  open: boolean
  /** Callback when dialog closes */
  onClose: () => void
  /** Callback when password is submitted */
  onPasswordSubmit: (password: string) => Promise<void>
  /** Dialog title (optional) */
  title?: string
  /** Dialog description (optional) */
  description?: string
  /** Loading state during password verification */
  loading?: boolean
}

export function PasswordPromptDialog({
  open,
  onClose,
  onPasswordSubmit,
  title = "Enter Password to Encrypt API Keys",
  description = "Your API keys will be encrypted using your account password for security. You'll need to enter your password once per session to access them.",
  loading = false,
}: PasswordPromptDialogProps): JSX.Element {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    // Validate password
    if (password.length === 0) {
      setError("Password cannot be empty")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      await onPasswordSubmit(password)
      // Success - close dialog
      setPassword("")
      onClose()
    } catch (err) {
      // Error during encryption/decryption
      setError(
        err instanceof Error ? err.message : "Failed to verify password"
      )
    }
  }

  const handleClose = (): void => {
    if (!loading) {
      setPassword("")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen): void => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e): void => {
            void handleSubmit(e)
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Account Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
                autoComplete="current-password"
                className="w-full"
              />
              {error !== null && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-muted bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Why do I need to enter my password?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your API keys are encrypted using your account password
                    before being stored. This ensures only you can access them,
                    even if our database is compromised.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || password.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
