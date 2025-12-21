// 计算圆的属性
const radius = 100;
const circumference = 2 * Math.PI * radius;
const retryLimit = 3;
let sum = 0;
let num = 0;
const progressHtml = `
      <div class="PollingRequest_model_content">
        <div class="PollingRequest_model_content_title">
          正在处理中...
        </div>

        <div class="PollingRequest_model_content_circle">
          <div class="progress-container">
            <svg class="progress-ring" width="250" height="250">
              <circle class="progress-ring-circle progress-ring-bg" cx="125" cy="125" r="${radius}" />
              <circle class="progress-ring-circle progress-ring-fill" cx="125" cy="125" r="${radius}" id="progress-circle" />
            </svg>
            <div class="progress-text" id="progress-text">0%</div>
          </div>
        </div>
        <div class="PollingRequest_model_content_footer">
              <span id="progress-num">0</span>/<span id="progress-sum">0</span>
        </div>
      </div>
    `;

function initProgress() {
  const progressModel = document.createElement("div");
  progressModel.className = "PollingRequest_model";
  progressModel.id = "PollingRequest_model";
  progressModel.innerHTML = progressHtml;
  document.body.append(progressModel);
  // 强制浏览器渲染，触发 transition
  requestAnimationFrame(() => {
    progressModel.classList.add("show");
  });
  num = 0;
  // 获取元素
  const progressCircle = document.getElementById("progress-circle");
  const progressNum = document.getElementById("progress-num");
  const progressSum = document.getElementById("progress-sum");
  // 初始化进度条
  progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  progressCircle.style.strokeDashoffset = circumference;
  progressNum.innerText = num;
  progressSum.innerText = sum;
}
// 更新进度函数
function updateProgress() {
  const progressCircle = document.getElementById("progress-circle");
  const progressText = document.getElementById("progress-text");
  const progressNum = document.getElementById("progress-num");
  const progressSum = document.getElementById("progress-sum");
  const percent =
    parseInt((num / sum) * 100) >= 100 ? 100 : parseInt((num / sum) * 100);

  // 计算偏移量
  const offset = circumference - (percent / 100) * circumference;

  // 更新进度环
  progressCircle.style.strokeDashoffset = offset;

  // 更新文本
  progressText.textContent = `${percent}%`;
  progressNum.innerText = num;
  progressSum.innerText = sum;
  // 根据进度改变颜色
  if (percent >= 80) {
    progressCircle.style.stroke = "#2ecc71"; // 绿色
  } else if (percent >= 50) {
    progressCircle.style.stroke = "#f39c12"; // 橙色
  } else {
    progressCircle.style.stroke = "#e74c3c"; // 红色
  }
}
//隐藏进度条
function hideProgress() {
  const progressModel = document.getElementById("PollingRequest_model");

  progressModel.classList.remove("show"); // 触发渐隐动画
  progressModel.addEventListener(
    "transitionend",
    () => {
      if (progressModel.parentNode)
        progressModel.parentNode.removeChild(progressModel);
    },
    { once: true }
  );
}
// 模拟请求函数
export function mockRequest(data, successRate = 1, delay = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ok = Math.random() < successRate; // 随机成功 / 失败

      if (ok) {
        resolve({
          success: true,
          time: Date.now(),
          data,
        });
      } else {
        reject({
          success: false,
          time: Date.now(),
          error: "Mock request failed",
          data,
        });
      }
    }, delay);
  });
}
export function PollingRequest(
  method,
  params,
  callback = () => {},
  interval = 300
) {
  if (typeof method !== "function") {
    throw new Error("PollingRequest method must be a function");
  }
  if (!Array.isArray(params) || params.length === 0) {
    throw new Error("PollingRequest params must be a array");
  }
  sum = params.length;
  initProgress();
  // 单个请求+重试机制
  // 单个请求 + 重试机制（成功只执行一次）
  const requestWithRetry = (args, retries = retryLimit) => {
    return new Promise((resolve, reject) => {
      const attempt = (left) => {
        method(args)
          .then((res) => {
            resolve(res); // 只 resolve 一次，不会冒泡
          })
          .catch((err) => {
            if (left > 0) {
              attempt(left - 1); // 重试但不 return Promise 链
            } else {
              reject(err); // 最终失败
            }
          });
      };

      attempt(retries);
    });
  };

  // 调度（间隔执行）
  const tasks = params.map((element, index) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(element);
      }, interval * index);
    })
      .then(async (p) => {
        const res = await requestWithRetry(p);
        console.log(res);

        num++; // ← 成功只会到这里一次

        updateProgress();
        return res;
      })
      .catch((err) => {
        console.error("PollingRequest Error:", err);
        throw err;
      });
  });

  return Promise.all(tasks)
    .then((res) => {
      callback(res);
      return res;
    })
    .catch((err) => {
      console.error("PollingRequest Error:", err);
      throw err;
    })
    .finally(() => {
      setTimeout(() => {
        hideProgress();
      }, 300);
    });
}
// 多轮询请求函数
export function MultiPollingRequest(
  requestList,
  callback = () => {},
  interval = 300,
  retryLimit = 3
) {
  if (!Array.isArray(requestList) || requestList.length === 0) {
    throw new Error(
      "MultiPollingRequest requestList must be a non-empty array"
    );
  }

  // 校验每个对象
  requestList.forEach((item, idx) => {
    if (typeof item.method !== "function") {
      throw new Error(`requestList[${idx}].method must be a function`);
    }
    if (!Array.isArray(item.params) || item.params.length === 0) {
      throw new Error(`requestList[${idx}].params must be a non-empty array`);
    }
  });

  // 总请求数
  const totalRequests = requestList.reduce(
    (sum, item) => sum + item.params.length,
    0
  );
  sum = totalRequests;
  num = 0;
  initProgress();

  // 单个请求 + 重试机制
  const requestWithRetry = (method, args, retries = retryLimit) => {
    return new Promise((resolve, reject) => {
      const attempt = (left) => {
        method(args)
          .then(resolve)
          .catch((err) => {
            if (left > 0) {
              attempt(left - 1);
            } else {
              reject(err);
            }
          });
      };
      attempt(retries);
    });
  };

  // 展平所有请求，并附带 methodName 用于分组
  const allTasks = [];
  requestList.forEach((item) => {
    const methodName = item.name || "anonymousMethod";
    item.params.forEach((param) => {
      allTasks.push({ method: item.method, methodName, param });
    });
  });

  // 按索引间隔调度请求
  const tasks = allTasks.map((task, index) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(task), interval * index);
    })
      .then(async ({ method, param, methodName }) => {
        const res = await requestWithRetry(method, param);
        num++;
        updateProgress();
        return { methodName, res };
      })
      .catch((err) => {
        console.error("MultiPollingRequest Error:", err);
        throw err;
      });
  });

  return Promise.all(tasks)
    .then((results) => {
      // 按方法名分组
      const groupedResults = {};
      results.forEach(({ methodName, res }) => {
        if (!groupedResults[methodName]) groupedResults[methodName] = [];
        groupedResults[methodName].push(res);
      });
      callback(groupedResults);
      return groupedResults;
    })
    .catch((err) => {
      console.error("MultiPollingRequest Error:", err);
      throw err;
    })
    .finally(() => {
      setTimeout(() => {
        hideProgress();
      }, 300);
    });
}

