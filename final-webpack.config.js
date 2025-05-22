const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Use absolute paths to avoid resolution issues
const WORKSPACE_DIR = path.resolve(__dirname);

module.exports = {
  mode: 'development',
  entry: path.resolve(WORKSPACE_DIR, 'src', 'minimal-app.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(WORKSPACE_DIR, 'dist')
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
  },  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(WORKSPACE_DIR, 'src', 'minimal.html')
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
};
