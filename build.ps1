Write-Host "Starting webpack build..." -ForegroundColor Green
$ErrorActionPreference = "Continue"

try {
    Write-Host "Step 1: Building the application..." -ForegroundColor Cyan
    npx webpack --mode development
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Webpack build failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Webpack build completed successfully!" -ForegroundColor Green
    Write-Host "Step 2: Starting the development server..." -ForegroundColor Cyan
    
    # Check if you want to start the dev server
    $startServer = Read-Host "Start development server? (y/n)"
    if ($startServer -eq "y") {
        npx webpack serve --open
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
