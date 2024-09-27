import request from "@/utils/requestGo";

// 查询代理账户流水列表
export function listAgencyFlow(query) {
  return request({
    url: "/excellent/agencyFlow/list",
    method: "get",
    params: query,
  });
}

// 查询代理账户流水详细
export function getAgencyFlow(id) {
  return request({
    url: "/excellent/agencyFlow/" + id,
    method: "get",
  });
}

// 新增代理账户流水
export function addAgencyFlow(data) {
  return request({
    url: "/excellent/agencyFlow",
    method: "post",
    data: data,
  });
}

// 修改代理账户流水
export function updateAgencyFlow(data) {
  return request({
    url: "/excellent/agencyFlow",
    method: "put",
    data: data,
  });
}

// 删除代理账户流水
export function delAgencyFlow(id) {
  return request({
    url: "/excellent/agencyFlow/" + id,
    method: "delete",
  });
}
