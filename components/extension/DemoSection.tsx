"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
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
                sizes="100vw"
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
      <CardContent className="pt-5 pb-5">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left half: image preview */}
          <div className="w-full md:w-1/2">
            <div className="relative h-[280px] sm:h-[340px] md:h-[380px] rounded-xl overflow-hidden border border-border shadow-md bg-muted">
              <Image
                src={displayScreenshots[currentScreenshot].url}
                alt={displayScreenshots[currentScreenshot].alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>

            {/* Prev / Next arrows below image */}
            {displayScreenshots.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right half: step list */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3">
            {displayScreenshots.map((screenshot, index) => (
              <button
                key={index}
                onClick={(): void => setCurrentScreenshot(index)}
                className={cn(
                  "w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-all",
                  currentScreenshot === index
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5",
                    currentScreenshot === index
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm md:text-base font-medium leading-snug",
                      currentScreenshot === index
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {screenshot.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
