"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/Header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ProductList } from "@/components/products/ProductList"
import { ProductForm } from "@/components/products/ProductForm"
import { ExcelUploader } from "@/components/products/ExcelUploader"
import { ProductListSkeleton } from "@/components/skeletons/ProductListSkeleton"
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkCreateProducts,
} from "@/lib/hooks/useProducts"
import { Product } from "@/types"
import { getErrorMessage } from "@/types/errors"
import { Plus } from "lucide-react"

export default function ProductsPage(): JSX.Element {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // React Query hooks
  const { data: products = [], isLoading } = useProducts()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()
  const bulkCreateMutation = useBulkCreateProducts()

  const handleAddProduct = (): void => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product): void => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleSubmitProduct = async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<void> => {
    try {
      if (editingProduct !== null) {
        // Update existing product
        await updateMutation.mutateAsync({
          productId: editingProduct.id,
          data,
        })
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        })
      } else {
        // Create new product
        await createMutation.mutateAsync(data)
        toast({
          title: "Product added",
          description: "Your product has been added successfully.",
        })
      }
      setIsDialogOpen(false)
    } catch (error: unknown) {
      console.error("Failed to save product:", error)
      toast({
        variant: "destructive",
        title: "Error saving product",
        description:
          getErrorMessage(error) ?? "Failed to save product. Please try again.",
      })
    }
  }

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(productId)
      toast({
        title: "Product deleted",
        description: "The product has been removed.",
      })
    } catch (error: unknown) {
      console.error("Failed to delete product:", error)
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description:
          getErrorMessage(error) ??
          "Failed to delete product. Please try again.",
      })
    }
  }

  const handleImportProducts = async (
    importedProducts: Omit<Product, "id" | "createdAt" | "updatedAt">[]
  ): Promise<void> => {
    try {
      await bulkCreateMutation.mutateAsync(importedProducts)
      toast({
        title: "Import successful",
        description: `${importedProducts.length} products have been imported.`,
      })
    } catch (error: unknown) {
      console.error("Failed to import products:", error)
      toast({
        variant: "destructive",
        title: "Import failed",
        description:
          getErrorMessage(error) ??
          "Failed to import products. Please try again.",
      })
    }
  }

  return (
    <div>
      <Header
        title="Products"
        description="Manage your product catalog for AI-generated responses"
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <Tabs defaultValue="list">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="list" className="flex-1 sm:flex-initial">
                Product List
              </TabsTrigger>
              <TabsTrigger value="import" className="flex-1 sm:flex-initial">
                Import from Excel
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={handleAddProduct}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <TabsContent value="list">
            {isLoading ? (
              <ProductListSkeleton />
            ) : (
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={(productId: string) => {
                  void handleDeleteProduct(productId)
                }}
                isDeleting={
                  deleteMutation.isPending
                    ? deleteMutation.variables
                    : undefined
                }
              />
            )}
          </TabsContent>

          <TabsContent value="import">
            <ExcelUploader
              onProductsParsed={(products) => {
                void handleImportProducts(products)
              }}
              isUploading={bulkCreateMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct !== null ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct ?? undefined}
            onSubmit={(data) => {
              void handleSubmitProduct(data)
            }}
            onCancel={() => {
              setIsDialogOpen(false)
            }}
            isLoading={
              createMutation.isPending || updateMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
