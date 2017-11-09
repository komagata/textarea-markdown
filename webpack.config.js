const path = require('path');

module.exports = {
   entry: "./example/index.js",
   output: {
      path: path.resolve(__dirname, 'example/'),
      filename: "bundle.js"
   },
   devServer: {
      contentBase: path.resolve(__dirname, "example"),
      publicPath: '/',
      watchContentBase: true
   }
};
