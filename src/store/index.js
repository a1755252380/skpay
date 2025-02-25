import Vue from "vue";
import Vuex from "vuex";
import app from "./modules/app";
import dict from "./modules/dict";
import user from "./modules/user";
import tagsView from "./modules/tagsView";
import permission from "./modules/permission";
import settings from "./modules/settings";
import getters from "./getters";
import IndexData from "./modules/IndexData";
import Cache from "./modules/Cache";
Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    dict,
    user,
    tagsView,
    permission,
    settings,
    IndexData,
    Cache,
  },
  getters,
});

export default store;
