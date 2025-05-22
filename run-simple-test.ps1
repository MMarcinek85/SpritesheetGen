# Script to run simplified test
Write-Host "Building simple test app..." -ForegroundColor Cyan

# Use the new webpack config with the simple test
npx webpack --config webpack.new.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Simple test build successful!`n" -ForegroundColor Green
    
    # Start dev server if build is successful
    $startServer = Read-Host "Start dev server? (y/n)"
    if ($startServer -eq "y") {
        npx webpack serve --config webpack.new.js --open
    }
} else {
    Write-Host "`n❌ Build failed. Check the errors above.`n" -ForegroundColor Red
}
