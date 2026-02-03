import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { crx } from "@crxjs/vite-plugin"
import manifest from "./public/manifest.json"
import path from "path"

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@ui": path.resolve(__dirname, "./src/components/ui"),
    },
  },
})
