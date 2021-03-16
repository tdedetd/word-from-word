const path = require('path');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    'game.js': './src/js/game.js',
    'levels.js': './src/js/levels.js',
    'main.js': './src/js/main.js',
    'modal.js': './src/js/modal.js',
    'register.js': './src/js/register.js',
    'stats.js': './src/js/stats.js',
    game: './src/style/game.less',
    levels: './src/style/levels.less',
    main: './src/style/main.less',
    news: './src/style/news.less',
    profile: './src/style/profile.less',
    stats: './src/style/stats.less',
    grid: './src/style/grid.less'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name]'
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
        test: /\.less$/,
        include: path.resolve(__dirname, 'src/style'),
        use: [
          MiniCssExtractPlugin.loader,
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
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style/[name].css'
    })
  ]
};
