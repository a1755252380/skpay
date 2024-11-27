import request from "@/utils/requestGo";

// 查询通知公告列表
export function listOrderSuccessRate(query) {
  return request({
    url: "/order/today/rate",
    method: "post",
    data: query,
  });
}

export function listChnlSuccessRate(query) {
  return request({
    url: "/chnl/today/rate",
    method: "post",
    data: query,
  });
}
