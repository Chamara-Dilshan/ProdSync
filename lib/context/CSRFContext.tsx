"use client"

/**
 * CSRF Context
 *
 * Provides CSRF token management for the application.
 * Fetches token on mount and provides helper for making protected API requests.
 */

import React, { createContext, useContext, useEffect, useState } from "react"

interface CSRFContextType {
  token: string | null
  loading: boolean
  error: string | null
  refetchToken: () => Promise<void>
  getCSRFHeaders: () => Record<string, string>
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined)

export function CSRFProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch CSRF token from server
   */
  const fetchToken = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/csrf", {
        method: "GET",
        credentials: "include", // Include cookies
      })

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token")
      }

      const data = (await response.json()) as { token: string }
      setToken(data.token)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setError(errorMsg)
      console.error("[CSRF] Failed to fetch token:", errorMsg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get headers with CSRF token
   */
  const getCSRFHeaders = (): Record<string, string> => {
    if (!token) {
      console.warn("[CSRF] Token not available yet")
      return {}
    }

    return {
      "X-CSRF-Token": token,
    }
  }

  // Fetch token on mount
  useEffect(() => {
    void fetchToken()
  }, [])

  const value: CSRFContextType = {
    token,
    loading,
    error,
    refetchToken: fetchToken,
    getCSRFHeaders,
  }

  return <CSRFContext.Provider value={value}>{children}</CSRFContext.Provider>
}

/**
 * Hook to access CSRF context
 */
export function useCSRF(): CSRFContextType {
  const context = useContext(CSRFContext)
  if (context === undefined) {
    throw new Error("useCSRF must be used within CSRFProvider")
  }
  return context
}
