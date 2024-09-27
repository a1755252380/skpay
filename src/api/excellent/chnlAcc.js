import request from "@/utils/requestGo";

// 查询通道账户总金额列表
export function listChnlAcc(query) {
  return request({
    url: "/excellent/chnlAcc/list",
    method: "get",
    params: query,
  });
}

// 查询通道账户总金额详细
export function getChnlAcc(id) {
  return request({
    url: "/excellent/chnlAcc/" + id,
    method: "get",
  });
}

// 新增通道账户总金额
export function addChnlAcc(data) {
  return request({
    url: "/excellent/chnlAcc",
    method: "post",
    data: data,
  });
}

// 修改通道账户总金额
export function updateChnlAcc(data) {
  return request({
    url: "/excellent/chnlAcc",
    method: "put",
    data: data,
  });
}

// 删除通道账户总金额
export function delChnlAcc(id) {
  return request({
    url: "/excellent/chnlAcc/" + id,
    method: "delete",
  });
}
