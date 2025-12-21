import { MessageBox, Notification } from "element-ui";

const CHECK_INTERVAL = 1000 * 60 * 3; // 3 分钟
const VERSION_KEY = "APP_LAST_VERSION";
const NOTIFIED_KEY = "APP_UPDATE_NOTIFIED";
const RELOAD_KEY = "APP_NEED_RELOAD";

let timer = null;
let isChecking = false;

/** 获取远程版本号 */
function getVersion() {
  return fetch(`/version.json?_=${Date.now()}`, {
    cache: "no-store",
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then((data) => data.version)
    .catch((err) => {
      console.warn("获取 version.json 失败:", err);
      return null;
    });
}

/** 判断是否需要更新 */
async function needUpdate() {
  if (isChecking) return false;
  isChecking = true;

  const remoteVersion = await getVersion();
  isChecking = false;

  if (!remoteVersion) return false;

  const localVersion = localStorage.getItem(VERSION_KEY);

  // 首次进入
  if (!localVersion) {
    localStorage.setItem(VERSION_KEY, remoteVersion);
    return false;
  }

  // 版本变化
  if (localVersion !== remoteVersion) {
    localStorage.setItem(VERSION_KEY, remoteVersion);
    return true;
  }

  return false;
}

/** 提示更新（只弹一次） */
function notifyUpdate() {
  if (localStorage.getItem(NOTIFIED_KEY)) return;

  localStorage.setItem(NOTIFIED_KEY, "1");
  localStorage.setItem(RELOAD_KEY, Date.now());

  MessageBox.confirm(
    "检测到系统已发布新版本，为避免数据异常，请立即刷新页面。",
    "系统更新提示",
    {
      confirmButtonText: "立即刷新",
      showCancelButton: false,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      type: "warning",
    }
  ).then(() => {
    window.location.reload(true);
  });

  Notification({
    title: "更新提示",
    type: "warning",
    message: "系统已更新，请尽快刷新页面",
    duration: 0,
  });
}

/** 启动检测 */
function startUpdateCheck() {
  if (process.env.NODE_ENV === "development") return;

  if (timer) clearInterval(timer);

  timer = setInterval(async () => {
    if (document.visibilityState !== "visible") return;
    if (!navigator.onLine) return;

    const update = await needUpdate();
    if (update) notifyUpdate();
  }, CHECK_INTERVAL);
}

/** Tab 切回时立即检测 */
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible") {
    const update = await needUpdate();
    if (update) notifyUpdate();
  }
});

/** 多 Tab 同步刷新 */
window.addEventListener("storage", (e) => {
  if (e.key === RELOAD_KEY) {
    window.location.reload(true);
  }
});

/** 入口 */
window.addEventListener("load", startUpdateCheck);

export default startUpdateCheck;
