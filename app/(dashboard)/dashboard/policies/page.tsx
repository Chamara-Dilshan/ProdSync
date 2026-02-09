"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
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
import {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "@/lib/firebase/firestore"
import { Policy } from "@/types"
import { getErrorMessage } from "@/types/errors"
import { Plus, Loader2 } from "lucide-react"

export default function PoliciesPage(): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPolicies = async (): Promise<void> => {
      if (user === null) {
        return
      }
      try {
        const data = await getPolicies(user.uid)
        setPolicies(data)
      } catch (error: unknown) {
        console.error("Failed to load policies:", error)
        toast({
          variant: "destructive",
          title: "Error loading policies",
          description:
            getErrorMessage(error) ??
            "Failed to load policies. Please check your Firebase configuration.",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchPolicies()
  }, [user, toast])

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
    if (user === null) {
      return
    }

    setIsSubmitting(true)
    try {
      if (editingPolicy !== null) {
        await updatePolicy(user.uid, editingPolicy.id, data)
        setPolicies((prev) =>
          prev.map((p) => (p.id === editingPolicy.id ? { ...p, ...data } : p))
        )
        toast({
          title: "Policy updated",
          description: "Your policy has been updated successfully.",
        })
      } else {
        const id = await createPolicy(user.uid, data)
        setPolicies((prev) => [
          {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Policy,
          ...prev,
        ])
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePolicy = async (policyId: string): Promise<void> => {
    if (user === null) {
      return
    }

    setDeletingId(policyId)
    try {
      await deletePolicy(user.uid, policyId)
      setPolicies((prev) => prev.filter((p) => p.id !== policyId))
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
    } finally {
      setDeletingId(null)
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <PolicyList
            policies={policies}
            onEdit={handleEditPolicy}
            onDelete={(policyId: string): void => {
              void handleDeletePolicy(policyId)
            }}
            isDeleting={deletingId ?? undefined}
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
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
