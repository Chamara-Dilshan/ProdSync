"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import {
  NavigationProvider,
  useNavigation,
} from "@/lib/context/NavigationContext"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { MobileNav } from "@/components/dashboard/MobileNav"

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement | null {
  const { user, loading } = useAuth()
  const { mobileMenuOpen, setMobileMenuOpen } = useNavigation()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user === null) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user === null) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <NavigationProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </NavigationProvider>
  )
}
