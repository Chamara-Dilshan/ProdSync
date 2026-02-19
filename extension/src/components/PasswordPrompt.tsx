/**
 * Password Prompt Component
 *
 * Prompts user to enter their password for API key decryption.
 * Used when loading encrypted API keys from Firestore.
 */

import { useState, FormEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

export interface PasswordPromptProps {
  /** Callback when password is submitted */
  onPasswordSubmit: (password: string) => Promise<void>
  /** Dialog title */
  title?: string
  /** Dialog description */
  description?: string
  /** Loading state during password verification */
  loading?: boolean
}

export function PasswordPrompt({
  onPasswordSubmit,
  title = "Enter Password to Decrypt API Keys",
  description = "Your API keys are encrypted. Enter your account password to decrypt them.",
  loading = false,
}: PasswordPromptProps): JSX.Element {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent): Promise<void> => {
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
      // Success - password is correct
      setPassword("")
    } catch (err) {
      // Error during decryption
      setError(err instanceof Error ? err.message : "Failed to verify password")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="rounded-lg border border-border bg-muted p-3">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Why do I need to enter my password?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your API keys are encrypted using your account password for
                    security. Only you can decrypt them with your password.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || password.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Decrypt API Keys"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
