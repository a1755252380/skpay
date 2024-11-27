import request from "@/utils/requestGo";

// 查询商户结算列表
export function listMchSettlement(query) {
  return request({
    url: "/settlement",
    method: "get",
    params: query,
  });
}
export function listMchSettlementList(query) {
  return request({
    url: "/settlement/count",
    method: "get",
    params: query,
  });
}
// 查询商户结算详细
export function getMchSettlement(id) {
  return;
}

// 新增商户结算
export function addMchSettlement(data) {
  return;
}

// 修改商户结算
export function updateMchSettlement(data) {
  return;
}

// 删除商户结算
export function delMchSettlement(id) {
  return;
}
// 查询商户当日结算详细
export function getMchSettlementDay(query) {
  return;
}
