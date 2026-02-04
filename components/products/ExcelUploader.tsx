"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { parseExcelFile, generateExcelTemplate } from "@/lib/utils/excel-parser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileSpreadsheet, Download, Loader2, X } from "lucide-react"
import { Product } from "@/types"

interface ExcelUploaderProps {
  onProductsParsed: (
    products: Omit<Product, "id" | "createdAt" | "updatedAt">[]
  ) => void
  isUploading?: boolean
}

export function ExcelUploader({
  onProductsParsed,
  isUploading,
}: ExcelUploaderProps): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [preview, setPreview] = useState<
    Omit<Product, "id" | "createdAt" | "updatedAt">[]
  >([])
  const { toast } = useToast()

  const handleDrop = useCallback(
    async (acceptedFiles: File[]): Promise<void> => {
      const selectedFile = acceptedFiles[0]
      if (selectedFile === null || selectedFile === undefined) {
        return
      }

      setFile(selectedFile)
      setParsing(true)

      const result = await parseExcelFile(selectedFile)

      if (result.errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Parsing errors",
          description:
            result.errors.slice(0, 3).join(", ") +
            (result.errors.length > 3
              ? ` and ${result.errors.length - 3} more...`
              : ""),
        })
      }

      if (result.data.length > 0) {
        setPreview(result.data)
        toast({
          title: "File parsed",
          description: `Found ${result.data.length} products ready to import.`,
        })
      }

      setParsing(false)
    },
    [toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files): void => {
      void handleDrop(files)
    },
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  const handleDownloadTemplate = (): void => {
    const blob = generateExcelTemplate()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prodsync-template.xlsx"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (): void => {
    if (preview.length > 0) {
      onProductsParsed(preview)
    }
  }

  const handleClear = (): void => {
    setFile(null)
    setPreview([])
  }

  return (
    <div className="space-y-4">
      {/* Download Template Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Dropzone */}
      {file === null && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the Excel file here..."
              : "Drag and drop an Excel file, or click to select"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports .xlsx and .xls files
          </p>
        </div>
      )}

      {/* File Info */}
      {file !== null && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {parsing
                      ? "Parsing..."
                      : `${preview.length} products found`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Price</th>
                  <th className="px-4 py-2 text-left font-medium">Colors</th>
                  <th className="px-4 py-2 text-left font-medium">Sizes</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((product, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">
                      {product.price
                        ? `${product.currency || "$"}${product.price}`
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {product.colors?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {product.sizes?.join(", ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 10 && (
            <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
              Showing 10 of {preview.length} products
            </div>
          )}
        </div>
      )}

      {/* Import Button */}
      {preview.length > 0 && (
        <Button
          onClick={handleImport}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import {preview.length} Products
            </>
          )}
        </Button>
      )}
    </div>
  )
}
