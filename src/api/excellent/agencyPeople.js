import request from "@/utils/requestGo";

// 查询代理列表
export function listAgencyPeople(query) {
  return request({
    url: "/excellent/agencyPeople/list",
    method: "get",
    params: query,
  });
}

// 查询代理详细
export function getAgencyPeople(id) {
  return request({
    url: "/excellent/agencyPeople/" + id,
    method: "get",
  });
}

// 新增代理
export function addAgencyPeople(data) {
  return request({
    url: "/excellent/agencyPeople",
    method: "post",
    data: data,
  });
}

// 修改代理
export function updateAgencyPeople(data) {
  return request({
    url: "/excellent/agencyPeople",
    method: "put",
    data: data,
  });
}

// 删除代理
export function delAgencyPeople(id) {
  return request({
    url: "/excellent/agencyPeople/" + id,
    method: "delete",
  });
}
