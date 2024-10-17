import { Notification, MessageBox, Message, Loading } from "element-ui";
import { tansParams, blobValidate } from "@/utils/ruoyi";
import request from "@/utils/requestGo";
import axios from "axios";
import { saveAs } from "file-saver";
let RequestNum = 60;
//查询文件是否生成
function CheckIfTheFileHasBeenGenerated(url) {
  return axios({
    url: url,
    method: "get",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 180000,
  })
    .then(async (data) => {
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
async function SaveFile(res, name) {
  await axios({
    url: res, // 替换为你的文件下载链接
    method: "GET",
    responseType: "blob", // 设置响应类型为 blob 以处理文件
  })
    .then((response) => {
      saveAs(response.data, name + ".xlsx");
    })
    .catch((error) => {
      console.error("文件下载失败:", error);
    })
    .finally(() => {
      // 隐藏加载状态
      downloadLoadingInstance.close();
    });
}
//下载文件方法
function fetchAndDownload(url, name) {
  CheckIfTheFileHasBeenGenerated(url)
    .then((res) => {
      if (res.data.status) {
        // 如果结果是对象，继续递归调用
        setTimeout(() => {
          console.log(RequestNum);

          if (RequestNum < 0) {
            return;
          }
          RequestNum -= 1;
          fetchAndDownload(url, name);
        }, 3000);
      } else {
        SaveFile(res.data.url, name);
        return;
      }
    })
    .catch((res) => {
      downloadLoadingInstance.close();
    });
}

//商户流水 订单的通用下载方法
export function DownloadXlsx(
  CommitUrl,
  query,
  name,
  downloadUrl = "/console/download/pull"
) {
  downloadLoadingInstance = Loading.service({
    text: "正在下载数据，请稍候",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.7)",
  });
  return request({
    url: CommitUrl,
    method: "get",
    params: query,
  }).then((res) => {
    let filename = name ? name : res.file_name;
    RequestNum = 0;
    // 启动请求的入口
    fetchAndDownload(downloadUrl + "?file_name=" + res.file_name, filename);

    return res;
  });
}
