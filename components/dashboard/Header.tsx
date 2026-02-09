"use client"

import { useAuth } from "@/lib/context/AuthContext"
import { useNavigation } from "@/lib/context/NavigationContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu } from "lucide-react"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({
  title,
  description,
}: HeaderProps): React.ReactElement {
  const { user } = useAuth()
  const { setMobileMenuOpen } = useNavigation()

  const getInitials = (name: string | null | undefined): string => {
    if (name === null || name === undefined || name.length === 0) {
      return "U"
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-white border-b px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="flex justify-between items-center gap-4">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md -ml-2"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            {description !== undefined && description.length > 0 && (
              <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: User info */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {/* Text info - hidden on mobile */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.displayName ?? "User"}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {user?.email ?? ""}
            </p>
          </div>

          {/* Avatar - always visible */}
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={user?.photoURL ?? undefined} />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
