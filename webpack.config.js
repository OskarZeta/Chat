const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV.trim();
const port = process.env.PORT || 4000;

module.exports = () => {
  return {
    plugins: [
      new webpack.DefinePlugin({
        URL: mode === 'development' ? 
          JSON.stringify('ws://localhost:4000') : 
          JSON.stringify('ws://oskarzeta-chat.herokuapp.com:' + port)
      }),
      new MiniCssExtractPlugin({
        filename: '../css/bundle.css'
      })
    ],
    entry: path.join(__dirname, 'src/frontend/index.js'),
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public/assets/js'),
    },
    module: {
      rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: '/node_modules/'
      },
      {
        test: /\.css$/,
        use: [
          { loader: mode === 'development' ?
            'style-loader' : MiniCssExtractPlugin.loader },
          { loader: 'css-loader' }
        ]
      }]
    },
    devServer: {
      contentBase: './public',
      publicPath: '/assets/js',
      compress: true,
      stats: 'errors-only',
      port: 3000
    },
    devtool: 'source-map'
  };
};