"use client"

import { WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OfflinePage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <WifiOff className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
          <p className="text-gray-600 mb-6">
            It looks like you've lost your internet connection. Please check
            your connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
