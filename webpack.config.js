const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: path.resolve(__dirname, 'src/main.js'),
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      publicPath: '',
    },
    resolve: {
      extensions: ['.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.js$/u,
          exclude: /node_modules/u,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: 'defaults',
                    },
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.css$/u,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/u,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][hash][ext]',
          },
        },
        {
          test: /\.(woff2?|ttf|eot)$/u,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][hash][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
      }),
      new MiniCssExtractPlugin({
        filename: 'styles/[name].css',
        chunkFilename: 'styles/[id].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'dist'),
          },
          {
            from: path.resolve(__dirname, 'src/styles/darkStyle.css'),
            to: path.resolve(__dirname, 'dist/darkStyle.css'),
          },
        ],
      }),
      new webpack.ProvidePlugin({
        angular: 'angular',
        $: 'jquery',
        jQuery: 'jquery',
        'window.angular': 'angular',
        'window.jQuery': 'jquery',
      }),
    ],
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: 5173,
      open: true,
      hot: true,
      historyApiFallback: true,
    },
  };
};
