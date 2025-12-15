const path = require('path');

module.exports = {
   mode: 'development',
   entry: "./example/index.js",
   output: {
      path: path.resolve(__dirname, 'example/'),
      filename: "bundle.js"
   },
   devServer: {
      static: {
         directory: path.resolve(__dirname, "example"),
         watch: true
      }
   }
};
