"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
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
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
} from "@/lib/firebase/firestore"
import { Product } from "@/types"
import { getErrorMessage } from "@/types/errors"
import { Plus, Loader2 } from "lucide-react"

export default function ProductsPage(): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      if (user === null) {
        return
      }
      try {
        const data = await getProducts(user.uid)
        setProducts(data)
      } catch (error: unknown) {
        console.error("Failed to load products:", error)
        toast({
          variant: "destructive",
          title: "Error loading products",
          description:
            getErrorMessage(error) ??
            "Failed to load products. Please check your Firebase configuration.",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchProducts()
  }, [user, toast])

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
    if (user === null) {
      return
    }

    setIsSubmitting(true)
    try {
      if (editingProduct !== null) {
        await updateProduct(user.uid, editingProduct.id, data)
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p))
        )
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        })
      } else {
        const id = await createProduct(user.uid, data)
        setProducts((prev) => [
          {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Product,
          ...prev,
        ])
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    if (user === null) {
      return
    }

    setDeletingId(productId)
    try {
      await deleteProduct(user.uid, productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
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
    } finally {
      setDeletingId(null)
    }
  }

  const handleImportProducts = async (
    importedProducts: Omit<Product, "id" | "createdAt" | "updatedAt">[]
  ): Promise<void> => {
    if (user === null) {
      return
    }

    setIsImporting(true)
    try {
      const ids = await bulkCreateProducts(user.uid, importedProducts)
      const newProducts = importedProducts.map((p, i) => ({
        id: ids[i],
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as Product[]

      setProducts((prev) => [...newProducts, ...prev])
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
    } finally {
      setIsImporting(false)
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
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={(productId: string) => {
                  void handleDeleteProduct(productId)
                }}
                isDeleting={deletingId ?? undefined}
              />
            )}
          </TabsContent>

          <TabsContent value="import">
            <ExcelUploader
              onProductsParsed={(products) => {
                void handleImportProducts(products)
              }}
              isUploading={isImporting}
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
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
