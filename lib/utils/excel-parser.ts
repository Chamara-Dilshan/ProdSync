import * as XLSX from "xlsx"
import { Product } from "@/types"

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

        // Convert to JSON with header normalization
        const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          {
            raw: false, // Convert all cells to strings first
            defval: "", // Default value for empty cells
          }
        )

        const products: Omit<Product, "id" | "createdAt" | "updatedAt">[] = []
        const errors: string[] = []

        // Normalize column headers (case-insensitive mapping)
        const normalizeKey = (key: string): string =>
          key.toLowerCase().trim().replace(/\s+/g, "")

        rawData.forEach((rawRow, index) => {
          const rowNum = index + 2 // Excel rows start at 1, plus header row

          // Create a normalized row object
          const row: Record<string, string | undefined> = {}
          Object.keys(rawRow).forEach((key) => {
            const normalizedKey = normalizeKey(key)
            const value = rawRow[key]
            // Convert value to string, handling various types
            if (value === null || value === undefined || value === "") {
              row[normalizedKey] = undefined
            } else if (typeof value === "string") {
              row[normalizedKey] = value.trim()
            } else if (
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              row[normalizedKey] = String(value).trim()
            } else {
              // For objects/arrays, try JSON stringification
              row[normalizedKey] = JSON.stringify(value).trim()
            }
          })

          // Skip completely empty rows
          const hasAnyData = Object.values(row).some(
            (val) => val !== undefined && val !== ""
          )
          if (!hasAnyData) {
            return
          }

          // Validate required fields (check multiple possible header names)
          const name =
            row["name"] ??
            row["productname"] ??
            row["product"] ??
            row["title"] ??
            undefined

          if (name === undefined || name === "") {
            errors.push(
              `Row ${rowNum}: Product name is required. Found columns: ${Object.keys(rawRow).join(", ")}`
            )
            return
          }

          // Helper to get value from multiple possible column names
          const getField = (...keys: string[]): string | undefined => {
            for (const key of keys) {
              const value = row[normalizeKey(key)]
              if (value !== undefined && value !== "") {
                return value
              }
            }
            return undefined
          }

          // Parse and validate the product
          const product: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
            name: name,
            description: getField("description", "desc"),
            price: (() => {
              const priceStr = getField("price", "cost", "amount")
              if (priceStr === undefined) {
                return undefined
              }
              const parsed = parseFloat(priceStr)
              return !isNaN(parsed) && parsed > 0 ? parsed : undefined
            })(),
            currency: getField("currency") ?? "USD",
            sizes: parseCommaSeparated(
              getField("sizes", "size", "availablesizes")
            ),
            colors: parseCommaSeparated(
              getField("colors", "color", "availablecolors")
            ),
            materials: parseCommaSeparated(getField("materials", "material")),
            careInstructions: getField("careinstructions", "care"),
            customizationOptions: getField(
              "customizationoptions",
              "customization"
            ),
            processingTime: getField("processingtime", "leadtime", "time"),
            tags: parseCommaSeparated(getField("tags", "keywords")),
            sku: getField("sku", "productcode", "code"),
          }

          products.push(product)
        })

        resolve({
          success: errors.length === 0,
          data: products,
          errors,
        })
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [
            `Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}. Please check the file format.`,
          ],
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
