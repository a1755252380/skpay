import request from "@/utils/requestGo";

// 登录方法
export function login(username, password, captcha_input, captcha_id) {
  return request({
    url: "/user/login",
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    method: "post",
    data: { username, password, captcha_input, captcha_id },
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
export function getCodeImg(id) {
  return request({
    url: "/captcha/image",

    method: "get",
    timeout: 20000,
    params: {
      id: id,
    },
  });
}
// 获取验证码id
export function getCodeImgID() {
  return request({
    url: "/captcha",

    method: "get",
  });
}
//验证totp验证码
export function verifyTotp(data) {
  return request({
    url: "/user/verify/totp",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}
//验证地区
export function verifyArea() {
  return request({
    url: "/user/ip/check",
    headers: {
      isToken: false,
    },
    method: "get",
  });
}
