import request from "@/utils/requestGo";

// 登录方法
export function login(username, password) {
  return request({
    url: "/user/login",
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    method: "post",
    data: { username, password },
  });
}

// 注册方法
export function register(data) {
  return request({
    url: "/auth/register",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}

// 刷新方法
export function refreshToken() {
  return request({
    url: "/auth/refresh",
    method: "post",
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: "/user/info",
    method: "get",
  });
}

// 退出方法
export function logout() {
  return request({
    url: "/user/logout",
    method: "get",
  });
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: "/code",
    headers: {
      isToken: false,
    },
    method: "get",
    timeout: 20000,
  });
}
