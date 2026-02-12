@echo off
echo ========================================
echo ProdSync Extension Packager
echo ========================================
echo.

REM Step 1: Build the extension
echo [1/3] Building extension...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo BUILD COMPLETE!
echo.

REM Step 2: Create output directory
echo [2/3] Preparing package...
cd ..
if exist "ProdSync-Extension-Package" rmdir /s /q "ProdSync-Extension-Package"
mkdir "ProdSync-Extension-Package"

REM Step 3: Copy files
echo [3/3] Copying files...
xcopy "extension\dist" "ProdSync-Extension-Package\dist" /E /I /Q
copy "extension\INSTALLATION_FOR_FRIENDS.md" "ProdSync-Extension-Package\INSTALLATION_INSTRUCTIONS.md" >nul

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Package created in:
echo %CD%\ProdSync-Extension-Package
echo.
echo Next steps:
echo 1. ZIP the "ProdSync-Extension-Package" folder
echo 2. Send the ZIP to your friend
echo 3. They follow INSTALLATION_INSTRUCTIONS.md
echo.
pause
