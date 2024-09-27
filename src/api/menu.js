import request from "@/utils/requestGo";

// 获取路由
export const getRouters = () => {
  return request({
    url: "/user/menu/getRouters",
    method: "get",
  });
};
