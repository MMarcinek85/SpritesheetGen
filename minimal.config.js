const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/minimal-app.js',
  output: {
    filename: 'minimal-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/minimal.html',
      filename: 'minimal.html'
    }),
  ],
  devServer: {
    static: './dist',
    port: 8081,
    open: true,
  },
};
