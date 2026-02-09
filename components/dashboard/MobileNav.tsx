"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/firebase/auth"
import { NavigationItems } from "./Sidebar"

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({
  open,
  onOpenChange,
}: MobileNavProps): React.JSX.Element {
  const router = useRouter()

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    onOpenChange(false)
    router.push("/login")
  }

  const handleNavClick = (): void => {
    onOpenChange(false) // Close drawer after navigation
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>
            <Link
              href="/dashboard"
              onClick={handleNavClick}
              className="text-2xl font-bold"
            >
              <span className="text-primary">Prod</span>Sync
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="py-4">
          <NavigationItems onItemClick={handleNavClick} />
        </nav>

        {/* Sign Out Button */}
        <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 min-h-[44px]"
            onClick={(): void => {
              void handleSignOut()
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
