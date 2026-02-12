/**
 * Package ProdSync Extension for Distribution
 *
 * This script:
 * 1. Builds the extension
 * 2. Creates a ZIP file with the dist folder
 * 3. Includes installation instructions
 *
 * Usage: node package-for-distribution.js
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const { createWriteStream } = require("fs")
const archiver = require("archiver")

const OUTPUT_ZIP = path.join(__dirname, "..", "ProdSync-Extension.zip")
const DIST_FOLDER = path.join(__dirname, "dist")
const INSTRUCTIONS_FILE = path.join(__dirname, "INSTALLATION_FOR_FRIENDS.md")

console.log("📦 ProdSync Extension Packager\n")

// Step 1: Build the extension
console.log("1️⃣ Building extension...")
try {
  execSync("npm run build", { cwd: __dirname, stdio: "inherit" })
  console.log("✅ Build complete!\n")
} catch (error) {
  console.error("❌ Build failed:", error.message)
  process.exit(1)
}

// Step 2: Verify dist folder exists
if (!fs.existsSync(DIST_FOLDER)) {
  console.error("❌ dist folder not found. Build may have failed.")
  process.exit(1)
}

// Step 3: Create ZIP file
console.log("2️⃣ Creating ZIP package...")

// Delete old ZIP if exists
if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP)
}

const output = createWriteStream(OUTPUT_ZIP)
const archive = archiver("zip", { zlib: { level: 9 } })

output.on("close", function () {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
  console.log(`✅ ZIP created: ${sizeMB} MB\n`)

  console.log("📍 Package location:")
  console.log(`   ${OUTPUT_ZIP}\n`)

  console.log("📋 Next steps:")
  console.log("   1. Send ProdSync-Extension.zip to your friend")
  console.log("   2. They should extract it and follow the instructions")
  console.log("   3. Installation guide is included in the ZIP\n")

  console.log("✨ Done!")
})

archive.on("error", function (err) {
  console.error("❌ ZIP creation failed:", err)
  process.exit(1)
})

archive.pipe(output)

// Add dist folder to ZIP
archive.directory(DIST_FOLDER, "dist")

// Add installation instructions
if (fs.existsSync(INSTRUCTIONS_FILE)) {
  archive.file(INSTRUCTIONS_FILE, { name: "INSTALLATION_INSTRUCTIONS.md" })
}

archive.finalize()
