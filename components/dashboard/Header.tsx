"use client"

import { useAuth } from "@/lib/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user } = useAuth()

  const getInitials = (name: string | null | undefined): string => {
    if (!name) {return "U"}
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-white border-b px-8 py-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user?.displayName || "User"}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Avatar>
          <AvatarImage src={user?.photoURL || undefined} />
          <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
