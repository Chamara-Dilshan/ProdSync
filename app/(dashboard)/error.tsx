"use client"

import { useEffect } from "react"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Error boundary for the dashboard routes.
 * This catches errors within the dashboard and provides a more contextual error UI.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): JSX.Element {
  useEffect(() => {
    console.error("Dashboard error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>

        <h2 className="mb-3 text-2xl font-bold">
          Unable to load dashboard section
        </h2>

        <p className="mb-6 text-muted-foreground">
          We encountered a problem loading this part of the dashboard. This
          could be due to a temporary issue or a problem with your data.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 rounded-lg border bg-muted p-4 text-left">
            <p className="mb-2 text-sm font-semibold">
              Error Details (Development Only):
            </p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message.length > 0 ? error.message : "Unknown error"}
            </p>
            {error.digest !== undefined && error.digest.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
            {error.stack !== undefined && error.stack.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium">
                  Stack Trace
                </summary>
                <pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg" variant="default">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          If this problem persists, try refreshing the page or contact support.
        </p>
      </div>
    </div>
  )
}
