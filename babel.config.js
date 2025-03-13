module.exports = {
  presets: [
    "@vue/cli-plugin-babel/preset",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: 3, // 确保使用 core-js 3
      },
    ],
  ],
  env: {
    development: {
      plugins: ["dynamic-import-node"],
    },
  },
};
