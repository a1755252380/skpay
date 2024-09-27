import request from "@/utils/requestGo";

// 查询商户列表
export function listMchSetting(query) {
  if (!query) {
    query = {
      page: null,
      limit: null,
      mch_num: null,
      mch_name: null,
    };
  }
  return request({
    url: "/mch/setting/msg",
    method: "get",
    params: query,
  });
}

// 查询商户详细
export function getMchSetting(id) {
  let query = {
    page: null,
    limit: null,
    mch_num: id,
    mch_name: null,
  };
  return request({
    url: "/mch/setting/msg",
    method: "get",
    params: query,
  });
}

// 新增商户
export function addMchSetting(data) {
  return request({
    url: "/mch/setting",
    method: "post",
    data: data,
  });
}

// 修改商户
export function updateMchSetting(data) {
  return request({
    url: "/mch/setting",
    method: "post",
    data: data,
  });
}
