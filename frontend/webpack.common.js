const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const FILE_LOADER = {
  loader: 'file-loader',
  options: {
    name: '[name].[ext]',
    outputPath: 'assets'
  }
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    fontawesome: './fontawesome.js',
    styles: './styles.js',
    game: './js/game.js',
    levels: './js/levels.js',
    main: './js/main.js',
    register: './js/register.js',
    stats: './js/stats.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/'
            }
          },
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(png|eot|woff(2)?|ttf|svg)$/,
        use: FILE_LOADER,
      },
      {
        test: /\.jpg$/,
        use: [
          FILE_LOADER,
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 70
              }
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style/[name].css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'assets', 'captcha.png'),
          to: 'assets/[name][ext]'
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'shared'
    }
  }
};
