import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/context/AuthContext"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ProdSync - AI-Powered Etsy Message Assistant",
  description:
    "Streamline your Etsy shop communication with AI-powered responses",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProdSync",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  )
}
