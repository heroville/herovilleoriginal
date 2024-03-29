const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const htmlPlugin = new HtmlWebpackPlugin({
    template: "./src/index.html",
    filename: "./index.html"
  });
  
  const miniCssExtractPlugin = new MiniCssExtractPlugin();

  const jQuery = new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
  });

module.exports = {
    entry: './src/index.js',
    plugins: [
        htmlPlugin,
        miniCssExtractPlugin,
        jQuery
    ],
    devtool: 'source-map',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader"],
                generator: {
                  filename: 'scripts/[name][ext][query]'
                }
              },
              {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                generator: {
                  filename: 'styles/[name][ext][query]'
                }                
              },              {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
                generator: {
                  filename: 'styles/[name][ext][query]'
                }             
              },
            {
                test: /\.png/,
                type: 'asset/resource',
                generator: {
                  filename: 'images/[name][ext][query]'
                }
            },            {
              test: /\.ico/,
              type: 'asset/resource',
              generator: {
                filename: '[name][ext][query]'
              }
          },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
              test: /\.html$/i,
              loader: "html-loader",
            },
        ]
    },
    resolve: {
      extensions: ['', '.js'],
    }
};