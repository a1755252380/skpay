import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";
import { isRelogin } from "@/utils/requestGo";
NProgress.configure({ showSpinner: false });
import { verifyArea } from "@/api/login";

const whiteList = ["/login", "/register", "/404", "/401", "/4040"];
const verifyList = ["/login", "/register"];
router.beforeEach((to, from, next) => {
  NProgress.start();

  if (getToken()) {
    to.meta.title && store.dispatch("settings/setTitle", to.meta.title);
    /* has token*/
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      if (store.getters.roles && store.getters.roles.length === 0) {
        isRelogin.show = true;
        // 判断当前用户是否已拉取完user_info信息
        store
          .dispatch("GetInfo")
          .then((res) => {
            isRelogin.show = false;
            store.dispatch("GenerateRoutes").then((accessRoutes) => {
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes); // 动态添加可访问路由表
              next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
            });
          })
          .catch((err) => {
            store.dispatch("LogOut").then(() => {
              Message.error(err);
              next({ path: "/" });
            });
          });
      } else {
        next();
      }
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      if (verifyList.indexOf(to.path) !== -1) {
        verifyArea()
          .then((res) => {
            next();
          })
          .catch(() => {
            next("/4040");
            return;
          })
          .finally(() => {
            NProgress.done();
          });
        return;
      }
    }

    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      // 在页面加载时读取sessionStorage里的状态信息
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`); // 否则全部重定向到登录页
      // ?redirect=${encodeURIComponent(to.fullPath)}
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
