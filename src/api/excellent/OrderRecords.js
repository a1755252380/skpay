// import request from '@/utils/requestGo'
import request from "@/utils/requestGo";
import { Notification, MessageBox, Message, Loading } from "element-ui";
export let cancelTokenSource = null; // 存储上一个请求的 cancelToken
// 查询订单列表
export function listOrderRecords(query) {
  // 取消上一个请求
  if (cancelTokenSource) {
    cancelTokenSource.cancel("取消上一个重复的请求");
  }
  // 创建新的 cancelToken
  cancelTokenSource = axios.CancelToken.source();
  if (query["order_id"] && !isNaN(Number(query["order_id"]))) {
    query["order_id"] = Number(query["order_id"]);
  } else {
    delete query["order_id"];
  }
  if (query["mch_number_list"] && query.mch_number_list.length <= 0) {
    delete query["mch_number_list"];
  }
  if (query["last_id"]) {
    query["last_id"] = String(query["last_id"]);
  }
  for (const key in query) {
    if (query[key] === null || query[key] === undefined || query[key] === "") {
      delete query[key];
    }
  }

  return request({
    url: "/order",
    method: "post",
    data: query,
    cancelToken: cancelTokenSource.token, // 绑定 cancelToken
  });
}
// 批量查询订单列表
export function BatchListOrderRecords(query) {
  return request({
    url: "/order",
    method: "get",
    params: query,
  });
}
// 修改订单状态
export function ModifyOrderStatus(query) {
  return request({
    url: "/order/operation",
    method: "post",
    data: query,
    timeout: 180000, // 单独设置超时时间（单位：毫秒）
  });
}
//添加新代收订单
export function AddPayOutOrder(query) {
  let submit;
  if (!Array.isArray(query)) {
    for (const key in query) {
      if (
        query[key] === null ||
        query[key] === undefined ||
        query[key] === ""
      ) {
        delete query[key];
      }
    }
    submit = [query];
  } else {
    submit = query;
  }

  return request({
    url: "/order/create/payout",
    method: "post",
    data: submit,
  });
}
export function AddPayInOrder(query) {
  for (const key in query) {
    if (query[key] === null || query[key] === undefined || query[key] === "") {
      delete query[key];
    }
  }
  return request({
    url: "/order/create/payin",
    method: "post",
    data: query,
  });
}
import { tansParams, blobValidate } from "@/utils/ruoyi";
import axios from "axios";

function GetDownload(url) {
  return axios({
    url: url,
    method: "get",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
    .then(async (data) => {
      console.log(data);

      return data.data;
    })
    .catch((r) => {
      console.error(r);
      Message.error("下载文件出现错误，请联系管理员！");
      // downloadLoadingInstance.close();
    });
}
let downloadLoadingInstance;
//判断是否是对象
function isObject(val) {
  return val !== null && typeof val === "object";
}
//下载文件方法
function fetchAndDownload(fileName, name) {
  GetDownload("/console/download/pull?file_name=" + fileName)
    .then((res) => {
      if (res.state) {
        // 如果结果是对象，继续递归调用
        setTimeout(() => {
          fetchAndDownload(fileName, name);
        }, 1000);
      } else {
        // 如果结果不是对象，执行保存文件操作并退出递归
        const isBlob = blobValidate(res);

        if (isBlob) {
          const blob = new Blob([res]);
          saveAs(blob, name + ".xlsx");
        }
        downloadLoadingInstance.close();
        return;
      }
    })
    .catch((res) => {
      downloadLoadingInstance.close();
    });
}

//提交下载订单
export function SubmitDownloadOrder(query) {
  return request({
    url: "/stream/download/commit",
    method: "get",
    params: query,
  }).then((res) => {
    downloadLoadingInstance = Loading.service({
      text: "正在下载数据，请稍候",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)",
    });
    let name = res.file_name;
    // 启动请求的入口
    fetchAndDownload(res.file_name, name);

    return res;
  });
}
