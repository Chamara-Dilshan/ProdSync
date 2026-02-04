import * as XLSX from "xlsx"
import { ExcelProductRow, Product } from "@/types"

export interface ParseResult {
  success: boolean
  data: Omit<Product, "id" | "createdAt" | "updatedAt">[]
  errors: string[]
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<ExcelProductRow>(worksheet)

        const products: Omit<Product, "id" | "createdAt" | "updatedAt">[] = []
        const errors: string[] = []

        jsonData.forEach((row, index) => {
          const rowNum = index + 2 // Excel rows start at 1, plus header row

          // Validate required fields
          if (
            row.name === null ||
            row.name === undefined ||
            row.name.toString().trim() === ""
          ) {
            errors.push(`Row ${rowNum}: Product name is required`)
            return
          }

          // Parse and validate the product
          const product: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
            name: row.name.toString().trim(),
            description: row.description?.toString().trim() ?? undefined,
            price:
              typeof row.price === "number"
                ? row.price
                : (() => {
                    const parsed = parseFloat(row.price?.toString() ?? "0")
                    return parsed !== 0 && !isNaN(parsed) ? parsed : undefined
                  })(),
            currency: row.currency?.toString().trim() ?? "USD",
            sizes: parseCommaSeparated(row.sizes),
            colors: parseCommaSeparated(row.colors),
            materials: parseCommaSeparated(row.materials),
            careInstructions:
              row.careInstructions?.toString().trim() ?? undefined,
            customizationOptions:
              row.customizationOptions?.toString().trim() ?? undefined,
            processingTime: row.processingTime?.toString().trim() ?? undefined,
            tags: parseCommaSeparated(row.tags),
            sku: row.sku?.toString().trim() ?? undefined,
          }

          products.push(product)
        })

        resolve({
          success: errors.length === 0,
          data: products,
          errors,
        })
      } catch {
        resolve({
          success: false,
          data: [],
          errors: ["Failed to parse Excel file. Please check the file format."],
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ["Failed to read the file."],
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

function parseCommaSeparated(value: string | undefined): string[] | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined
  }
  const items = value
    .toString()
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
  return items.length > 0 ? items : undefined
}

export function generateExcelTemplate(): Blob {
  const template = [
    {
      name: "Example Product",
      description: "A great product description",
      price: 29.99,
      currency: "USD",
      sizes: "Small, Medium, Large",
      colors: "Red, Blue, Green",
      materials: "Cotton, Polyester",
      careInstructions: "Machine wash cold, tumble dry low",
      customizationOptions: "Custom engraving available",
      processingTime: "3-5 business days",
      tags: "handmade, gift, unique",
      sku: "PROD-001",
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(template)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products")

  // Set column widths
  worksheet["!cols"] = [
    { wch: 20 }, // name
    { wch: 40 }, // description
    { wch: 10 }, // price
    { wch: 8 }, // currency
    { wch: 25 }, // sizes
    { wch: 25 }, // colors
    { wch: 25 }, // materials
    { wch: 40 }, // careInstructions
    { wch: 30 }, // customizationOptions
    { wch: 20 }, // processingTime
    { wch: 30 }, // tags
    { wch: 15 }, // sku
  ]

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
