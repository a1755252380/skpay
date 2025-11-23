import {
  listChnlSetting,
  listAllocationPool,
} from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting";
import { listMchAccConfig } from "@/api/excellent/mchAccConfig";

// Promise 缓存对象，模块外部维护
const _promises = {};

const Cache = {
  state: {
    // 通道列表
    channelList: [],
    loading: false,
    // 商户列表
    MchList: [],
    MchListLoading: false,
    // 商户配置列表
    MchConfigList: [],
    MchConfigLoading: false,
    // 通道池
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
    async fetchChannelPool({ state, commit }, params) {
      const paramsType = params?.type || "payin1";
      const isUpdate = !!params?.isUpdate;

      const promiseKey = `fetchChannelPool_${paramsType}`;
      const listMap = {
        payin1: state.PayInChannelPool,
        payin2: state.PayInChannelPool2,
        payout: state.PayOutChannelPool,
      };
      if (!isUpdate && listMap[paramsType].length > 0) {
        return Promise.resolve(listMap[paramsType]);
      }

      if (_promises[promiseKey]) return _promises[promiseKey];

      const loadingMap = {
        payin1: "setPayInChannelLoading",
        payin2: "setPayInChannelPool2Loading",
        payout: "setPayOutChannelLoading",
      };
      commit(loadingMap[paramsType], true);

      _promises[promiseKey] = listAllocationPool({ type: paramsType })
        .then((response) => {
          const list = Object.keys(response.chnl_names).map((key) => ({
            id: key,
            chnl_name: response.chnl_names[key],
            label: response.chnl_names[key][0] + key,
          }));
          const commitMap = {
            payin1: "setPayInChannelPool",
            payin2: "setPayInChannelPool2",
            payout: "setPayOutChannelPool",
          };
          commit(commitMap[paramsType], list);
          return list;
        })
        .finally(() => {
          commit(loadingMap[paramsType], false);
          _promises[promiseKey] = null;
        });

      return _promises[promiseKey];
    },

    async fetchOptions({ state, commit }, params) {
      const isUpdate = !!params?.isUpdate;
      if (!isUpdate && state.channelList.length > 0) {
        return Promise.resolve(state.channelList);
      }

      if (_promises.fetchOptions) return _promises.fetchOptions;

      commit("setLoading", true);
      _promises.fetchOptions = listChnlSetting({
        pageNum: null,
        pageSize: null,
        terraceSymbol: null,
        state: null,
      })
        .then((response) => {
          const result = response.rows.sort((a, b) => a.id - b.id);
          commit("setOptions", result);
          return result;
        })
        .finally(() => {
          commit("setLoading", false);
          _promises.fetchOptions = null;
        });

      return _promises.fetchOptions;
    },

    async fetchMchList({ state, commit }, params) {
      const isUpdate = !!params?.isUpdate;
      if (!isUpdate && state.MchList.length > 0) {
        return Promise.resolve(state.MchList);
      }

      if (_promises.fetchMchList) return _promises.fetchMchList;

      commit("setMchListLoading", true);
      _promises.fetchMchList = listMchSetting({
        page: null,
        limit: null,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      })
        .then((response) => {
          commit("setMchList", response.rows);
          return response.rows;
        })
        .finally(() => {
          commit("setMchListLoading", false);
          _promises.fetchMchList = null;
        });

      return _promises.fetchMchList;
    },

    async updateMchList({ commit }) {
      commit("setMchListLoading", true);
      const result = await listMchSetting({
        page: null,
        limit: null,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      });
      commit("setMchList", result.rows);
      commit("setMchListLoading", false);
      return result.rows;
    },

    async fetchMchConfigList({ state, commit }, params) {
      const isUpdate = !!params?.isUpdate;
      if (!isUpdate && state.MchConfigList.length > 0) {
        return Promise.resolve(state.MchConfigList);
      }

      if (_promises.fetchMchConfigList) return _promises.fetchMchConfigList;

      commit("setMchConfigListLoading", true);
      _promises.fetchMchConfigList = listMchAccConfig({
        page: null,
        limit: 500,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
      })
        .then((response) => {
          commit("setMchConfigList", response.rows);
          return response.rows;
        })
        .finally(() => {
          commit("setMchConfigListLoading", false);
          _promises.fetchMchConfigList = null;
        });

      return _promises.fetchMchConfigList;
    },
  },
};

export default Cache;
