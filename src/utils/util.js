import { Message, Notification } from "element-ui";
//节流函数
export function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this,
      args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
//冻结对象函数以节省内存
export function deepFreeze(obj) {
  // 首先冻结对象本身
  Object.freeze(obj);

  // 获取所有属性的名称
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj.hasOwnProperty(prop) && // 确保对象拥有该属性
      obj[prop] !== null && // 过滤掉 null
      (typeof obj[prop] === "object" || typeof obj[prop] === "function") && // 仅冻结对象和函数
      !Object.isFrozen(obj[prop]) // 避免重复冻结
    ) {
      deepFreeze(obj[prop]); // 递归冻结
    }
  });

  return obj;
}

//获取可视高度
let tryGetRefNum = 0;
export function getClientHeight(...refs) {
  // 确保 mainRef 是 Vue 的 ref 对象
  const mainElement = document.getElementById("app-main");
  const mainHeight = mainElement ? mainElement.offsetHeight : 0;

  // 计算其他元素的总高度
  const totalElementHeight = refs.reduce((total, ref) => {
    let element = ref;
    if (typeof element === "number") {
      return total + element;
    }
    if (ref.hasOwnProperty("$el")) {
      element = ref.$el;
    } else {
      element = ref;
    }
    let margin = window.getComputedStyle(element);

    if (element) {
      console.log(element);
      console.log(
        element.offsetHeight +
          (margin.marginTop ? parseFloat(margin.marginTop) : 0) +
          (margin.marginRight ? parseFloat(margin.marginRight) : 0) +
          (margin.marginBottom ? parseFloat(margin.marginBottom) : 0) +
          (margin.marginLeft ? parseFloat(margin.marginLeft) : 0)
      );

      return (
        total +
        element.offsetHeight +
        (margin.marginTop ? parseFloat(margin.marginTop) : 0) +
        (margin.marginRight ? parseFloat(margin.marginRight) : 0) +
        (margin.marginBottom ? parseFloat(margin.marginBottom) : 0) +
        (margin.marginLeft ? parseFloat(margin.marginLeft) : 0)
      );
    }

    return total ? total : 0;
  }, 0);

  // 计算并返回剩余的高度
  const remainingHeight = mainHeight - totalElementHeight - 40;
  console.log(remainingHeight);

  return remainingHeight;
}

//复制到剪切板
//复制到剪切板
export const copyToClipboard = (event, key = "") => {
  if (!event) {
    return;
  }
  // 使用 Clipboard API 将文本写入剪贴板
  event = event.toString();
  if (
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    navigator.clipboard
      .writeText(event)
      .then(() => {
        if (key) {
          Message.success(key + "已成功复制到剪贴板！");
        } else {
          Notification({
            title: "成功复制到剪贴板",
            customClass: "NotificationMessage",
            message: event,
            // "<div style='width:200px;'><strong >" + event + "</strong></div>",
            duration: 1000,
            dangerouslyUseHTMLString: true,
            type: "success",
          });
        }
      })
      .catch((err) => {
        console.error("复制失败：", err);
      });
  } else {
    // 如果 Clipboard API 不支持，使用其他方式，如 document.execCommand
    const textarea = document.createElement("textarea");
    textarea.value = event;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      if (key) {
        Message.success(key + "已成功复制到剪贴板！");
      } else {
        Notification({
          title: "成功复制到剪贴板",
          customClass: "NotificationMessage",
          message: event,
          // "<div style='width:200px;'><strong >" + event + "</strong></div>",
          duration: 1000,
          dangerouslyUseHTMLString: true,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textarea);
  }
};
import moment from "moment-timezone";
//格式化成印度时间
export const FormatUtc = (event) => {
  if (!event) {
    return;
  }
  // console.log("------------------------");

  // console.log(moment(event).format());
  // console.log(moment(event).tz("Asia/Kolkata").format());

  return moment(event).utc().valueOf();
};
export const FormatUtcTime = (event) => {
  if (!event) {
    return;
  }

  return moment(event).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};
export const getUtcTime = (inputTime) => {
  // 传入时间可以是一个毫秒值或者可解析的时间字符串
  inputTime = inputTime.split(" ");
  let da = inputTime[0] + "T" + inputTime[1] + "+05:30";

  let date = new Date(da);

  // 获取 UTC 时间的毫秒值
  const utcTimeInMillis = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );

  return utcTimeInMillis;
};
/**
 *
 * @param {对比的源数据} obj1
 * @param {需要保留的字段} keysToKeep
 * @param {修改过的数据} obj2
 * @returns
 */
export function DiffItems(obj1, keysToKeep, obj2) {
  const result = {};

  // 如果没有对比对象，则只返回保留的键值对，去除 undefined 和 null
  if (!obj2) {
    keysToKeep.forEach((key) => {
      if (key in obj1 && obj1[key] !== undefined && obj1[key] !== null) {
        result[key] = obj1[key];
      }
    });
  } else {
    // 对比 obj1 和 obj2，返回新的值，去除 undefined 和 null
    for (const key in obj1) {
      if (obj2[key] !== obj1[key]) {
        // 保留 keysToKeep 中的键
        if (
          keysToKeep.includes(key) &&
          obj1[key] !== undefined &&
          obj1[key] !== null
        ) {
          result[key] = obj1[key]; // 保留 obj1 的值
        } else if (obj2[key] !== undefined && obj2[key] !== null) {
          result[key] = obj2[key]; // 使用 obj2 的新值
        }
      }
    }

    // 处理 obj2 中有但 obj1 中没有的键，保留有效值且不在 keysToKeep 中
    for (const key in obj2) {
      if (
        !(key in obj1) &&
        !keysToKeep.includes(key) &&
        obj2[key] !== undefined &&
        obj2[key] !== null
      ) {
        result[key] = obj2[key];
      }
    }

    // 确保 keysToKeep 中的键始终保留，即使它们在 obj2 中没有变化
    keysToKeep.forEach((key) => {
      if (key in obj1 && obj1[key] !== undefined && obj1[key] !== null) {
        result[key] = obj1[key];
      }
    });
  }

  return result;
}
//隐藏中间部分
export const hideMiddle = (context) => {
  if (!context) {
    return "";
  }
  context = String(context);
  let length = context.length;
  if (length <= 5) {
    return context;
  }

  let show =
    context.substring(0, 2) +
    "*".repeat(context.length - 4) +
    context.substring(length - 2);

  // if (length >= 12) {
  //   show =
  //     context.substring(0, 4) +
  //     "*".repeat(context.length - 4) +
  //     context.substring(length - 4);
  // } else {
  //   show =
  //     context.substring(0, 2) +
  //     "*".repeat(context.length - 4) +
  //     context.substring(length - 2);
  // }

  return show;
};
//开始全屏动画
export const startAnimation = () => {
  const div = document.getElementById("loader-wrapper");

  if (div === null) {
    return;
  }
  // 显示并执行动画
  div.classList.remove("remove");
  div.classList.add("show");

  setTimeout(() => {
    div.classList.add("fade-out-hidden"); // 触发渐隐效果
    setTimeout(() => {
      // 延迟执行完全隐藏和删除操作
      div.classList.remove("show", "fade-out-hidden");
      div.classList.add("remove"); // 完全删除或隐藏
    }, 1000);
  }, 1000); // 与 CSS transition 时间一致
};
//批量发送请求的方法
// 延时函数
function delay(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(true), ms));
}
import Vue from "vue";
import ProgressDialog from "@/components/dialog/ProgressDialog2.vue"; // 引入你需要创建的组件

