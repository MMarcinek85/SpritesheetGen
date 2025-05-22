const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // Add stats configuration for more verbose output
    stats: {
        colors: true,
        reasons: true,
        chunks: false,
        modules: false,
        children: false,
    },
    entry: './src/minimal-app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true
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
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            outputPath: 'images/'
                        }
                    }
                ]
            },
            {
                test: /\.json$/,
                type: 'json'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/minimal.html',
            filename: 'index.html',
            inject: true
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 8080,
        historyApiFallback: true,
        open: true
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    mode: 'development'
};