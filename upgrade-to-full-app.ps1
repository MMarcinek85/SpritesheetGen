# Upgrade to full application
Write-Host "Upgrading to full SpriteGenerator application..." -ForegroundColor Green

# Step 1: Check if minimal build works first
Write-Host "Step 1: Verifying minimal build works first..." -ForegroundColor Cyan
npx webpack --config final-webpack.config.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Minimal build failed. Please fix this first before upgrading." -ForegroundColor Red
    exit 1
}

# Step 2: Create full application webpack config
Write-Host "Step 2: Creating full application webpack config..." -ForegroundColor Cyan

$fullConfig = @'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
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
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      },
      {
        test: /\.json$/,
        type: 'json'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
};
'@

$fullConfig | Out-File -FilePath "full-webpack.config.js" -Encoding utf8

# Step 3: Build the full application
Write-Host "Step 3: Building full application..." -ForegroundColor Cyan
npx webpack --config full-webpack.config.js --color

# Step 4: Offer to start the server if build is successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Full application build successful!" -ForegroundColor Green
    
    $startServer = Read-Host "Start dev server for full application? (y/n)"
    if ($startServer -eq "y") {
        Write-Host "Starting dev server..." -ForegroundColor Cyan
        npx webpack serve --config full-webpack.config.js --open
    }
} else {
    Write-Host "`n❌ Full application build failed." -ForegroundColor Red
    Write-Host "This might be due to issues with specific components. Let's debug step by step." -ForegroundColor Yellow
    
    # Offer component-by-component debugging
    $debug = Read-Host "Debug components one by one? (y/n)"
    if ($debug -eq "y") {
        Write-Host "This feature would help debug individual components..." -ForegroundColor Cyan
        # Additional debugging logic could be added here
    }
}
