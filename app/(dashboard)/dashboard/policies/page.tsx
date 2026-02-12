"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/Header"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { PolicyList } from "@/components/policies/PolicyList"
import { PolicyForm } from "@/components/policies/PolicyForm"
import { PolicyListSkeleton } from "@/components/skeletons/PolicyListSkeleton"
import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  useDeletePolicy,
} from "@/lib/hooks/usePolicies"
import { Policy } from "@/types"
import { getErrorMessage } from "@/types/errors"
import { Plus } from "lucide-react"

export default function PoliciesPage(): JSX.Element {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)

  // React Query hooks
  const { data: policies = [], isLoading } = usePolicies()
  const createMutation = useCreatePolicy()
  const updateMutation = useUpdatePolicy()
  const deleteMutation = useDeletePolicy()

  const handleAddPolicy = (): void => {
    setEditingPolicy(null)
    setIsDialogOpen(true)
  }

  const handleEditPolicy = (policy: Policy): void => {
    setEditingPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleSubmitPolicy = async (
    data: Omit<Policy, "id" | "createdAt" | "updatedAt">
  ): Promise<void> => {
    try {
      if (editingPolicy !== null) {
        // Update existing policy
        await updateMutation.mutateAsync({
          policyId: editingPolicy.id,
          data,
        })
        toast({
          title: "Policy updated",
          description: "Your policy has been updated successfully.",
        })
      } else {
        // Create new policy
        await createMutation.mutateAsync(data)
        toast({
          title: "Policy added",
          description: "Your policy has been added successfully.",
        })
      }
      setIsDialogOpen(false)
    } catch (error: unknown) {
      console.error("Failed to save policy:", error)
      toast({
        variant: "destructive",
        title: "Error saving policy",
        description:
          getErrorMessage(error) ?? "Failed to save policy. Please try again.",
      })
    }
  }

  const handleDeletePolicy = async (policyId: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(policyId)
      toast({
        title: "Policy deleted",
        description: "The policy has been removed.",
      })
    } catch (error: unknown) {
      console.error("Failed to delete policy:", error)
      toast({
        variant: "destructive",
        title: "Error deleting policy",
        description:
          getErrorMessage(error) ??
          "Failed to delete policy. Please try again.",
      })
    }
  }

  return (
    <div>
      <Header
        title="Shop Policies"
        description="Define your shop's refund, shipping, and other policies"
      />

      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">
              These policies will be used by AI to generate accurate,
              policy-compliant responses.
            </p>
          </div>
          <Button
            onClick={handleAddPolicy}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>

        {isLoading ? (
          <PolicyListSkeleton />
        ) : (
          <PolicyList
            policies={policies}
            onEdit={handleEditPolicy}
            onDelete={(policyId: string): void => {
              void handleDeletePolicy(policyId)
            }}
            isDeleting={
              deleteMutation.isPending ? deleteMutation.variables : undefined
            }
          />
        )}
      </div>

      {/* Add/Edit Policy Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy !== null ? "Edit Policy" : "Add New Policy"}
            </DialogTitle>
          </DialogHeader>
          <PolicyForm
            policy={editingPolicy ?? undefined}
            onSubmit={handleSubmitPolicy}
            onCancel={(): void => setIsDialogOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
