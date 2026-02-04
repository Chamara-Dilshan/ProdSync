"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"
import { signOut } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Policies",
    href: "/dashboard/policies",
    icon: FileText,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    router.push("/login")
  }

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-bold">
          <span className="text-primary">Prod</span>Sync
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
          onClick={(): void => {
            void handleSignOut()
          }}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
