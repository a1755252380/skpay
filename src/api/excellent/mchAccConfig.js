import request from "@/utils/requestGo";

// 查询商户账户配置列表
export function listMchAccConfig(query) {
  return request({
    url: "/mch/config/msg",
    method: "get",
    params: query,
  });
}

// 查询商户账户配置详细
export function getMchAccConfig(id) {
  let query = {
    mch_num: id,
    currency: null,
    payin_chnl_id: null,
    payout_chnl_id: null,
    page: null,
    limit: null,
  };
  return request({
    url: "/mch/config/msg",
    method: "get",
    params: query,
  });
}

// 新增商户账户配置
export function addMchAccConfig(data) {
  return request({
    url: "/mch/config",
    method: "post",
    data: data,
  });
}

// 修改商户账户配置
export function updateMchAccConfig(data) {
  return request({
    url: "/mch/config",
    method: "post",
    data: data,
  });
}
