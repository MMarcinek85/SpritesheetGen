# Clean setup and build script
Write-Host "Setting up a clean webpack build..." -ForegroundColor Green

# Step 1: Remove any babel config files
Write-Host "Removing any existing babel config files..." -ForegroundColor Cyan
Remove-Item -Force -ErrorAction SilentlyContinue .\.babelrc
Remove-Item -Force -ErrorAction SilentlyContinue .\.babelrc.js
Remove-Item -Force -ErrorAction SilentlyContinue .\babel.config.js

# Step 2: Install core dependencies with specific versions that work well together
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install --save-dev webpack@5.74.0 webpack-cli@4.10.0 webpack-dev-server@4.10.0
npm install --save-dev @babel/core@7.18.10 @babel/preset-env@7.18.10 @babel/preset-react@7.18.6 babel-loader@8.2.5
npm install --save-dev html-webpack-plugin@5.5.0 css-loader@6.7.1 style-loader@3.3.1

# Step 3: Build with the working webpack config
Write-Host "Building with the working webpack config..." -ForegroundColor Cyan
npx webpack --config ./working-webpack.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
    
    # Ask to start the dev server
    $startServer = Read-Host "Start the development server? (y/n)"    if ($startServer -eq "y") {
        Write-Host "Starting dev server..." -ForegroundColor Cyan
        npx webpack serve --config ./working-webpack.js
    }
} else {
    Write-Host "`n❌ Build failed. Check the error messages above." -ForegroundColor Red
}
