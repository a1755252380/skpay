import request from "@/utils/requestGo";

// 查询通道账户配置列表
export function listChnlAccConfig(query) {
  return request({
    url: "/excellent/chnlAccConfig/list",
    method: "get",
    params: query,
  });
}

// 查询通道账户配置详细
export function getChnlAccConfig(id) {
  return request({
    url: "/excellent/chnlAccConfig/" + id,
    method: "get",
  });
}

// 新增通道账户配置
export function addChnlAccConfig(data) {
  return request({
    url: "/excellent/chnlAccConfig",
    method: "post",
    data: data,
  });
}

// 修改通道账户配置
export function updateChnlAccConfig(data) {
  return request({
    url: "/excellent/chnlAccConfig",
    method: "put",
    data: data,
  });
}

// 删除通道账户配置
export function delChnlAccConfig(id) {
  return request({
    url: "/excellent/chnlAccConfig/" + id,
    method: "delete",
  });
}
