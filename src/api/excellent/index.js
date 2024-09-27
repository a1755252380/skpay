import request from "@/utils/requestGo";

// 查询首页统计数据
export function statistics() {
  return request({
    url: "/order/today/data",
    method: "get",
  });
}
