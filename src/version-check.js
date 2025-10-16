import { MessageBox, Notification } from "element-ui";

let lastVersion = null; // 保存上一次版本号
const CHECK_INTERVAL = 1000 * 10; // 每 10 秒检查一次

// 获取当前版本
async function getVersion() {
  try {
    const res = await fetch(`/version.json?_=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.version;
  } catch (err) {
    console.warn("获取 version.json 失败:", err);
    return null;
  }
}

// 判断是否需要更新
async function needUpdate() {
  const version = await getVersion();
  if (!version) return false; // 获取失败不更新
  if (!lastVersion) {
    lastVersion = version;
    return false;
  }
  if (lastVersion !== version) {
    lastVersion = version;
    return true;
  }
  return false;
}

// 自动检测版本并提示
async function autoRefresh() {
  if (process.env.NODE_ENV === "development") return;

  if (!window.navigator.onLine) {
    // 离线状态，延迟下一轮检查
    setTimeout(autoRefresh, CHECK_INTERVAL);
    return;
  }

  const willUpdate = await needUpdate();

  if (willUpdate) {
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
        location.reload(true); // 强制刷新
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

  // 下一轮检查
  setTimeout(autoRefresh, CHECK_INTERVAL);
}

// 启动自动检测
autoRefresh();
