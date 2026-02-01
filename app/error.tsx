"use client"

import { useEffect } from "react"
import { AlertCircle, Home, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Global error boundary for the application.
 * This file is a Next.js convention for handling errors in the App Router.
 * It catches errors at the route level and displays a fallback UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): JSX.Element {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-20 w-20 text-destructive" />
        </div>

        <h1 className="mb-3 text-3xl font-bold">Oops! Something went wrong</h1>

        <p className="mb-6 text-muted-foreground">
          We encountered an unexpected error. Don&apos;t worry, your data is
          safe.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p className="mb-2 text-sm font-semibold text-destructive">
              Error Details (Development Only):
            </p>
            <p className="text-xs text-muted-foreground">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
