import {
  listChnlSetting,
  listAllocationPool,
} from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting";
import { listMchAccConfig } from "@/api/excellent/mchAccConfig";
const Cache = {
  state: {
    //通道列表
    channelList: [],
    loading: false,
    //商户列表
    MchList: [],
    MchListLoading: false,
    //商户配置列表
    MchConfigList: [],
    MchConfigLoading: false,
    //通道池
    PayInChannelPool: [],
    PayInChannelLoading: false,
    PayInChannelPool2: [],
    PayInChannelPool2Loading: false,
    PayOutChannelPool: [],
    PayOutChannelLoading: false,
  },
  mutations: {
    setOptions(state, options) {
      state.channelList = options;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setMchList(state, options) {
      state.MchList = options;
    },
    setMchListLoading(state, loading) {
      state.MchListLoading = loading;
    },
    setMchConfigList(state, options) {
      state.MchConfigList = options;
    },
    setMchConfigListLoading(state, loading) {
      state.MchConfigLoading = loading;
    },
    setPayInChannelPool(state, options) {
      state.PayInChannelPool = options;
    },
    setPayInChannelLoading(state, loading) {
      state.PayInChannelLoading = loading;
    },
    setPayOutChannelPool(state, options) {
      state.PayOutChannelPool = options;
    },
    setPayOutChannelLoading(state, loading) {
      state.PayOutChannelLoading = loading;
    },
    setPayInChannelPool2(state, options) {
      state.PayInChannelPool2 = options;
    },
    setPayInChannelPool2Loading(state, loading) {
      state.PayInChannelPool2Loading = loading;
    },
  },

  actions: {
    //获取通道池
    //获取通道池
    async fetchChannelPool({ state, commit }, params) {
      const paramsType = params && params.type ? params.type : "payin1";
      //是否为更新状态

      const isUpdate = params && params.isUpdate ? true : false;

      if (!isUpdate) {
        if (paramsType === "payin") {
          // 如果已有数据，不再请求
          if (state.PayInChannelPool.length > 0 || state.PayInChannelLoading) {
            return;
          }
        } else if (paramsType === "payin2") {
          // 如果已有数据，不再请求
          if (
            state.PayInChannelPool2.length > 0 ||
            state.PayInChannelPool2Loading
          ) {
            return;
          }
        } else {
          // 如果已有数据，不再请求
          if (
            state.PayOutChannelPool.length > 0 ||
            state.PayOutChannelLoading
          ) {
            return;
          }
        }
      }

      // 设置为加载中

      if (paramsType === "payin2") {
        commit("setPayInChannelPool2Loading", true); // 存储数据
      } else if (paramsType === "payin1") {
        commit("setPayInChannelLoading", true); // 存储数据
      } else if (paramsType === "payout") {
        commit("setPayOutChannelLoading", true); // 存储数据
      }

      listAllocationPool({
        type: paramsType,
      })
        .then((response) => {
          const allocationPoolList = [];
          for (const key in response.chnl_names) {
            allocationPoolList.push({
              id: key,
              chnl_name: response.chnl_names[key],
              label: response.chnl_names[key][0] + key,
            });
          }
          if (paramsType === "payin2") {
            commit("setPayInChannelPool2", allocationPoolList); // 存储数据
          } else if (paramsType === "payin1") {
            commit("setPayInChannelPool", allocationPoolList); // 存储数据
          } else if (paramsType === "payout") {
            commit("setPayOutChannelPool", allocationPoolList); // 存储数据
          }
        })
        .finally(() => {
          // 设置为加载中

          if (paramsType === "payin2") {
            commit("setPayInChannelPool2Loading", false); // 存储数据
          } else if (paramsType === "payin1") {
            commit("setPayInChannelLoading", false); // 存储数据
          } else if (paramsType === "payout") {
            commit("setPayOutChannelLoading", false); // 存储数据
          }
        });
    },

    //获取通道列表
    async fetchOptions({ state, commit }, params) {
      const isUpdate = params && params.isUpdate ? true : false;

      if (!isUpdate) {
        // 如果已有数据，不再请求
        if (state.channelList.length > 0 || state.loading) {
          return;
        }
      }

      // 设置为加载中
      commit("setLoading", true);
      listChnlSetting({
        pageNum: null,
        pageSize: null,
        terraceSymbol: null,
        state: null,
      })
        .then((response) => {
          commit(
            "setOptions",
            response.rows.sort((a, b) => a.id - b.id)
          ); // 存储数据
        })
        .finally(() => {
          // 请求完成后，设置加载状态为 false
          commit("setLoading", false);
        });
    },
    async fetchMchList({ state, commit }, params) {
      const isUpdate = params && params.isUpdate ? true : false;
      if (!isUpdate) {
        // 如果已有数据，不再请求
        if (state.MchList.length > 0 || state.MchListLoading) {
          return;
        }
      }
      // 设置为加载中
      commit("setMchListLoading", true);
      listMchSetting({
        page: null,
        limit: null,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      })
        .then((response) => {
          commit("setMchList", response.rows); // 存储数据
        })
        .finally(() => {
          // 请求完成后，设置加载状态为 false
          commit("setMchListLoading", false);
        });
    },
    //更新商户名称列表
    async updateMchList({ state, commit }) {
      // 设置为加载中
      commit("setMchListLoading", true);
      listMchSetting({
        page: null,
        limit: null,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      })
        .then((response) => {
          commit("setMchList", response.rows); // 存储数据
        })
        .finally(() => {
          // 请求完成后，设置加载状态为 false
          commit("setMchListLoading", false);
        });
    },

    async fetchMchConfigList({ state, commit }, params) {
      const isUpdate = params && params.isUpdate ? true : false;
      if (!isUpdate) {
        // 如果已有数据，不再请求
        if (state.MchConfigList.length > 0 || state.MchConfigListLoading) {
          return;
        }
      }

      // 设置为加载中
      commit("setMchConfigListLoading", true);
      listMchAccConfig({
        page: null,
        limit: 500,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      })
        .then((response) => {
          commit("setMchConfigList", response.rows); // 存储数据
        })
        .finally(() => {
          // 请求完成后，设置加载状态为 false
          commit("setMchConfigListLoading", false);
        });
    },
  },
};

export default Cache;