//环形进度条
const progressHtml2 = `
      <div class="PollingRequest_model_content">
        <div class="PollingRequest_model_content_title" id="ProgressRequest_model_content_title">
         正在处理中...
        </div>
        <div class="PollingRequest_model_content_circle">
          <div class="progress-container">
            <svg class="progress-ring" width="250" height="250">
              <circle class="progress-ring-circle progress-ring-bg" cx="125" cy="125" r="${radius}" />
              <circle class="progress-ring-circle progress-ring-fill" cx="125" cy="125" r="${radius}" id="progress-circle" />
            </svg>
            <div class="progress-text" id="progressNum">0%</div>
          </div>
        </div>
      </div>
    `;
export function setProgressHtml2Title(title) {
  document.getElementById("ProgressRequest_model_content_title").innerText =
    title;
}

export function initProgressRequest() {
  const progressModel = document.createElement("div");
  progressModel.className = "PollingRequest_model";
  progressModel.id = "ProgressRequest_model";
  progressModel.innerHTML = progressHtml2;
  document.body.append(progressModel);
  // 强制浏览器渲染，触发 transition
  requestAnimationFrame(() => {
    progressModel.classList.add("show");
  });
  // 获取元素
  const progressCircle = document.getElementById("progress-circle");
  // 初始化进度条
  progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  progressCircle.style.strokeDashoffset = circumference;
}
// 更新进度函数
export function updateProgressRequest(percent) {
  const progressCircle = document.getElementById("progress-circle");
  const progressText = document.getElementById("progressNum");
  // 计算偏移量
  const offset = circumference - (percent / 100) * circumference;

  // 更新进度环
  progressCircle.style.strokeDashoffset = offset;

  // 更新文本
  progressText.textContent = `${percent}%`;
  // 根据进度改变颜色
  if (percent >= 80) {
    progressCircle.style.stroke = "#2ecc71"; // 绿色
  } else if (percent >= 50) {
    progressCircle.style.stroke = "#f39c12"; // 橙色
  } else {
    progressCircle.style.stroke = "#e74c3c"; // 红色
  }
}
//隐藏进度条
export function hideProgressRequest() {
  const progressModel = document.getElementById("ProgressRequest_model");

  progressModel.classList.remove("show"); // 触发渐隐动画
  progressModel.addEventListener(
    "transitionend",
    () => {
      if (progressModel.parentNode)
        progressModel.parentNode.removeChild(progressModel);
    },
    { once: true }
  );
}

//直线进度条
const LinearProgressBarHtml = `
<div class="LinearProgressBar_div">
<div class="glass-progress">
    <div class="glass-bar" style="width: 0;" id="LinearProgressBar"></div>
  </div>
    <span class="progress-text" id="LinearProgressBar_text">0%</span>
</div>


    `;
export function setLinearProgressBarText(text) {
  const progressText = document.getElementById("LinearProgressBar_text");
  progressText.innerText = text;
}
export function initLinearProgressBar() {
  const progressModel = document.createElement("div");
  progressModel.className = "LinearProgressBar_model";
  progressModel.id = "LinearProgressBar_model";
  progressModel.innerHTML = LinearProgressBarHtml;
  document.body.append(progressModel);
  // 强制浏览器渲染，触发 transition
  requestAnimationFrame(() => {
    progressModel.classList.add("show");
  });
  // 获取元素
  const progressCircle = document.getElementById("LinearProgressBar");
  progressCircle.style.width = "0%";
}
// 更新进度函数
export function updateLinearProgressBar(percent) {
  const progressCircle = document.getElementById("LinearProgressBar");
  progressCircle.style.width = `${percent}%`;
}
//隐藏进度条
export function hideLinearProgressBar() {
  const progressModel = document.getElementById("LinearProgressBar_model");

  progressModel.classList.remove("show"); // 触发渐隐动画
  progressModel.addEventListener(
    "transitionend",
    () => {
      if (progressModel.parentNode)
        progressModel.parentNode.removeChild(progressModel);
    },
    { once: true }
  );
}
