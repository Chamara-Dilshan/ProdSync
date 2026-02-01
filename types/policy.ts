export type PolicyType =
  | "refund"
  | "shipping"
  | "cancellation"
  | "exchange"
  | "processing"
  | "custom"

export interface Policy {
  id: string
  type: PolicyType
  title: string
  content: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PolicyFormData {
  type: PolicyType
  title: string
  content: string
  isActive: boolean
}

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  refund: "Refund Policy",
  shipping: "Shipping Policy",
  cancellation: "Cancellation Policy",
  exchange: "Exchange Policy",
  processing: "Processing Time",
  custom: "Custom Policy",
}
