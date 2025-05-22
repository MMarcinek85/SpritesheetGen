# Simple script to test webpack with an existing configuration
Write-Host "Testing webpack with existing configuration file..." -ForegroundColor Green

# Check if webpack is installed
Write-Host "Checking webpack installation..." -ForegroundColor Cyan
$webpackVersion = npm ls webpack --depth=0

Write-Host "Using absolute path for webpack config..." -ForegroundColor Cyan
$configPath = Join-Path -Path $PWD -ChildPath "simple-webpack.config.js"
Write-Host "Config path: $configPath" -ForegroundColor Yellow

# Try running webpack with absolute path
Write-Host "Running webpack with absolute path..." -ForegroundColor Cyan
npx webpack --config "$configPath"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Webpack build successful!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Webpack build failed." -ForegroundColor Red
    
    # Try a super simple test
    Write-Host "Creating minimal webpack config file for testing..." -ForegroundColor Cyan
    
    $minimalConfig = @'
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/minimal-app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
'@
    
    $minimalConfig | Out-File -FilePath "minimal-webpack-test.js"
    
    Write-Host "Running webpack with minimal config..." -ForegroundColor Cyan
    npx webpack --config minimal-webpack-test.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Minimal webpack config works!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Even minimal webpack config failed. Reinstalling webpack..." -ForegroundColor Red
        npm uninstall webpack webpack-cli
        npm install --save-dev webpack@5.74.0 webpack-cli@4.10.0
    }
}
