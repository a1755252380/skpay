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
    MchNameList: [],
    MchNameLoading: false,
    //通道池
    channelPool: [],
    channelPoolLoading: false,
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
    setMchNameList(state, options) {
      state.MchNameList = options;
    },
    setMchNameListLoading(state, loading) {
      state.MchNameLoading = loading;
    },
    setChannelPool(state, options) {
      state.channelPool = options;
    },
    setChannelPoolLoading(state, loading) {
      state.channelPoolLoading = loading;
    },
  },

  actions: {
    //获取通道池
    //获取通道池
    async fetchChannelPool({ state, commit }) {
      // 如果已有数据，不再请求
      if (state.channelPool.length > 0 || state.channelPoolLoading) {
        return;
      }
      // 设置为加载中
      commit("setChannelPoolLoading", true);
      listAllocationPool()
        .then((response) => {
          const allocationPoolList = [];
          for (const key in response.chnl_names) {
            allocationPoolList.push({
              id: key,
              chnl_name: response.chnl_names[key],
              label: response.chnl_names[key][0] + key,
            });
          }

          commit("setChannelPool", allocationPoolList); // 存储数据
        })
        .finally(() => {
          // 请求完成后，设置加载状态为 false
          commit("setChannelPoolLoading", false);
        });
    },

    //获取通道列表
    async fetchOptions({ state, commit }) {
      // 如果已有数据，不再请求
      if (state.channelList.length > 0 || state.loading) {
        return;
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
    async fetchMchList({ state, commit }) {
      // 如果已有数据，不再请求
      if (state.MchList.length > 0 || state.MchListLoading) {
        return;
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

    async fetchMchNameList({ state, commit }) {
      // 如果已有数据，不再请求
      if (state.MchNameList.length > 0 || state.MchNameLoading) {
        return;
      }
      // 设置为加载中
      commit("setMchNameListLoading", true);
      listMchSetting({
        page: null,
        limit: null,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      })
        .then((response) => {
          commit("setMchNameList", response.rows); // 存储数据
        })
        .finally(() => {
          // 请求完成后，设置加载状态为 false
          commit("setMchNameListLoading", false);
        });
    },
  },
};

export default Cache;
