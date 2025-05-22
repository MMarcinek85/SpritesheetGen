# Diagnose webpack installation
Write-Host "====== DIAGNOSING WEBPACK INSTALLATION ======" -ForegroundColor Yellow

Write-Host "`n1. Checking webpack version:" -ForegroundColor Cyan
$webpackVersion = npm list webpack
Write-Host $webpackVersion

Write-Host "`n2. Checking webpack-cli version:" -ForegroundColor Cyan 
$webpackCliVersion = npm list webpack-cli
Write-Host $webpackCliVersion

Write-Host "`n3. Checking node and npm versions:" -ForegroundColor Cyan
node -v
npm -v

Write-Host "`n4. Checking package.json:" -ForegroundColor Cyan
Get-Content -Path "package.json" | Select-String "webpack"

Write-Host "`n5. Checking if webpack modules exist:" -ForegroundColor Cyan
$webpackExists = Test-Path -Path "node_modules\webpack"
$webpackCliExists = Test-Path -Path "node_modules\webpack-cli"
Write-Host "webpack module exists: $webpackExists"
Write-Host "webpack-cli module exists: $webpackCliExists"

Write-Host "`n6. Attempting to run webpack directly:" -ForegroundColor Cyan
try {
    node_modules\.bin\webpack --version
} catch {
    Write-Host "Error running webpack directly: $_" -ForegroundColor Red
}

Write-Host "`n====== DIAGNOSIS COMPLETE ======" -ForegroundColor Yellow
