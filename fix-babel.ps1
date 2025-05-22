# Clean and reinstall babel dependencies
Write-Host "Cleaning babel-related dependencies..." -ForegroundColor Cyan

# Install core dependencies
Write-Host "Installing babel packages..." -ForegroundColor Yellow
npm install --save-dev @babel/core@7.21.8 @babel/preset-env@7.21.5 @babel/preset-react@7.18.6 babel-loader@9.1.2

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Babel dependencies installed successfully!`n" -ForegroundColor Green
    
    # Try building with the new webpack config
    Write-Host "Running webpack with the new config..." -ForegroundColor Cyan
    npx webpack --config webpack.new.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Build successful!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Build failed. Check the errors above.`n" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Failed to install dependencies.`n" -ForegroundColor Red
}
