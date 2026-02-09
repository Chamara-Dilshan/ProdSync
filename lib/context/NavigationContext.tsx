"use client"

import { createContext, useContext, useState } from "react"

interface NavigationContextType {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <NavigationContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}
