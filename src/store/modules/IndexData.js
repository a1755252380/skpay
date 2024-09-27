const state = {
  CollectionSuccessRateTitle: "当日代收成功率与数据统计",
  CollectionSuccessRateX: [],
  CollectionSuccessRateY: [],
  CollectionSuccessRateMax: 0, //取列表中的平均值作为坐标轴的最小值以便于展示
  //代付
  SuccessRateOfProxyPaymentX: [],
  SuccessRateOfProxyPaymentY: [],
  SuccessRateOfProxyPaymentTitle: "当日代付成功率与数据统计",
  //是否进行重复请求
  isRepeatRequest: true,
};
const mutations = {};

const actions = {};

export default {
  state,
  mutations,
  actions,
};
