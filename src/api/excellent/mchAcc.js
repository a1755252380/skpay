import request from "@/utils/requestGo";

// 查询商户账户总金额列表
export function listMchAcc(query) {
  return request({
    url: "/mch/balance",
    method: "get",
    params: query,
  });
}

// 查询商户账户总金额详细
export function getMchAcc(id) {
  return request({
    url: "/mch/balance",
    method: "get",
    params: {
      page: null,
      limit: null,
      mch_num: id,
      mch_name: null,
      currency: null,
    },
  });
}

// 新增商户账户总金额
export function addMchAcc(data) {
  return request({
    url: "/excellent/mchAcc",
    method: "post",
    data: data,
  });
}

// 修改商户账户总金额

export function updateMchAcc(data) {
  let SubmitData = data;
  if (!Array.isArray(data)) {
    SubmitData = [data];
  }
  return request({
    url: "/balance/operation",
    method: "post",
    data: {
      data: SubmitData,
    },
  });
}

// 删除商户账户总金额
export function delMchAcc(id) {
  return request({
    url: "/excellent/mchAcc/" + id,
    method: "delete",
  });
}
