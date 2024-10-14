import { Notification, MessageBox, Message, Loading } from "element-ui";
import { tansParams, blobValidate } from "@/utils/ruoyi";
import request from "@/utils/requestGo";
import axios from "axios";
import { saveAs } from "file-saver";
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
  axios({
    url: res, // 替换为你的文件下载链接
    method: "GET",
    responseType: "blob", // 设置响应类型为 blob 以处理文件
  })
    .then((response) => {
      saveAs(response.data, name + ".xlsx");
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", name + ".xlsx"); // 设置下载的文件名
      // document.body.appendChild(link);
      // link.click();
      // link.remove(); // 触发下载并移除链接
      // window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("文件下载失败:", error);
    });
}
//下载文件方法
function fetchAndDownload(url, name) {
  CheckIfTheFileHasBeenGenerated(url)
    .then((res) => {
      if (res.data.status) {
        // 如果结果是对象，继续递归调用
        setTimeout(() => {
          fetchAndDownload(url, name);
        }, 1000);
      } else {
        SaveFile(res.data.url, name).then((res) => {
          setTimeout(() => {
            downloadLoadingInstance.close();
          }, 1000);
        });
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
    let name = res.file_name;
    // 启动请求的入口
    fetchAndDownload(downloadUrl + "?file_name=" + name, name);

    return res;
  });
}
