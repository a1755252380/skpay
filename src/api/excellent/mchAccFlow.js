import request from "@/utils/requestGo";

// 查询商户账户流水列表
export function listMchAccFlow(query) {
  if (!query) {
    query = {
      page: 1,
      limit: 20,
      end_time: null,
      start_time: null,
      last_id: null,
      chnl_id: null,
      type: 0,
      stream_type: "order",
      order_id: null,
      merchant_order_id: null,
      msg: null,
    };
  }
  return request({
    url: "/stream",
    method: "get",
    params: query,
  });
}

// 查询商户账户流水详细
export function getMchAccFlow(query) {
  if (!query) {
    query = {
      end_time: null,
      start_time: null,
      last_id: null,
      chnl_id: null,
      type: 0,
      stream_type: "order",
      order_id: null,
      merchant_order_id: null,
      msg: null,
    };
  }
  return request({
    url: "/stream",
    method: "get",
    params: query,
  });
}

// 修改商户账户流水
export function updateMchAccFlow(data) {
  return request({
    url: "/excellent/mchAccFlow",
    method: "put",
    data: data,
  });
}
