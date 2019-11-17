const path = require('path');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = isProd => ({
  entry: {
    game: './src/js/game.js',
    levels: './src/js/levels.js',
    main: './src/js/main.js',
    modal: './src/js/modal.js',
    register: './src/js/register.js',
    stats: './src/js/stats.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? '[name].js' : '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: 'env',
            plugins: 'transform-class-properties'
          }
        }
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, 'src/style'),
        use: ExtractTextWebpackPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                url: false
              }
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: true }
            }
          ]
        })
      }
    ]
  },
  plugins: []
});
