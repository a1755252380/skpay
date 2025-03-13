import request from "@/utils/requestGo";

// 查询支付通道列表
export function listChnlSetting(query) {
  if (!query) {
    query = {
      page: null,
      limit: null,
      chnl_name: null,
      terraceSymbol: null,
      state: null,
    };
  }
  console.log();

  return request({
    url: "/chnl/setting/msg",
    method: "get",
    params: query,
  });
}

// 查询支付通道详细
export function getChnlSetting(id) {
  let query = {
    page: null,
    limit: null,
    chnl_name: id,
    terraceSymbol: null,
    state: null,
  };

  return request({
    url: "/chnl/setting/msg",
    method: "get",
    params: query,
  });
}

// 新增支付通道
export function addChnlSetting(data) {
  return request({
    url: "/chnl/setting",
    method: "post",
    data: data,
  });
}

// 修改支付通道
export function updateChnlSetting(data) {
  return request({
    url: "/chnl/setting",
    method: "post",
    data: data,
  });
}

// 删除支付通道
export function delChnlSetting(id) {
  return request({
    url: "/excellent/chnlSetting/" + id,
    method: "delete",
  });
}
//动态查询通道指定日期的成功金额

export function DynamicQueryChannel(params) {
  return request({
    url: "/chnl/count/amount",
    method: "get",
    params: params,
  });
}
