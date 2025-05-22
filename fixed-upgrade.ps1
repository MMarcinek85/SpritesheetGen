# Fixed script to upgrade to the full application
Write-Host "Starting the fixed upgrade process..." -ForegroundColor Green

# Step 1: Ensure we're in the right directory
$workspaceDir = "c:\SpriteGen\spritesheet-generator"
Set-Location -Path $workspaceDir

# Step 2: Ensure webpack and babel are correctly set up
Write-Host "Step 1: Setting up webpack and babel properly..." -ForegroundColor Cyan

# Create proper webpack config with absolute paths
$webpackContent = @"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Define absolute paths to avoid resolution issues
const WORKSPACE_DIR = '$($workspaceDir.Replace("\", "\\"))';

module.exports = {
  mode: 'development',
  entry: path.resolve(WORKSPACE_DIR, 'src', 'app.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(WORKSPACE_DIR, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      },
      {
        test: /\\.json$/,
        type: 'json'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(WORKSPACE_DIR, 'src', 'index.html')
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  devServer: {
    static: {
      directory: path.resolve(WORKSPACE_DIR, 'public')
    },
    port: 8080,
    open: true
  }
};
"@

# Write the fixed webpack config to a file
$webpackContent | Out-File -FilePath "fixed-webpack.config.js" -Encoding utf8

# Step 3: Run webpack with the fixed config
Write-Host "Step 2: Building the full application..." -ForegroundColor Cyan
npx webpack --config fixed-webpack.config.js

# Step 4: Check if build succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Full application build successful!" -ForegroundColor Green
    
    # Ask to start the server
    $startServer = Read-Host "Start the development server? (y/n)"
    
    if ($startServer -eq "y") {
        Write-Host "Starting development server..." -ForegroundColor Cyan
        npx webpack serve --config fixed-webpack.config.js --open
    }
} else {
    Write-Host "`n❌ Build failed. Let's try to identify the issue..." -ForegroundColor Red
    
    # Offer to build the minimal app again to verify the basic setup
    $testMinimal = Read-Host "Test the minimal app again? (y/n)"
    
    if ($testMinimal -eq "y") {
        Write-Host "Building minimal app..." -ForegroundColor Cyan
        
        # Create minimal webpack config with absolute paths
        $minimalWebpackContent = @"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Define absolute paths to avoid resolution issues
const WORKSPACE_DIR = '$($workspaceDir.Replace("\", "\\"))';

module.exports = {
  mode: 'development',
  entry: path.resolve(WORKSPACE_DIR, 'src', 'minimal-app.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(WORKSPACE_DIR, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(WORKSPACE_DIR, 'src', 'minimal.html')
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
"@
        
        # Write the minimal webpack config to a file
        $minimalWebpackContent | Out-File -FilePath "fixed-minimal-webpack.config.js" -Encoding utf8
        
        # Build with minimal config
        npx webpack --config fixed-minimal-webpack.config.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Minimal app build successful! The issue is with the full application components." -ForegroundColor Green
            npx webpack serve --config fixed-minimal-webpack.config.js --open
        } else {
            Write-Host "`n❌ Even minimal app build failed. There might be an issue with the basic setup." -ForegroundColor Red
        }
    }
}
