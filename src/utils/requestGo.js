import axios from "axios";
import { Notification, MessageBox, Message, Loading } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";
import errorCode from "@/utils/errorCode";
import { tansParams, blobValidate } from "@/utils/ruoyi";
import cache from "@/plugins/cache";
import router from "@/router";
let downloadLoadingInstance;
// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const serviceOrder = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_ORDER_API,
  // 超时
  timeout: 60000,
});

// request拦截器
serviceOrder.interceptors.request.use(
  (config) => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    if (getToken() && !isToken) {
      config.headers["Authorization"] = "Bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (
      !isRepeatSubmit &&
      (config.method === "post" || config.method === "put")
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === "object"
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      };
      const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(
          `[${config.url}]: ` +
            "请求数据大小超出允许的5M限制，无法进行防重复提交验证。"
        );
        return config;
      }
      const sessionObj = cache.session.getJSON("sessionObj");
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ""
      ) {
        cache.session.setJSON("sessionObj", requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 10; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          s_data === requestObj.data &&
          requestObj.time - s_time < interval &&
          s_url === requestObj.url
        ) {
          const message = "数据正在处理，请勿重复提交";
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON("sessionObj", requestObj);
        }
      }
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// // 响应拦截器
serviceOrder.interceptors.response.use(
  (res) => {
    // console.log(res.data);

    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg =
      res.data.msg || errorCode[code] || res.error || errorCode["default"];
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    ) {
      return res;
    }
    console.log(code);
    console.log(isRelogin.show);

    if (code === 401 || code === 404) {
      if (
        !isRelogin.show ||
        (store.getters.roles && store.getters.roles.length === 0)
      ) {
        isRelogin.show = true;
        MessageBox.confirm(
          "登录状态已过期，您可以继续留在该页面，或者重新登录",
          "系统提示",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            isRelogin.show = false;
            if (getToken()) {
              store.dispatch("LogOut").then(() => {
                location.href = "/index";
              });
            } else {
              location.href = "/index";
            }
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
    } else if (code === 500) {
      Message({ message: msg, type: "error" });
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      Message({ message: msg, type: "warning" });
      return Promise.reject("error");
    } else if (code !== 200) {
      Notification.error({ title: msg });
      return Promise.reject("error");
    } else {
      // if (res.data.msg != "success") {
      //   Message({ message: msg, type: "warning" });
      // }

      return res.data.data;
    }
  },
  (error) => {
    let { message } = error;

    //当用户登录状态过期时需让用户重新登录
    if (message.substr(message.length - 3) == 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        MessageBox.confirm(
          "登录状态已过期，您可以继续留在该页面，或者重新登录",
          "系统提示",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            isRelogin.show = false;
            store.dispatch("LogOut").then(() => {
              location.href = "/index";
            });
          })
          .catch(() => {
            isRelogin.show = false;
          });
        return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
      }
    }
    var config = error.config;
    if (!config || !config.retry) return Promise.reject(error);

    // __retryCount用来记录当前是第几次发送请求
    config.__retryCount = config.__retryCount || 0;

    // 如果当前发送的请求大于等于设置好的请求次数时，不再发送请求，返回最终的错误信息
    if (config.__retryCount >= config.retry) {
      console.log("err" + error);

      if (message == "Network Error") {
        message = "后端接口连接异常";
      } else if (message.includes("timeout")) {
        message = "系统接口请求超时";
      } else if (message.includes("Request failed with status code")) {
        message = "系统接口" + message.substr(message.length - 3) + "异常";
      }
      Message({ message: message, type: "error", duration: 5 * 1000 });
      return Promise.reject(error);
    }

    // 记录请求次数+1
    config.__retryCount += 1;

    // 设置请求间隔 在发送下一次请求之前停留一段时间，时间为上方设置好的请求间隔时间
    var backoff = new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, config.retryDelay || 1);
    });

    // 再次发送请求
    return backoff.then(function () {
      console.error("尝试重新发送请求第" + config.__retryCount + "次");

      return service(config);
    });
  }
);

export default serviceOrder;
