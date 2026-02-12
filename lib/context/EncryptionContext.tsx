"use client"

/**
 * Encryption Context
 *
 * Stores derived encryption key and salt in memory during user session.
 * Data is cleared on logout or page refresh for security.
 *
 * Security:
 * - Derived key never persisted to disk
 * - Cleared on component unmount
 * - Only stored in React state (memory)
 */

import { createContext, useContext, useState, useEffect } from "react"
import type { EncryptionContextValue } from "@/types/crypto"

const EncryptionContext = createContext<EncryptionContextValue | undefined>(
  undefined
)

interface EncryptionProviderProps {
  children: React.ReactNode
}

export function EncryptionProvider({
  children,
}: EncryptionProviderProps): JSX.Element {
  const [derivedKey, setDerivedKeyState] = useState<CryptoKey | null>(null)
  const [salt, setSaltState] = useState<string | null>(null)

  // Clear encryption data on component unmount
  useEffect(() => {
    return () => {
      setDerivedKeyState(null)
      setSaltState(null)
    }
  }, [])

  const setDerivedKey = (key: CryptoKey): void => {
    setDerivedKeyState(key)
  }

  const setSalt = (newSalt: string): void => {
    setSaltState(newSalt)
  }

  const clearEncryptionData = (): void => {
    setDerivedKeyState(null)
    setSaltState(null)
  }

  const value: EncryptionContextValue = {
    derivedKey,
    salt,
    setDerivedKey,
    setSalt,
    clearEncryptionData,
  }

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  )
}

/**
 * Hook to access encryption context
 * @returns Encryption context value
 * @throws Error if used outside EncryptionProvider
 */
export function useEncryption(): EncryptionContextValue {
  const context = useContext(EncryptionContext)

  if (context === undefined) {
    throw new Error("useEncryption must be used within an EncryptionProvider")
  }

  return context
}
