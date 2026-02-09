"use client"

import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, DollarSign, Package2 } from "lucide-react"

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  isDeleting?: boolean
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  isDeleting,
}: ProductCardProps): React.JSX.Element {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header: Name + Actions */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{product.name}</h3>
            {product.sku !== null &&
              product.sku !== undefined &&
              product.sku !== "" && (
                <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
              )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(product)}
              className="h-10 w-10"
              aria-label="Edit product"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product.id)}
              disabled={isDeleting}
              className="h-10 w-10"
              aria-label="Delete product"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {product.description !== null &&
          product.description !== undefined &&
          product.description !== "" && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Price */}
          {product.price !== null && product.price !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {product.currency ?? "$"}
                {product.price.toFixed(2)}
              </span>
            </div>
          )}

          {/* Variants */}
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {product.colors !== null &&
                product.colors !== undefined &&
                product.colors.length > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {product.colors.length} colors
                  </span>
                )}
              {product.sizes !== null &&
                product.sizes !== undefined &&
                product.sizes.length > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {product.sizes.length} sizes
                  </span>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
