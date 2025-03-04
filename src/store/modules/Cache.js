import { listChnlSetting } from "@/api/excellent/chnlSetting";
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
  },

  actions: {
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