// 创建一个 Vue 实例，并手动挂载
function createComponent() {
  // 动态创建组件实例
  const MyComponentConstructor = Vue.extend(ProgressDialog);

  // 创建该组件的实例
  const instance = new MyComponentConstructor().$mount();

  // 将实例的 DOM 元素插入到页面中
  document.body.appendChild(instance.$el);

  // 返回组件实例（你可以用于销毁组件）
  return instance;
}
function destroyComponent(componentInstance) {
  if (componentInstance) {
    componentInstance.$destroy();
    componentInstance.$el.remove(); // 从 DOM 中移除组件
  }
}

export async function batchRequest(submitList, requestFn, delayTime = 100) {
  if (!Array.isArray(submitList) || typeof requestFn !== "function") {
    throw new Error(
      "Invalid arguments: submitList should be an array and requestFn should be a function"
    );
  }

  // 创建请求任务数组，每个任务在启动前按索引延时
  const tasks = submitList.map((item, index) =>
    (async () => {
      try {
        // 按索引延时
        if (delayTime > 0) {
          await delay(index * delayTime);
        }

        // 调用请求函数
        const response = await requestFn(item);
        return { success: true, item, response };
      } catch (error) {
        return { success: false, item, error };
      }
    })()
  );

  // 并发执行所有请求任务
  const results = await Promise.all(tasks);

  // 分类整理成功和失败的结果
  const successList = results.filter((result) => result.success);
  const errorList = results.filter((result) => !result.success);

  // 返回成功和失败的结果
  return { successList, errorList };
}
//自动显示进度条的批量请求
export async function ProgressRequest(submitList, requestFn, delayTime = 100) {
  if (!Array.isArray(submitList) || typeof requestFn !== "function") {
    throw new Error(
      "Invalid arguments: submitList should be an array and requestFn should be a function"
    );
  }
  console.log(submitList);

  // 动态创建组件实例
  const MyComponentConstructor = Vue.extend(ProgressDialog);

  // 创建该组件的实例
  const instance = new MyComponentConstructor().$mount();

  // 将实例的 DOM 元素插入到页面中
  document.body.appendChild(instance.$el);
  console.log(instance);

  const Result = instance.batchRequest(submitList, requestFn, delayTime);
  setTimeout(() => {
    instance.$destroy();
  }, 2000);
  return Result;
}
//base32编码
export const Base32Encode = (input) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 字母表

  const inputBuffer = new TextEncoder().encode(input);
  let output = "";
  let bits = 0;
  let value = 0;
  let index = 0;

  for (const byte of inputBuffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      index = (value >> (bits - 5)) & 31;
      output += alphabet[index];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  while (output.length < 32) {
    output = output.padEnd(32, "A");
  }
  return output;
};
