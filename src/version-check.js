import { MessageBox, Notification } from "element-ui";

// 发版刷新页面，根据监测上传文件实现刷新
let lastSrcs;

//获取最新页面中的script链接
async function extractNewScripts() {
  // _timestamp避免缓存，获取当前时间戳
  const html = await fetch("/?_timestamp=" + Date.now()).then((resp) =>
    resp.text()
  );
  let result = [];

  result = html
    .match(/src=(.*?)>/g)
    .map((src) => src.slice(5, -1))
    .slice(3);

  return result;
}

//进行js文件命名对比
async function needUpdate() {
  const newScripts = await extractNewScripts();
  console.log("newScripts", newScripts);

  if (!lastSrcs) {
    lastSrcs = newScripts;
    return false;
  }
  let result = false;
  if (lastSrcs.length !== newScripts.length) {
    result = true;
  }
  for (let i = 0; i < lastSrcs.length; i++) {
    if (lastSrcs[i] !== newScripts[i]) {
      result = true;
      break;
    }
  }
  lastSrcs = newScripts;
  return result;
}
//每10秒进行一次比对
const DURATION = 1000 * 10;

function autoRefresh() {
  // 开发环境不检测
  if (process.env.NODE_ENV == "development") return;
  setTimeout(async () => {
    console.log("window.navigator.onLine", window.navigator.onLine);
    // 判断是否离线
    if (window.navigator.onLine) {
      const willUpdate = await needUpdate();

      if (willUpdate) {
        // 60000*5
        // Notification({
        //   title: "更新提示",
        //   type: "warning",
        //   message: "用户在无操作5分钟后将会自动刷新页面",
        //   duration: 3000,
        // });
        // let reloadTimeOut = setTimeout(() => {
        //   location.reload(true);
        // }, 10000);
        MessageBox.confirm(
          "新版本发布！为了确保数据准确性，请尽快刷新页面，否则可能会导致数据异常。",
          "更新提示",
          {
            confirmButtonText: "立即刷新",
            cancelButtonText: "稍后手动刷新",
            type: "warning",
            showCancelButton: false,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            closeOnHashChange: false,
          }
        )
          .then(() => {
            // clearTimeout(reloadTimeOut);
            location.reload(true);
          })
          .catch(() => {
            // clearTimeout(reloadTimeOut);
            Notification({
              title: "更新提示",
              type: "warning",
              message: "请尽快手刷新页面，以防止旧版本的网页导致数据异常！",
              duration: 0,
            });
          });
        // const result = alert('有新功能发布，请点击确定刷新页面！');
        // console.log("result", result);
        // if (!result) {
        //     location.reload(true);
        // }
      }
    }
    autoRefresh();
  }, DURATION);
}

autoRefresh();
