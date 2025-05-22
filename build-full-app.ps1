# Script to build the full application
Write-Host "Building the full SpriteSheet Generator application..." -ForegroundColor Green

# Step 1: Update the working webpack config to use the main app
Write-Host "Updating webpack config to use the main app..." -ForegroundColor Cyan

$webpackConfig = Get-Content -Path working-webpack.js
$updatedConfig = $webpackConfig -replace "entry: './src/simple-test.js',", "entry: './src/app.js',"
$updatedConfig | Set-Content -Path working-webpack.js

# Step 2: Build the application
Write-Host "Building the full application..." -ForegroundColor Cyan
npx webpack --config working-webpack.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Full application build successful!" -ForegroundColor Green
    
    # Ask to start the dev server
    $startServer = Read-Host "Start the development server to view the full application? (y/n)"
    if ($startServer -eq "y") {
        Write-Host "Starting dev server..." -ForegroundColor Cyan
        npx webpack serve --config working-webpack.js
    }
} else {
    # If the full app fails, revert to the simple test
    Write-Host "`n❌ Full application build failed." -ForegroundColor Red
    
    # Ask user what to do
    $fallbackOption = Read-Host "Would you like to revert to the simple test app? (y/n)"
    if ($fallbackOption -eq "y") {
        $webpackConfig | Set-Content -Path working-webpack.js
        Write-Host "Reverting to simple test app..." -ForegroundColor Yellow
        npx webpack --config working-webpack.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Simple test app build successful! Starting dev server..." -ForegroundColor Green
            npx webpack serve --config working-webpack.js
        }
    }
}
