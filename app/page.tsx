"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, MessageSquare, Package, Shield, Zap } from "lucide-react"

export default function HomePage(): React.ReactElement {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user !== null) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">Prod</span>Sync
        </h1>
        <div className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Responses for Your{" "}
            <span className="text-primary">Etsy Shop</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Stop spending hours typing the same responses. ProdSync uses AI to
            generate professional, policy-compliant replies to buyer messages in
            seconds.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-primary" />}
            title="AI-Generated Replies"
            description="Get professional, context-aware responses based on your product data and shop policies."
          />
          <FeatureCard
            icon={<Package className="h-8 w-8 text-primary" />}
            title="Product Database"
            description="Import your products via Excel. All info is instantly available for AI responses."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Policy Compliant"
            description="Responses always align with your refund, shipping, and cancellation policies."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Multiple AI Models"
            description="Choose from OpenAI, Google Gemini, or Claude. Use your own API keys."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>
          &copy; 2026 Chamara Dilshan &amp; ProdSync. Built for Etsy sellers.
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}): React.ReactElement {
  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
