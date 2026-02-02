Add-Type -AssemblyName System.Drawing

# Create 16x16 icon
$bmp16 = New-Object System.Drawing.Bitmap(16,16)
$g16 = [System.Drawing.Graphics]::FromImage($bmp16)
$g16.Clear([System.Drawing.Color]::FromArgb(59, 130, 246))
$font16 = New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Bold)
$g16.DrawString("PS", $font16, [System.Drawing.Brushes]::White, 0, 2)
$bmp16.Save("public/icons/icon-16.png")
$g16.Dispose()
$bmp16.Dispose()

# Create 48x48 icon
$bmp48 = New-Object System.Drawing.Bitmap(48,48)
$g48 = [System.Drawing.Graphics]::FromImage($bmp48)
$g48.Clear([System.Drawing.Color]::FromArgb(59, 130, 246))
$font48 = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
$g48.DrawString("PS", $font48, [System.Drawing.Brushes]::White, 4, 8)
$bmp48.Save("public/icons/icon-48.png")
$g48.Dispose()
$bmp48.Dispose()

# Create 128x128 icon
$bmp128 = New-Object System.Drawing.Bitmap(128,128)
$g128 = [System.Drawing.Graphics]::FromImage($bmp128)
$g128.Clear([System.Drawing.Color]::FromArgb(59, 130, 246))
$font128 = New-Object System.Drawing.Font("Arial", 64, [System.Drawing.FontStyle]::Bold)
$g128.DrawString("PS", $font128, [System.Drawing.Brushes]::White, 10, 24)
$bmp128.Save("public/icons/icon-128.png")
$g128.Dispose()
$bmp128.Dispose()

Write-Host "Icons created successfully!" -ForegroundColor Green
