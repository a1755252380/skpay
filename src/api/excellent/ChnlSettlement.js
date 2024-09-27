import request from "@/utils/requestGo";

// 查询通道结算列表
export function listChnlSettlement(query) {
  return request({
    url: "/excellent/ChnlSettlement/list",
    method: "get",
    params: query,
  });
}

// 查询通道结算详细
export function getChnlSettlement(id) {
  return request({
    url: "/excellent/ChnlSettlement/" + id,
    method: "get",
  });
}

// 新增通道结算
export function addChnlSettlement(data) {
  return request({
    url: "/excellent/ChnlSettlement",
    method: "post",
    data: data,
  });
}

// 修改通道结算
export function updateChnlSettlement(data) {
  return request({
    url: "/excellent/ChnlSettlement",
    method: "put",
    data: data,
  });
}

// 删除通道结算
export function delChnlSettlement(id) {
  return request({
    url: "/excellent/ChnlSettlement/" + id,
    method: "delete",
  });
}
// 查询通道当日结算列表
export function listChnlSettlementDay(query) {
  return request({
    url: "/excellent/chnlSettlementDay/list",
    method: "get",
    params: query,
  });
}
