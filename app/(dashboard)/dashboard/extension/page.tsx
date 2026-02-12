"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/dashboard/Header"
import { DemoSection } from "@/components/extension/DemoSection"
import {
  Chrome,
  Zap,
  MessageSquare,
  ShoppingBag,
  Smile,
  CheckCircle2,
  Download,
  ExternalLink,
} from "lucide-react"

export default function ExtensionPage(): JSX.Element {
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

  const installSteps = [
    {
      number: 1,
      title: "Download the Extension",
      description:
        "Visit the Chrome Web Store and click 'Add to Chrome' to install ProdSync.",
    },
    {
      number: 2,
      title: "Sign In",
      description:
        "Click the ProdSync icon in your Chrome toolbar and sign in with your account credentials.",
    },
    {
      number: 3,
      title: "Configure Settings",
      description:
        "Make sure you've configured your AI provider API keys in the Settings page of this web app.",
    },
    {
      number: 4,
      title: "Use on Etsy",
      description:
        "Visit your Etsy messages page and look for the '✨ Generate Reply' button next to the message textarea.",
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
          {/* Hero Section */}
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
              <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
                <Download className="mr-2 h-5 w-5" />
                Install Extension
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-h-[44px]"
                onClick={(): void => {
                  window.open(
                    "https://github.com/yourusername/prodsync-extension",
                    "_blank"
                  )
                }}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View on GitHub
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

          {/* Installation Steps */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Installation Guide
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {installSteps.map((step) => (
                    <div key={step.number} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base md:text-lg mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              How It Works
            </h2>

            {/* Demo Section - supports video, GIF, or screenshot carousel */}
            <DemoSection
              mode="screenshots" // Change to "video" or "gif" when you have media
              // videoUrl="https://www.youtube.com/embed/YOUR_VIDEO_ID" // For YouTube
              // gifUrl="/demo.gif" // For GIF demo
              // screenshots={[...]} // Custom screenshots array (optional)
            />

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
                      designed for Chrome (Version 88 or higher)
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
                    Chrome. We may support other browsers in the future based on
                    user demand.
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
