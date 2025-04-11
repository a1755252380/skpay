import { MessageBox, Notification } from "element-ui";

// 用于保存上一次检测到的 script 链接数组
let lastSrcs;

// 获取最新页面中的 script 链接（避免缓存）
async function extractNewScripts() {
  // 使用时间戳避免缓存
  const html = await fetch("/?_timestamp=" + Date.now()).then((resp) =>
    resp.text()
  );
  // 使用正则表达式提取 script 的 src 属性（根据实际情况调整正则和 slice 的索引）
  let result = html.match(/src=(.*?)>/g);
  if (result && result.length > 3) {
    result = result.map((src) => src.slice(5, -1)).slice(3);
  } else {
    result = [];
  }
  return result;
}

// 对比 script 链接，判断是否需要更新
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

// 检查指定资源是否就绪（使用 HEAD 请求加快响应）
async function isResourceReady(url) {
  try {
    const response = await fetch(url + "?_timestamp=" + Date.now(), {
      method: "HEAD",
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

// 重试检测资源是否就绪，最多重试 maxRetries 次，每次间隔 delay 毫秒
async function waitForResource(url, maxRetries = 5, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    if (await isResourceReady(url)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return false;
}

// 每隔 10 秒检测一次更新
const DURATION = 1000 * 10;

function autoRefresh() {
  // 开发环境下不检测
  if (process.env.NODE_ENV === "development") return;

  setTimeout(async () => {
    console.log("window.navigator.onLine", window.navigator.onLine);
    // 判断是否在线
    if (window.navigator.onLine) {
      const willUpdate = await needUpdate();

      if (willUpdate) {
        // 这里定义一个关键资源 URL，请根据你的项目实际情况修改，
        // 例如可以使用 newScripts 数组的第一个链接，也可以是一个专门的 version.json 文件。
        const criticalResourceUrl = "version.json"; // ← 请根据实际情况调整

        // 等待该关键资源就绪
        const resourceReady = await waitForResource(
          criticalResourceUrl,
          10,
          20000
        );

        if (!resourceReady) {
          // 如果资源还未就绪，给用户提示
          Notification({
            title: "更新提示",
            type: "warning",
            message: "检测到新版本，但部分资源尚未准备好，请稍后刷新页面。",
            duration: 8000,
          });
        } else {
          // 资源就绪后弹出提示对话框
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
              location.reload(true);
            })
            .catch(() => {
              Notification({
                title: "更新提示",
                type: "warning",
                message: "请尽快手动刷新页面，以防止旧版本网页导致数据异常！",
                duration: 0,
              });
            });
        }
      }
    }
    autoRefresh();
  }, DURATION);
}

autoRefresh();
