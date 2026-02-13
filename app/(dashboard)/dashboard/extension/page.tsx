"use client"

import { useState } from "react"
import {
  Download,
  Chrome,
  Check,
  AlertCircle,
  ExternalLink,
  Zap,
  MessageSquare,
  ShoppingBag,
  Smile,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/dashboard/Header"
import { DemoSection } from "@/components/extension/DemoSection"

export default function ExtensionPage(): JSX.Element {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = (): void => {
    setIsDownloading(true)

    // Trigger download
    const link = document.createElement("a")
    link.href = "/downloads/ProdSync-Extension.zip"
    link.download = "ProdSync-Extension.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      setIsDownloading(false)
    }, 1000)
  }

  const features = [
    {
      icon: Zap,
      title: "One-Click Reply Generation",
      description:
        "Generate professional replies directly on Etsy message pages with a single click. No copying and pasting required.",
    },
    {
      icon: ShoppingBag,
      title: "Smart Product Context",
      description:
        "Automatically include relevant product information in your replies based on the buyer's message.",
    },
    {
      icon: Smile,
      title: "Multiple Tone Options",
      description:
        "Choose from professional, friendly, formal, or casual tones to match your shop's voice and the conversation context.",
    },
    {
      icon: MessageSquare,
      title: "Direct Etsy Integration",
      description:
        "Seamlessly integrated into Etsy's message interface. Insert generated replies directly into the message box.",
    },
  ]

  return (
    <div>
      <Header
        title="Chrome Extension"
        description="Install the ProdSync extension to generate AI replies directly on Etsy"
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="space-y-6 md:space-y-8">
          {/* Alert - API Keys Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Before Installing</AlertTitle>
            <AlertDescription>
              Make sure you have configured your API keys in{" "}
              <a href="/dashboard/settings" className="underline font-medium">
                Settings
              </a>{" "}
              before using the extension.
            </AlertDescription>
          </Alert>

          {/* Hero Section - Download Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Chrome className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                ProdSync Chrome Extension
              </CardTitle>
              <CardDescription className="text-base md:text-lg mt-2">
                Generate professional Etsy message replies without leaving the
                Etsy website
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[44px]"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-5 w-5" />
                {isDownloading ? "Downloading..." : "Download Extension"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-h-[44px]"
                onClick={(): void => {
                  const link = document.createElement("a")
                  link.href = "#installation"
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View Instructions
              </Button>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              How It Works
            </h2>

            {/* Demo Section */}
            <DemoSection mode="screenshots" />

            {/* Workflow Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="text-center space-y-2">
                <div className="p-3 bg-primary/10 rounded-lg inline-block">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">1. Read Message</h4>
                <p className="text-xs text-muted-foreground">
                  Extension captures buyer message from Etsy
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-primary/10 rounded-lg inline-block">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">2. Generate Reply</h4>
                <p className="text-xs text-muted-foreground">
                  AI creates a professional response with context
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-primary/10 rounded-lg inline-block">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">3. Insert & Send</h4>
                <p className="text-xs text-muted-foreground">
                  Review, edit if needed, and send your reply
                </p>
              </div>
            </div>
          </div>

          {/* Installation Guide */}
          <div id="installation">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Installation Guide
            </h2>
            <Card>
              <CardContent className="pt-6">
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg mb-1">
                        Download the Extension
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Click the "Download Extension" button above to download
                        the ZIP file
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg mb-1">
                        Extract the ZIP
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Extract the ZIP file to a folder on your computer.
                        Remember the location!
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg mb-1">
                        Load in Chrome
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Open Chrome and go to{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          chrome://extensions/
                        </code>
                        . Enable "Developer mode" (top-right toggle), click
                        "Load unpacked", and select the extracted "dist" folder.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        4
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg mb-1">
                        Use on Etsy
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Visit{" "}
                        <a
                          href="https://www.etsy.com/messages"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Etsy Messages
                          <ExternalLink className="h-3 w-3" />
                        </a>{" "}
                        and look for the "✨ Generate Reply" button next to the
                        message textarea.
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Requirements Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Requirements
            </h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>Google Chrome Browser</strong> - Extension is
                      designed for Chrome (Version 88 or higher). Also works on
                      Edge and Brave.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>ProdSync Account</strong> - Sign up on this
                      website and configure your settings
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>AI Provider API Key</strong> - Configure at least
                      one AI provider (OpenAI, Google Gemini, or Anthropic) in
                      Settings
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>Active Etsy Shop</strong> - Extension works on
                      Etsy message pages (www.etsy.com/messages)
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Is the extension free to use?
                  </CardTitle>
                  <CardDescription>
                    Yes! The extension is completely free. You only pay for the
                    AI provider API usage based on your provider's pricing (most
                    have generous free tiers).
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Does it work on Firefox or Safari?
                  </CardTitle>
                  <CardDescription>
                    Currently, the extension is only available for Google
                    Chrome. It also works on Chromium-based browsers like Edge
                    and Brave. We may support Firefox in the future.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Can I customize the generated replies?
                  </CardTitle>
                  <CardDescription>
                    Absolutely! The extension shows a preview of the generated
                    reply before inserting it. You can edit it directly in
                    Etsy's message box before sending.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Is my data secure?
                  </CardTitle>
                  <CardDescription>
                    Yes. Your API keys are encrypted before being stored. The
                    extension only accesses Etsy message pages you're viewing
                    and doesn't store or transmit any sensitive shop data.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
