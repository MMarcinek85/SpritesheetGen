# Clean and reinstall everything
Write-Host "Starting complete rebuild process..." -ForegroundColor Green

Write-Host "Step 1: Removing node_modules and dist directories..." -ForegroundColor Cyan
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force
npm cache verify

Write-Host "Step 3: Reinstalling dependencies..." -ForegroundColor Cyan
npm install --no-fund
npm install webpack webpack-cli --save-dev --no-fund

Write-Host "Step 4: Verifying webpack installation..." -ForegroundColor Cyan
npx webpack --version

if ($LASTEXITCODE -eq 0) {
    Write-Host "Webpack installed correctly!" -ForegroundColor Green
    
    Write-Host "Step 5: Building a minimal test bundle..." -ForegroundColor Cyan
    npx webpack --config simple-webpack.config.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful! Would you like to start the development server? (y/n)" -ForegroundColor Green
        $startServer = Read-Host
        if ($startServer -eq "y") {
            npx webpack serve --open
        }
    } else {
        Write-Host "Build failed. Please check the error messages above." -ForegroundColor Red
    }
} else {
    Write-Host "Webpack installation verification failed. Please check the error messages above." -ForegroundColor Red
}
