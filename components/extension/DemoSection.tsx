"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DemoSectionProps {
  mode?: "video" | "gif" | "screenshots"
  videoUrl?: string // YouTube embed URL or direct video URL
  gifUrl?: string
  screenshots?: {
    url: string
    alt: string
    caption?: string
  }[]
}

export function DemoSection({
  mode = "screenshots",
  videoUrl,
  gifUrl,
  screenshots = [],
}: DemoSectionProps): JSX.Element {
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Default placeholder screenshots if none provided
  const defaultScreenshots = [
    {
      url: "/screenshots/extension-button.png",
      alt: "Generate Reply button on Etsy message page",
      caption: "Click the '✨ Generate Reply' button next to any Etsy message",
    },
    {
      url: "/screenshots/extension-popup.png",
      alt: "ProdSync extension popup interface",
      caption: "Select tone, products, and generate your professional reply",
    },
    {
      url: "/screenshots/extension-preview.png",
      alt: "Reply preview before insertion",
      caption: "Review and edit the AI-generated response before sending",
    },
    {
      url: "/screenshots/extension-inserted.png",
      alt: "Reply inserted into Etsy message box",
      caption: "Reply automatically inserted - just review and send!",
    },
  ]

  const displayScreenshots =
    screenshots.length > 0 ? screenshots : defaultScreenshots

  const handlePrevious = (): void => {
    setCurrentScreenshot((prev) =>
      prev === 0 ? displayScreenshots.length - 1 : prev - 1
    )
  }

  const handleNext = (): void => {
    setCurrentScreenshot((prev) =>
      prev === displayScreenshots.length - 1 ? 0 : prev + 1
    )
  }

  // Video mode
  if (mode === "video" && videoUrl) {
    const isYouTube =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {!isVideoPlaying ? (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-cover bg-center cursor-pointer group"
                  onClick={(): void => setIsVideoPlaying(true)}
                  style={{
                    backgroundImage: `url(${videoUrl.replace("embed/", "vi/").replace("watch?v=", "vi/")}/maxresdefault.jpg)`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="relative z-10 p-6 bg-primary/90 rounded-full group-hover:bg-primary transition-colors">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
              ) : (
                <iframe
                  className="w-full h-full"
                  src={isYouTube ? videoUrl : videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="ProdSync Extension Demo"
                />
              )}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Watch how ProdSync seamlessly integrates with your Etsy workflow
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // GIF mode
  if (mode === "gif" && gifUrl) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <Image
                src={gifUrl}
                alt="ProdSync Extension Demo"
                fill
                className="object-contain"
                unoptimized // GIFs should not be optimized by Next.js
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              See the extension in action from message to reply
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Screenshot carousel mode (default)
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main screenshot display */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Placeholder - will be replaced with actual screenshots */}
              <div className="text-center space-y-3 p-6">
                <div className="p-4 bg-muted-foreground/10 rounded-lg inline-block">
                  <Maximize2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {displayScreenshots[currentScreenshot].caption}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Screenshot {currentScreenshot + 1} of{" "}
                    {displayScreenshots.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Replace placeholder with:{" "}
                    <code className="bg-muted px-1 rounded">
                      {displayScreenshots[currentScreenshot].url}
                    </code>
                  </p>
                </div>
              </div>
              {/* Uncomment when real screenshots are added:
              <Image
                src={displayScreenshots[currentScreenshot].url}
                alt={displayScreenshots[currentScreenshot].alt}
                fill
                className="object-contain"
              />
              */}
            </div>

            {/* Navigation arrows */}
            {displayScreenshots.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Caption */}
          <div className="text-center">
            <p className="font-medium">
              {displayScreenshots[currentScreenshot].caption}
            </p>
          </div>

          {/* Thumbnail navigation */}
          {displayScreenshots.length > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
              {displayScreenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={(): void => setCurrentScreenshot(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-14 rounded-lg border-2 transition-all overflow-hidden bg-muted",
                    currentScreenshot === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>
                  {/* Uncomment when real screenshots are added:
                  <Image
                    src={screenshot.url}
                    alt={screenshot.alt}
                    width={80}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                  */}
                </button>
              ))}
            </div>
          )}

          {/* Instructions for adding screenshots */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold">📸 To add real screenshots:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Add screenshot files to{" "}
                <code className="bg-muted px-1 rounded">
                  /public/screenshots/
                </code>
              </li>
              <li>
                Update the{" "}
                <code className="bg-muted px-1 rounded">screenshots</code> prop
                in the extension page
              </li>
              <li>
                Uncomment the{" "}
                <code className="bg-muted px-1 rounded">Image</code> components
                in this file
              </li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
