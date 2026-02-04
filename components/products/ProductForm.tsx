"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Product } from "@/types"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  materials: z.string().optional(),
  careInstructions: z.string().optional(),
  customizationOptions: z.string().optional(),
  processingTime: z.string().optional(),
  tags: z.string().optional(),
  sku: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  onSubmit: (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price?.toString() ?? "",
      currency: product?.currency ?? "USD",
      sizes: product?.sizes?.join(", ") ?? "",
      colors: product?.colors?.join(", ") ?? "",
      materials: product?.materials?.join(", ") ?? "",
      careInstructions: product?.careInstructions ?? "",
      customizationOptions: product?.customizationOptions ?? "",
      processingTime: product?.processingTime ?? "",
      tags: product?.tags?.join(", ") ?? "",
      sku: product?.sku ?? "",
    },
  })

  const handleFormSubmit = async (data: ProductFormData): Promise<void> => {
    const parseCommaSeparated = (
      value: string | undefined
    ): string[] | undefined => {
      if (value === null || value === undefined || value.length === 0) {
        return undefined
      }
      const items = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
      return items.length > 0 ? items : undefined
    }

    await onSubmit({
      name: data.name,
      description:
        data.description === null ||
        data.description === undefined ||
        data.description.length === 0
          ? undefined
          : data.description,
      price:
        data.price !== null && data.price !== undefined && data.price.length > 0
          ? parseFloat(data.price)
          : undefined,
      currency: data.currency ?? "USD",
      sizes: parseCommaSeparated(data.sizes),
      colors: parseCommaSeparated(data.colors),
      materials: parseCommaSeparated(data.materials),
      careInstructions:
        data.careInstructions === null ||
        data.careInstructions === undefined ||
        data.careInstructions.length === 0
          ? undefined
          : data.careInstructions,
      customizationOptions:
        data.customizationOptions === null ||
        data.customizationOptions === undefined ||
        data.customizationOptions.length === 0
          ? undefined
          : data.customizationOptions,
      processingTime:
        data.processingTime === null ||
        data.processingTime === undefined ||
        data.processingTime.length === 0
          ? undefined
          : data.processingTime,
      tags: parseCommaSeparated(data.tags),
      sku:
        data.sku === null || data.sku === undefined || data.sku.length === 0
          ? undefined
          : data.sku,
    })
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(handleFormSubmit)(e)
      }}
      className="space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" {...register("name")} disabled={isLoading} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} disabled={isLoading} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" {...register("currency")} disabled={isLoading} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sizes">Sizes (comma-separated)</Label>
          <Input
            id="sizes"
            placeholder="Small, Medium, Large"
            {...register("sizes")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="colors">Colors (comma-separated)</Label>
          <Input
            id="colors"
            placeholder="Red, Blue, Green"
            {...register("colors")}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="materials">Materials (comma-separated)</Label>
        <Input
          id="materials"
          placeholder="Cotton, Polyester"
          {...register("materials")}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="careInstructions">Care Instructions</Label>
        <Textarea
          id="careInstructions"
          {...register("careInstructions")}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customizationOptions">Customization Options</Label>
        <Textarea
          id="customizationOptions"
          {...register("customizationOptions")}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="processingTime">Processing Time</Label>
          <Input
            id="processingTime"
            placeholder="3-5 business days"
            {...register("processingTime")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="handmade, gift, unique"
            {...register("tags")}
            disabled={isLoading}
          />
        </div>
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
          {product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  )
}
