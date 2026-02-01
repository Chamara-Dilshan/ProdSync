export interface BuyerMessage {
  content: string
  buyerName?: string
  productName?: string
  orderId?: string
}

export interface GeneratedReply {
  content: string
  provider: string
  model: string
  tone: string
  timestamp: Date
}

export interface AIContext {
  products: {
    id: string
    name: string
    description?: string
    sizes?: string[]
    colors?: string[]
    price?: number
    careInstructions?: string
    customizationOptions?: string
  }[]
  policies: {
    type: string
    title: string
    content: string
  }[]
  tone: string
}

export interface GenerateReplyRequest {
  message: string
  productId?: string
  tone?: string
}

export interface GenerateReplyResponse {
  reply: string
  provider: string
  model: string
}
