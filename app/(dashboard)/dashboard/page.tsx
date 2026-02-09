"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { Header } from "@/components/dashboard/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getProducts,
  getPolicies,
  getUserSettings,
} from "@/lib/firebase/firestore"
import {
  Package,
  FileText,
  MessageSquare,
  Settings,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { getErrorMessage } from "@/types/errors"

interface DashboardStats {
  productCount: number
  policyCount: number
  hasApiKeys: boolean
}

export default function DashboardPage(): JSX.Element {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    policyCount: 0,
    hasApiKeys: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      if (user === null) {
        return
      }

      try {
        const [products, policies, settings] = await Promise.all([
          getProducts(user.uid),
          getPolicies(user.uid),
          getUserSettings(user.uid),
        ])

        const hasApiKeys =
          settings !== null
            ? (settings.apiKeys?.openai ?? "") !== "" ||
              (settings.apiKeys?.gemini ?? "") !== "" ||
              (settings.apiKeys?.anthropic ?? "") !== ""
            : false

        setStats({
          productCount: products.length,
          policyCount: policies.length,
          hasApiKeys,
        })
        setError(null) // Clear any previous errors
      } catch (error: unknown) {
        console.error("Failed to fetch stats:", error)
        setError(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
  }, [user])

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your ProdSync account"
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Error Alert */}
        {error !== null && error !== "" && (
          <Card className="mb-4 md:mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error loading data</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatsCard
            title="Products"
            value={loading ? "-" : stats.productCount.toString()}
            icon={<Package className="h-5 w-5 text-primary" />}
            href="/dashboard/products"
          />
          <StatsCard
            title="Policies"
            value={loading ? "-" : stats.policyCount.toString()}
            icon={<FileText className="h-5 w-5 text-primary" />}
            href="/dashboard/policies"
          />
          <StatsCard
            title="AI Ready"
            value={loading ? "-" : stats.hasApiKeys ? "Yes" : "No"}
            icon={<MessageSquare className="h-5 w-5 text-primary" />}
            href="/dashboard/messages"
          />
          <StatsCard
            title="API Keys"
            value={loading ? "-" : stats.hasApiKeys ? "Configured" : "Not Set"}
            icon={<Settings className="h-5 w-5 text-primary" />}
            href="/dashboard/settings"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <QuickActionCard
            title="Add Products"
            description="Import your Etsy products via Excel upload"
            href="/dashboard/products"
            actionText="Manage Products"
          />
          <QuickActionCard
            title="Set Policies"
            description="Configure your refund, shipping, and other policies"
            href="/dashboard/policies"
            actionText="Manage Policies"
          />
          <QuickActionCard
            title="Generate Replies"
            description="Use AI to create professional responses to buyers"
            href="/dashboard/messages"
            actionText="Start Generating"
          />
        </div>

        {/* Getting Started Guide */}
        {!loading &&
          (stats.productCount === 0 ||
            stats.policyCount === 0 ||
            !stats.hasApiKeys) && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Step
                    number={1}
                    title="Add your API key"
                    description="Go to Settings and add at least one AI provider API key"
                    completed={stats.hasApiKeys}
                    href="/dashboard/settings"
                  />
                  <Step
                    number={2}
                    title="Import your products"
                    description="Upload an Excel file with your product information"
                    completed={stats.productCount > 0}
                    href="/dashboard/products"
                  />
                  <Step
                    number={3}
                    title="Add your policies"
                    description="Configure your shop's refund, shipping, and cancellation policies"
                    completed={stats.policyCount > 0}
                    href="/dashboard/policies"
                  />
                  <Step
                    number={4}
                    title="Generate replies"
                    description="Start using AI to respond to buyer messages"
                    completed={false}
                    href="/dashboard/messages"
                  />
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  href,
}: {
  title: string
  value: string
  icon: React.ReactNode
  href: string
}): JSX.Element {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickActionCard({
  title,
  description,
  href,
  actionText,
}: {
  title: string
  description: string
  href: string
  actionText: string
}): JSX.Element {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <span className="text-primary text-sm font-medium">
            {actionText} &rarr;
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function Step({
  number,
  title,
  description,
  completed,
  href,
}: {
  number: number
  title: string
  description: string
  completed: boolean
  href: string
}): JSX.Element {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
          completed
            ? "bg-green-100 text-green-700"
            : "bg-primary/10 text-primary"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
