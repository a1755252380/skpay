// vue.config.js
const { merge } = require("webpack-merge");
const path = require("path");
const GenerateAssetPlugin = require("generate-asset-webpack-plugin");
const versionInfo = require("./dist/version.json");
console.log(versionInfo);

const moment = require("moment");
const Timestamp = new Date().getTime();
function versionChange(version) {
  console.log(version);

  // 获取当前版本号
  let [major, minor, patch] = version.split(".").map(Number);
  // 增加修订号
  patch += 1;
  // 检查修订号是否需要进位
  if (patch >= 10) {
    patch = 0;
    minor += 1;
  }
  // 检查次版本号是否需要进位
  if (minor >= 10) {
    minor = 0;
    major += 1;
  }
  return `${major}.${minor}.${patch}`;
}
const commonConfig = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  output: {
    filename: `static/js/[name].${Timestamp}.js`,
    chunkFilename: `static/js/[name].${Timestamp}.js`,
  },

  plugins: [
    //生成版本号
    new GenerateAssetPlugin({
      filename: "version.json",
      fn: (compilation, cb) => {
        const versionData = {
          version: versionChange(versionInfo.version),
          buildTime: Timestamp,
          buildDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        cb(null, JSON.stringify(versionData, null, 2));
      },
    }),
  ],
};

const devConfig = require("./build/vue.dev.config.js");
const prodConfig = require("./build/vue.prod.config.js");
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: process.env.NODE_ENV === "development",
  productionSourceMap: false,
  css: {
    extract: {
      filename: `static/css/[name].${Timestamp}.css`,
      chunkFilename: `static/css/[name].${Timestamp}.css`,
    },
  },
  configureWebpack: (config) => {
    const mergedConfig = merge(
      commonConfig,
      process.env.NODE_ENV === "production" ? prodConfig : devConfig
    );
    return mergedConfig;
  },
  chainWebpack: (config) => {
    ////
    config.module
      .rule("svg")
      .exclude.add(path.resolve("src/assets/icons"))
      .end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(path.resolve("src/assets/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();

    config.when(process.env.NODE_ENV !== "development", (config) => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            inline: /runtime\..*\.js$/,
          },
        ])
        .end();

      config.optimization.splitChunks({
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
            test: path.resolve(__dirname, "src/components"),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      });
      config.optimization.runtimeChunk("single");
    });

    if (process.env.NODE_ENV === "production") {
      // 仅在生产环境中删除 prefetch 和 preload 插件
      config.plugins.delete("prefetch");
      config.plugins.delete("preload");
    }
  },
};
