import { MessageBox, Notification } from "element-ui";

let lastVersion = localStorage.getItem("APP_LAST_VERSION"); // 从 localStorage 恢复版本
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

async function needUpdate() {
  const version = await getVersion();
  if (!version) return false;

  const savedVersion = localStorage.getItem("APP_LAST_VERSION");

  // 如果首次加载（没有记录），保存版本号
  if (!savedVersion) {
    localStorage.setItem("APP_LAST_VERSION", version);
    lastVersion = version;
    return false;
  }

  // 版本不同则需要更新
  if (savedVersion !== version) {
    localStorage.setItem("APP_LAST_VERSION", version);
    lastVersion = version;
    return true;
  }

  lastVersion = version;
  return false;
}

async function autoRefresh() {
  if (process.env.NODE_ENV === "development") return;
  if (!window.navigator.onLine) {
    setTimeout(autoRefresh, CHECK_INTERVAL);
    return;
  }

  const willUpdate = await needUpdate();

  if (willUpdate) {
    localStorage.setItem("NEED_RELOAD", Date.now());
    MessageBox.confirm(
      "新版本发布！为了确保数据准确性，请尽快刷新页面，否则可能会导致数据异常。",
      "更新提示",
      {
        confirmButtonText: "立即刷新",
        type: "warning",
        showCancelButton: false,
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        closeOnHashChange: false,
      }
    )
      .then(() => {
        window.location.reload(true); // 强制重新加载
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

  setTimeout(autoRefresh, CHECK_INTERVAL);
}

// 同步其他标签页刷新
window.addEventListener("storage", (e) => {
  if (e.key === "NEED_RELOAD") {
    window.location.reload(true);
  }
});

window.addEventListener("load", autoRefresh);
