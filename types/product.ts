export interface Product {
  id: string
  name: string
  description?: string
  price?: number
  currency?: string
  sizes?: string[]
  colors?: string[]
  materials?: string[]
  careInstructions?: string
  customizationOptions?: string
  processingTime?: string
  tags?: string[]
  sku?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductFormData {
  name: string
  description?: string
  price?: number
  currency?: string
  sizes?: string
  colors?: string
  materials?: string
  careInstructions?: string
  customizationOptions?: string
  processingTime?: string
  tags?: string
  sku?: string
}

export interface ExcelProductRow {
  name: string
  description?: string
  price?: string | number
  currency?: string
  sizes?: string
  colors?: string
  materials?: string
  careInstructions?: string
  customizationOptions?: string
  processingTime?: string
  tags?: string
  sku?: string
}
