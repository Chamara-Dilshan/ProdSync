import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/lib/context/AuthContext"
import { getUserSettings, updateUserSettings } from "@/lib/firebase/firestore"
import { UserSettings, DEFAULT_SETTINGS } from "@/types"

// Query keys
export const settingsKeys = {
  all: ["settings"] as const,
  byUser: (userId: string) => ["settings", userId] as const,
}

/**
 * Fetch user settings
 */
export function useSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: user !== null ? settingsKeys.byUser(user.uid) : ["settings"],
    queryFn: async (): Promise<UserSettings> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      const settings = await getUserSettings(user.uid)
      return settings ?? DEFAULT_SETTINGS
    },
    enabled: user !== null,
  })
}

/**
 * Update user settings
 */
export function useUpdateSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: UserSettings): Promise<void> => {
      if (user === null) {
        throw new Error("User not authenticated")
      }
      return updateUserSettings(user.uid, settings)
    },
    onSuccess: (_, settings) => {
      if (user === null) return

      // Optimistically update the cache
      queryClient.setQueryData<UserSettings>(
        settingsKeys.byUser(user.uid),
        settings
      )

      // Invalidate to refetch and ensure consistency
      void queryClient.invalidateQueries({
        queryKey: settingsKeys.byUser(user.uid),
      })
    },
  })
}
