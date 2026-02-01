"use client"

import { Policy, POLICY_TYPE_LABELS } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, FileText, Check, X } from "lucide-react"

interface PolicyListProps {
  policies: Policy[]
  onEdit: (policy: Policy) => void
  onDelete: (policyId: string) => void
  isDeleting?: string
}

export function PolicyList({
  policies,
  onEdit,
  onDelete,
  isDeleting,
}: PolicyListProps) {
  if (policies.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No policies yet</h3>
          <p className="text-gray-500 mb-4">
            Add your shop policies to help AI generate accurate responses
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {policies.map((policy) => (
        <Card key={policy.id} className={!policy.isActive ? "opacity-60" : ""}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    {POLICY_TYPE_LABELS[policy.type]}
                  </span>
                  {policy.isActive ? (
                    <span className="text-xs flex items-center gap-1 text-green-600">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="text-xs flex items-center gap-1 text-gray-400">
                      <X className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{policy.title}</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                  {policy.content}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(policy)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(policy.id)}
                  disabled={isDeleting === policy.id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
