import { login, logout, getInfo, refreshToken } from "@/api/login";
import { getToken, setToken, setExpiresIn, removeToken } from "@/utils/auth";
import { Base32Encode } from "@/utils/util";
import router from "@/router";
import Cookies from "js-cookie";
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
    //是否需要弹窗绑定二维码
    isShowBindQrCode:
      getToken() != "" ? (Cookies.get("totp") == 1 ? true : false) : false,
    totp: Cookies.get("totp") ? Cookies.get("totp") : 0,
    passwordBase32: Cookies.get("passBase32") ? Cookies.get("passBase32") : "",
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
    SET_passwordBase32: (state, passwordBase32) => {
      state.passwordBase32 = passwordBase32;
    },
    SET_isShowBindQrCode: (state, permissions) => {
      state.isShowBindQrCode = permissions;
    },
  },

  actions: {
    // 登录
    Login({ commit, state }, userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const captcha_input = userInfo.captcha_input;
      console.log("登录");

      return new Promise((resolve, reject) => {
        login(username, password, captcha_input)
          .then((res) => {
            //0是已激活没给验证码
            //1是未激活需绑定
            commit("SET_passwordBase32", Base32Encode(password));
            Cookies.set("passBase32", Base32Encode(password));

            if (res.totp == 1) {
              setTimeout(() => {
                commit("SET_isShowBindQrCode", true);
              }, 1000);
            }
            Cookies.set("totp", res.totp);
            let data = res.user_info;
            // setToken(data.access_token);
            // commit("SET_TOKEN", data.access_token);
            // setExpiresIn(data.expires_in);
            setToken(data.token);
            commit("SET_TOKEN", data.token);
            commit("SET_EXPIRES_IN", data.cookie_expire);
            setExpiresIn(data.cookie_expire);

            return resolve(data);
          })
          .catch((error) => {
            console.log(error);
            return reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
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
          })
          .catch((res) => {
            commit("SET_ROLES", null);

            router.push({ path: "/login" });
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
            commit("SET_TOKEN", null);
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
