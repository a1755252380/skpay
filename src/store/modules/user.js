import { login, logout, getInfo, refreshToken } from "@/api/login";
import { getToken, setToken, setExpiresIn, removeToken } from "@/utils/auth";
import jsCookie from "js-cookie";

const user = {
  state: {
    token: getToken(),
    // token: "",
    id: "",
    name: "",
    avatar: "",
    roles: [],
    permissions: [],
    //缓存数据
    CacheData: {},
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_EXPIRES_IN: (state, time) => {
      state.expires_in = time;
    },
    SET_ID: (state, id) => {
      state.id = id;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions;
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      // const code = userInfo.code;
      // const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        login(username, password)
          .then((res) => {
            let data = res.user_info;
            // setToken(data.access_token);
            // commit("SET_TOKEN", data.access_token);
            // setExpiresIn(data.expires_in);
            setToken(data.token);
            commit("SET_TOKEN", data.token);
            commit("SET_EXPIRES_IN", data.cookie_expire);
            setExpiresIn(data.cookie_expire);
            console.log(jsCookie.get());

            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then((res) => {
          res = res.user_info;
          // const avatar =
          //   user.avatar == "" || user.avatar == null
          //     ? require("@/assets/images/profile.jpg")
          //     : user.avatar;
          // if (res.roles && res.roles.length > 0) {
          //   // 验证返回的roles是否是一个非空数组
          //   commit("SET_ROLES", res.role_name);
          //   commit("SET_PERMISSIONS", res.username);
          // } else {
          //   commit("SET_ROLES", ["ROLE_DEFAULT"]);
          // }

          commit("SET_ROLES", res.power);
          commit("SET_PERMISSIONS", res.username);
          commit("SET_ID", res.user_id);
          commit("SET_NAME", res.username);
          // commit("SET_AVATAR", avatar);
          resolve(res);
        });
      });
    },

    // 刷新token
    RefreshToken({ commit, state }) {
      return new Promise((resolve, reject) => {
        refreshToken(state.token)
          .then((res) => {
            setExpiresIn(res.data);
            commit("SET_EXPIRES_IN", res.data);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit("SET_TOKEN", "");
            commit("SET_ROLES", []);
            commit("SET_PERMISSIONS", []);
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        commit("SET_TOKEN", "");
        removeToken();
        resolve();
      });
    },
  },
};

export default user;
