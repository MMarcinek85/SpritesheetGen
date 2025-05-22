# Comprehensive fix script
Write-Host "Fixing SpriteGen project..." -ForegroundColor Green

# Step 1: Clean up any existing configurations and problematic files
Write-Host "Step 1: Cleaning up problematic files..." -ForegroundColor Cyan
Remove-Item -Force -ErrorAction SilentlyContinue .\.babelrc
Remove-Item -Force -ErrorAction SilentlyContinue .\.babelrc.js
Remove-Item -Force -ErrorAction SilentlyContinue .\babel.config.js

# Step 2: Create a simple working webpack configuration
Write-Host "Step 2: Creating simple working webpack configuration..." -ForegroundColor Cyan

$simpleConfig = @'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/minimal-app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/minimal.html'
    })
  ]
};
'@

$simpleConfig | Out-File -FilePath "final-webpack.config.js" -Encoding utf8

# Step 3: Make sure we have the right versions of all dependencies
Write-Host "Step 3: Installing dependencies with specific versions..." -ForegroundColor Cyan
npm install --save-dev webpack@5.74.0 webpack-cli@4.10.0 webpack-dev-server@4.10.0
npm install --save-dev @babel/core@7.18.10 @babel/preset-env@7.18.10 @babel/preset-react@7.18.6 babel-loader@8.2.5
npm install --save-dev html-webpack-plugin@5.5.0 css-loader@6.7.1 style-loader@3.3.1

# Step 4: Build with the new config
Write-Host "Step 4: Building with the new configuration..." -ForegroundColor Cyan
npx webpack --config final-webpack.config.js --color

# Step 5: Offer to start the server if build is successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
    
    $startServer = Read-Host "Start dev server? (y/n)"
    if ($startServer -eq "y") {
        Write-Host "Starting dev server..." -ForegroundColor Cyan
        npx webpack serve --config final-webpack.config.js --open
    }
} else {
    Write-Host "`n❌ Build failed. Check errors above." -ForegroundColor Red
}
