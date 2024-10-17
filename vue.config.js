// vue.config.js
const { merge } = require("webpack-merge");
const path = require("path");
// const ThemeCssExtractPlugin = require("@zougt/theme-css-extract-webpack-plugin"); //主题插件
const Timestamp = new Date().getTime();
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
    // new ThemeCssExtractPlugin({
    //   extract: true,
    //   multipleScopeVars: [
    //     {
    //       scopeName: "theme-light",
    //       path: path.resolve(__dirname, "src/assets/styles/theme-light.scss"), // 默认主题的 SCSS 文件
    //     },
    //     {
    //       scopeName: "theme-dark",
    //       path: path.resolve(__dirname, "src/assets/styles/theme-dark.scss"), // 深色主题的 SCSS 文件
    //     },
    //   ],
    //   themeLinkTagId: "theme-style", // 注入主题样式的标签 id
    //   themeLinkTagAppend: true,
    //   arbitraryMode: true,
    //   defaultScopeName: "theme-light",
    //   defaultPrimaryColor: "#409EFF",
    //   // outputDir: path.resolve(__dirname, "public/theme/"), // 修改为相对于 dist 目录的正确路径
    //   // customThemeOutputPath: path.resolve(__dirname, "public/themes/"),
    //   customThemeCssFileName: (scopeName) => {
    //     return `${scopeName}`;
    //   },
    //   // customLinkHref: (scopeName) => {
    //   //   // 根据 scopeName 返回不同的路径
    //   //   if (scopeName === "theme-dark") {
    //   //     return "/static/theme/theme-dark.css";
    //   //   }
    //   //   return "/static/theme/theme-light.css";
    //   // }, // 自定义主题样式的 link 标签的 href 属性
    // }),
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
