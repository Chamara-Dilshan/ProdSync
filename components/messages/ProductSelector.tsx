"use client"

import { Product } from "@/types"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProductSelectorProps {
  products: Product[]
  selectedProductId: string | null
  onSelect: (productId: string | null) => void
  disabled?: boolean
}

export function ProductSelector({
  products,
  selectedProductId,
  onSelect,
  disabled,
}: ProductSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Related Product (Optional)</Label>
      <Select
        value={selectedProductId || "all"}
        onValueChange={(value) => onSelect(value === "all" ? null : value)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a product" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select a specific product to include its details in the AI context.
      </p>
    </div>
  )
}
