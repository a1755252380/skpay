import express from "express";
const path = require("path");
const app = express();

// 指定静态文件目录
app.use(express.static(path.join(__dirname, "dist")));

// 所有请求返回index.html，解决SPA的路由问题
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// 启动服务器
const PORT = process.env.PORT || 53216;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
