import request from "@/utils/requestGo";

// 查询通道账户流水列表
export function listChnlAccFlow(query) {
  return request({
    url: "/excellent/chnlAccFlow/list",
    method: "get",
    params: query,
  });
}

// 查询通道账户流水详细
export function getChnlAccFlow(id) {
  return request({
    url: "/excellent/chnlAccFlow/" + id,
    method: "get",
  });
}

// 新增通道账户流水
export function addChnlAccFlow(data) {
  return request({
    url: "/excellent/chnlAccFlow",
    method: "post",
    data: data,
  });
}

// 修改通道账户流水
export function updateChnlAccFlow(data) {
  return request({
    url: "/excellent/chnlAccFlow",
    method: "put",
    data: data,
  });
}

// 删除通道账户流水
export function delChnlAccFlow(id) {
  return request({
    url: "/excellent/chnlAccFlow/" + id,
    method: "delete",
  });
}
