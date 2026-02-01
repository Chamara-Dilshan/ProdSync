"use client"

import Link from "next/link"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Global 404 (Not Found) page.
 * This is displayed when a user navigates to a route that doesn't exist.
 */
export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <FileQuestion className="h-24 w-24 text-muted-foreground/50" />
        </div>

        <h1 className="mb-2 text-6xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>

        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page might have been moved or deleted.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
