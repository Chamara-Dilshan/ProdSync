"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/utils/registerServiceWorker"

export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    // Register service worker on mount
    void registerServiceWorker()
  }, [])

  return null
}
