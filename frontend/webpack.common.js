const path = require('path');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

module.exports = isProd => ({
  entry: {
    'game.js': './src/js/game.js',
    'levels.js': './src/js/levels.js',
    'main.js': './src/js/main.js',
    'modal.js': './src/js/modal.js',
    'register.js': './src/js/register.js',
    'stats.js': './src/js/stats.js',
    game: './src/style/game.scss',
    levels: './src/style/levels.scss',
    main: './src/style/main.scss',
    news: './src/style/news.scss',
    profile: './src/style/profile.scss',
    stats: './src/style/stats.scss',
    grid: './src/style/grid.less'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]'
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
      },
      {
        test: /\.less$/,
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
              loader: 'less-loader',
              options: { sourceMap: true }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextWebpackPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new FixStyleOnlyEntriesPlugin()
  ]
});
