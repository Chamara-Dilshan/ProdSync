import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useAuth } from "@/lib/context/AuthContext"
import {
  getProducts,
  getProductsPaginated,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
} from "@/lib/firebase/firestore"
import { Product } from "@/types"
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore"

// Query keys
export const productKeys = {
  all: ["products"] as const,
  byUser: (userId: string) => ["products", userId] as const,
}

/**
 * Fetch products for the current user
 */
export function useProducts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: user !== null ? productKeys.byUser(user.uid) : ["products"],
    queryFn: async (): Promise<Product[]> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return getProducts(user.uid)
    },
    enabled: user !== null,
  })
}

/**
 * Fetch products with pagination (infinite query)
 * @param pageSize - Number of products per page (default: 20)
 */
export function useProductsInfinite(pageSize = 20) {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: user !== null ? [...productKeys.byUser(user.uid), "infinite"] : ["products", "infinite"],
    queryFn: async ({ pageParam }: { pageParam?: QueryDocumentSnapshot<DocumentData> }): Promise<{
      products: Product[]
      lastDoc: QueryDocumentSnapshot<DocumentData> | null
      hasMore: boolean
    }> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return getProductsPaginated(user.uid, pageSize, pageParam)
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined
    },
    initialPageParam: undefined as QueryDocumentSnapshot<DocumentData> | undefined,
    enabled: user !== null,
  })
}

/**
 * Create a new product
 */
export function useCreateProduct() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<Product, "id" | "createdAt" | "updatedAt">
    ): Promise<string> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return createProduct(user.uid, data)
    },
    onSuccess: (id, data) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Product[]>(
        productKeys.byUser(user.uid),
        (old) => {
          if (old === undefined) return old
          const newProduct: Product = {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          return [newProduct, ...old]
        }
      )

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: productKeys.byUser(user.uid),
      })
    },
  })
}

/**
 * Update an existing product
 */
export function useUpdateProduct() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string
      data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
    }): Promise<void> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return updateProduct(user.uid, productId, data)
    },
    onSuccess: (_, { productId, data }) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Product[]>(
        productKeys.byUser(user.uid),
        (old) => {
          if (old === undefined) return old
          return old.map((p) =>
            p.id === productId ? { ...p, ...data, updatedAt: new Date() } : p
          )
        }
      )

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: productKeys.byUser(user.uid),
      })
    },
  })
}

/**
 * Delete a product
 */
export function useDeleteProduct() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return deleteProduct(user.uid, productId)
    },
    onSuccess: (_, productId) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Product[]>(
        productKeys.byUser(user.uid),
        (old) => {
          if (old === undefined) return old
          return old.filter((p) => p.id !== productId)
        }
      )

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: productKeys.byUser(user.uid),
      })
    },
  })
}

/**
 * Bulk create products (import from Excel)
 */
export function useBulkCreateProducts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      products: Omit<Product, "id" | "createdAt" | "updatedAt">[]
    ): Promise<string[]> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return bulkCreateProducts(user.uid, products)
    },
    onSuccess: (ids, products) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Product[]>(
        productKeys.byUser(user.uid),
        (old) => {
          if (old === undefined) return old
          const newProducts: Product[] = products.map((p, i) => ({
            id: ids[i],
            ...p,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
          return [...newProducts, ...old]
        }
      )

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: productKeys.byUser(user.uid),
      })
    },
  })
}
