// import request from '@/utils/requestGo'
import request from "@/utils/requestGo";
import { Notification, MessageBox, Message, Loading } from "element-ui";
let cancelTokenSource = null; // 存储上一个请求的 cancelToken
// 查询订单列表
export function listOrderRecords(query) {
  // 取消上一个请求
  if (cancelTokenSource) {
    cancelTokenSource.cancel("取消上一个重复的请求");
  }
  // 创建新的 cancelToken
  cancelTokenSource = axios.CancelToken.source();
  return request({
    url: "/order",
    method: "get",
    params: query,
    cancelToken: cancelTokenSource.token, // 绑定 cancelToken
  });
}

// 修改订单状态
export function ModifyOrderStatus(query) {
  return request({
    url: "/order/operation",
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
      console.log(res);
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
