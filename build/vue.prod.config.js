const CompressionPlugin = require("compression-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
let UglifyjsWebpackPlugin = require("uglifyjs-webpack-plugin");
let OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const port = process.env.port || process.env.npm_config_port || 80;
const Timestamp = new Date().getTime();
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  mode: "production", //打包环境配置
  devServer: {
    host: "0.0.0.0",
    port: port,
    open: true,
    progress: true,
    proxy: {
      [process.env.VUE_APP_ORDER_API]: {
        target: "https://www.sk-pay.in",
        changeOrigin: true,
        pathRewrite: {
          ["^" + process.env.VUE_APP_ORDER_API]:
            "/" + process.env.VUE_APP_ORDER_API,
        },
        logLevel: "debug",
      },
    },
    disableHostCheck: true,
  },
  optimization: {
    splitChunks: {
      //用于拆分代码，找到 chunk 中共同依赖的模块进行“提取”和“分离”到单独的文件中，减少打包后体积，可以避免内存溢出的问题。
      chunks: "all",
      cacheGroups: {
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial",
        },
        elementUI: {
          name: "chunk-elementUI",
          test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
          priority: 20,
        },
        commons: {
          name: "chunk-commons",
          test: resolve("src/components"),
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },

  performance: {
    //  webpack 的性能提示
    hints: "warning", // 显示警告信息
    maxEntrypointSize: 5 * 1024 * 1024, // 设置入口文件的最大体积为5M  （以字节为单位）
    maxAssetSize: 20 * 1024 * 1024, // 设置输出文件的最大体积为20M  （以字节为单位）
    assetFilter(assetFilename) {
      // 提供资源文件名的断言函数
      return assetFilename.endsWith(".js") || assetFilename.endsWith(".css");
    },
  },

  plugins: [
    // 使用 ScriptExtHtmlWebpackPlugin 插件来优化 script 的加载
    new ScriptExtHtmlWebpackPlugin({
      inline: /runtime\..*\.js$/,
    }), //minimizer 用于配置代码压缩的方式。
    new UglifyjsWebpackPlugin({
      // 生产环境压缩JS
      cache: false, //是否否启用缓存
      parallel: true, //多通道并行处理
      sourceMap: false, //生产环境关闭源码映射
      uglifyOptions: {
        warnings: false, //清除警告
        compress: {
          drop_debugger: true, // 清除degugger
          drop_console: true, //清除所有的console信息
        },
      },
    }),
    new OptimizeCssAssetsPlugin(),
    // 使用 gzip 压缩
    new CompressionPlugin({
      cache: false,
      test: /\.(js|css|html|jpe?g|png|gif|svg)?$/i,
      filename: "[path][base].gz[query]",
      algorithm: "gzip",
      minRatio: 0.8,
      deleteOriginalAssets: true,
    }),
  ],
};
