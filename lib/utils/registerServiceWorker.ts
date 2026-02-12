/**
 * Register service worker for offline support and PWA functionality
 */
export async function registerServiceWorker(): Promise<void> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    process.env.NODE_ENV !== "production"
  ) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })

    console.log(
      "[ServiceWorker] Registration successful, scope:",
      registration.scope
    )

    // Check for updates on page load
    registration.update().catch((error) => {
      console.error("[ServiceWorker] Update check failed:", error)
    })

    // Handle service worker updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (newWorker === null) return

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller !== null
        ) {
          // New service worker available, prompt user to reload
          console.log("[ServiceWorker] New version available")

          // Automatically activate the new service worker
          newWorker.postMessage({ type: "SKIP_WAITING" })

          // Reload the page to use the new service worker
          window.location.reload()
        }
      })
    })
  } catch (error) {
    console.error("[ServiceWorker] Registration failed:", error)
  }
}

/**
 * Unregister service worker (for development/testing)
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration !== undefined) {
      await registration.unregister()
      console.log("[ServiceWorker] Unregistered successfully")
    }
  } catch (error) {
    console.error("[ServiceWorker] Unregistration failed:", error)
  }
}
