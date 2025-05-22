# Debug webpack build
Set-Location -Path "c:\SpriteGen\spritesheet-generator"

# Save the current error preference and change it
$oldErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"

Write-Host "------------ WEBPACK DEBUG OUTPUT ------------" -ForegroundColor Cyan
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green

Write-Host "`n1. Checking if webpack is installed:" -ForegroundColor Yellow
$webpackVersion = npx webpack --version
Write-Host "Webpack version: $webpackVersion"

Write-Host "`n2. Running webpack with simple config:" -ForegroundColor Yellow
$output = npx webpack --config react-test.config.js 2>&1
Write-Host $output

Write-Host "`n3. Checking the .babelrc.js file:" -ForegroundColor Yellow
if (Test-Path ".babelrc.js") {
    $babelrcContent = Get-Content ".babelrc.js" -Raw
    Write-Host "Content of .babelrc.js:"
    Write-Host $babelrcContent
} else {
    Write-Host ".babelrc.js not found" -ForegroundColor Red
}

Write-Host "`n4. Checking for errors in dist folder:" -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "Dist folder contents:"
    Get-ChildItem "dist" | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "Dist folder not found - build may have failed" -ForegroundColor Red
}

# Restore the original error preference
$ErrorActionPreference = $oldErrorActionPreference

Write-Host "`n------------ DEBUG COMPLETE ------------" -ForegroundColor Cyan
