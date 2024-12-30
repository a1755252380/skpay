import request from "@/utils/requestGo";

// 查询用户信息列表
export function listUser(query) {
  return request({
    url: "/user/show/blacklist",
    method: "get",
    params: query,
  });
}

// 拉入黑名单
export function addBlacklistUser(data) {
  return request({
    url: "/user/add/blacklist",
    method: "post",
    data: {
      data,
    },
  });
}
// 移除黑名单
export function RemoveBlacklist(id) {
  return request({
    url: "/user/delete/blacklist",
    method: "get",
    params: {
      id: id,
    },
  });
}

// 批量添加黑名单
export function BatchAddBlacklist(list) {
  return request({
    url: "/user/add/order/blacklist",
    method: "post",
    data: {
      list: list,
    },
  });
}
