const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common(false), {
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    port: 8080
  }
});
