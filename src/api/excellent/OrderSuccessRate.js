import request from "@/utils/requestGo";

// 查询通知公告列表
export function listOrderSuccessRate(query) {
  return request({
    url: "/order/today/rate",
    method: "post",
    data: query,
  });
}
