"use client"

import { useEffect } from "react"

/**
 * Global error boundary that catches errors in the root layout.
 * This is a Next.js App Router convention for handling errors that occur
 * in the root layout.tsx file.
 *
 * Note: This must define its own <html> and <body> tags since it replaces
 * the root layout when active.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): JSX.Element {
  useEffect(() => {
    console.error("Global error (root layout):", error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: "500px", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Application Error
            </h1>
            <p style={{ marginBottom: "2rem", color: "#666" }}>
              A critical error occurred. Please try reloading the page.
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Reload Page
              </button>
            </div>
            {process.env.NODE_ENV === "development" && error && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "0.375rem",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Error Details (Development Only):
                </p>
                <pre
                  style={{
                    fontSize: "0.75rem",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
