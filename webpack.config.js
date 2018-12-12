var path = require('path');
const PerspectivePlugin = require("@jpmorganchase/perspective/webpack-plugin");
const webpack = require("webpack");


module.exports = {
  entry: './build/index.js',
  output: {
    path: __dirname + '/hedgeme/assets/static/js/',
    filename: 'bundle.js',
    publicPath: './static/js/'
  },
  resolveLoader: {
      alias: {
          "file-worker-loader": "@jpmorganchase/perspective/src/loader/file_worker_loader.js"
      }
  },
  externals: /\@jupyter|\@phosphor/,
  plugins: [new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en|es|fr)$/), new PerspectivePlugin()],
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.png$/, use: 'file-loader' }
    ]
  }
};