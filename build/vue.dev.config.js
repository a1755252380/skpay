const port = process.env.port || process.env.npm_config_port || 80;
const webpack = require("webpack");
module.exports = {
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    port: port,
    open: true,
    proxy: {
      [process.env.VUE_APP_ORDER_API]: {
        // target: "http://192.168.1.26:35312",
        target: "https://www.two-buddy.in",
        changeOrigin: true,
        pathRewrite: {
          ["^" + process.env.VUE_APP_ORDER_API]: process.env.VUE_APP_ORDER_API,
        },
        logLevel: "debug",
      },
    },
    disableHostCheck: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
