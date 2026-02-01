"use client"

import { useState } from "react"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Search, Package } from "lucide-react"

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  isDeleting?: string
}

export function ProductList({
  products,
  onEdit,
  onDelete,
  isDeleting,
}: ProductListProps) {
  const [search, setSearch] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase())
  )

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first product manually or import from Excel
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Variants
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                SKU
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {product.price ? (
                    <span>
                      {product.currency || "$"}
                      {product.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {product.colors && product.colors.length > 0 && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.colors.length} colors
                      </span>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.sizes.length} sizes
                      </span>
                    )}
                    {(!product.colors || product.colors.length === 0) &&
                      (!product.sizes || product.sizes.length === 0) && (
                        <span className="text-gray-400">-</span>
                      )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {product.sku || "-"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product.id)}
                      disabled={isDeleting === product.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && products.length > 0 && (
        <p className="text-center text-gray-500 py-8">
          No products match your search
        </p>
      )}
    </div>
  )
}
