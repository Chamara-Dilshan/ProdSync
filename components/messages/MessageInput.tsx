"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function MessageInput({ value, onChange, disabled }: MessageInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="buyerMessage">Buyer&apos;s Message</Label>
      <Textarea
        id="buyerMessage"
        placeholder="Paste the buyer's message here...

Example:
Hi! I love this item. Can you tell me if it comes in blue? Also, what's your refund policy?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Paste the buyer&apos;s message to generate an AI-powered response.
      </p>
    </div>
  )
}
