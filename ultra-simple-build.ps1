# Ultra simple test script
Write-Host "Running ultra simple webpack build..." -ForegroundColor Green

$configPath = Join-Path -Path $PWD -ChildPath "ultra-simple.config.js"
Write-Host "Using config: $configPath" -ForegroundColor Cyan

# Update or install critical dependencies
Write-Host "Installing core dependencies..." -ForegroundColor Cyan
npm install --save-dev webpack webpack-cli babel-loader @babel/core @babel/preset-env @babel/preset-react html-webpack-plugin

# Run webpack with the absolute path to the config
Write-Host "Running webpack..." -ForegroundColor Cyan
npx webpack --config "$configPath" --color

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Build failed." -ForegroundColor Red
}
