"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Policy, PolicyType, POLICY_TYPE_LABELS } from "@/types"

const policySchema = z.object({
  type: z.string().min(1, "Policy type is required"),
  title: z.string().min(1, "Policy title is required"),
  content: z.string().min(1, "Policy content is required"),
  isActive: z.boolean(),
})

type PolicyFormData = z.infer<typeof policySchema>

interface PolicyFormProps {
  policy?: Policy
  onSubmit: (
    data: Omit<Policy, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PolicyForm({
  policy,
  onSubmit,
  onCancel,
  isLoading,
}: PolicyFormProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      type: policy?.type ?? "refund",
      title: policy?.title ?? "",
      content: policy?.content ?? "",
      isActive: policy?.isActive ?? true,
    },
  })

  const selectedType = watch("type")

  const handleFormSubmit = async (data: PolicyFormData): Promise<void> => {
    await onSubmit({
      type: data.type as PolicyType,
      title: data.title,
      content: data.content,
      isActive: data.isActive,
    })
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(handleFormSubmit)(e)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="type">Policy Type *</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue("type", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select policy type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(POLICY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Policy Title *</Label>
        <Input
          id="title"
          placeholder="e.g., 30-Day Return Policy"
          {...register("title")}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Policy Content *</Label>
        <Textarea
          id="content"
          placeholder="Describe your policy in detail. This will be used by AI to generate accurate responses."
          {...register("content")}
          disabled={isLoading}
          rows={6}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Be specific about timelines, conditions, and exceptions.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isActive" className="font-normal">
          Policy is active (included in AI responses)
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {policy ? "Update Policy" : "Add Policy"}
        </Button>
      </div>
    </form>
  )
}
