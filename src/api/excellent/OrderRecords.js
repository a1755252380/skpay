// import request from '@/utils/requestGo'
import request from "@/utils/requestGo";
import { Notification, MessageBox, Message, Loading } from "element-ui";
// 查询订单列表
export function listOrderRecords(query) {
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
  });
}
import { tansParams, blobValidate } from "@/utils/ruoyi";
function GetDownload(url) {
  return request({
    url: url,
    method: "get",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
    .then(async (data) => {
      return data;
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
  GetDownload("/order/download/pull?file_name=" + fileName)
    .then((res) => {
      console.log(res);
      if (isObject(res)) {
        // 如果结果是对象，继续递归调用
        setTimeout(() => {
          fetchAndDownload(fileName, name);
        }, 1000);
      } else {
        // 如果结果不是对象，执行保存文件操作并退出递归
        const isBlob = blobValidate(res);
        if (isBlob) {
          const blob = new Blob([res]);
          saveAs(blob, name + ".csv");
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
    url: "/order/download/commit",
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
