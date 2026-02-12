import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useAuth } from "@/lib/context/AuthContext"
import {
  getPolicies,
  getPoliciesPaginated,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "@/lib/firebase/firestore"
import { Policy } from "@/types"
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore"

// Query keys
export const policyKeys = {
  all: ["policies"] as const,
  byUser: (userId: string) => ["policies", userId] as const,
}

/**
 * Fetch policies for the current user
 */
export function usePolicies() {
  const { user } = useAuth()

  return useQuery({
    queryKey: user !== null ? policyKeys.byUser(user.uid) : ["policies"],
    queryFn: async (): Promise<Policy[]> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return getPolicies(user.uid)
    },
    enabled: user !== null,
  })
}

/**
 * Fetch policies with pagination (infinite query)
 * @param pageSize - Number of policies per page (default: 20)
 */
export function usePoliciesInfinite(pageSize = 20) {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: user !== null ? [...policyKeys.byUser(user.uid), "infinite"] : ["policies", "infinite"],
    queryFn: async ({ pageParam }: { pageParam?: QueryDocumentSnapshot<DocumentData> }): Promise<{
      policies: Policy[]
      lastDoc: QueryDocumentSnapshot<DocumentData> | null
      hasMore: boolean
    }> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return getPoliciesPaginated(user.uid, pageSize, pageParam)
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined
    },
    initialPageParam: undefined as QueryDocumentSnapshot<DocumentData> | undefined,
    enabled: user !== null,
  })
}

/**
 * Create a new policy
 */
export function useCreatePolicy() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<Policy, "id" | "createdAt" | "updatedAt">
    ): Promise<string> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return createPolicy(user.uid, data)
    },
    onSuccess: (id, data) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Policy[]>(policyKeys.byUser(user.uid), (old) => {
        if (old === undefined) return old
        const newPolicy: Policy = {
          id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return [newPolicy, ...old]
      })

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: policyKeys.byUser(user.uid),
      })
    },
  })
}

/**
 * Update an existing policy
 */
export function useUpdatePolicy() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      policyId,
      data,
    }: {
      policyId: string
      data: Partial<Omit<Policy, "id" | "createdAt" | "updatedAt">>
    }): Promise<void> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return updatePolicy(user.uid, policyId, data)
    },
    onSuccess: (_, { policyId, data }) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Policy[]>(policyKeys.byUser(user.uid), (old) => {
        if (old === undefined) return old
        return old.map((p) =>
          p.id === policyId ? { ...p, ...data, updatedAt: new Date() } : p
        )
      })

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: policyKeys.byUser(user.uid),
      })
    },
  })
}

/**
 * Delete a policy
 */
export function useDeletePolicy() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (policyId: string): Promise<void> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return deletePolicy(user.uid, policyId)
    },
    onSuccess: (_, policyId) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<Policy[]>(policyKeys.byUser(user.uid), (old) => {
        if (old === undefined) return old
        return old.filter((p) => p.id !== policyId)
      })

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: policyKeys.byUser(user.uid),
      })
    },
  })
}
