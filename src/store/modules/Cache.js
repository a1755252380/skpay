import { listChnlSetting } from "@/api/excellent/chnlSetting";
const Cache = {
  state: {
    //通道列表
    channelList: [],
    loading: false,
  },
  mutations: {
    setOptions(state, options) {
      state.channelList = options;
    },
    setLoading(state, loading) {
      state.loading = loading;
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
  },
};

export default Cache;
