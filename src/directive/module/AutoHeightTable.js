import {
  addResizeListener,
  removeResizeListener,
} from "element-ui/src/utils/resize-event";
import { throttle } from "@/utils/util.js";
// 设置表格高度
const doResize = (el, binding, vnode) => {
  if (!el || !el.parentNode) return; // 检查 el 和 parent 是否有效
  const bindRef = binding.value && binding.value.Ref;
  let childrenList = [];
  var children = el && el.parentNode.children; //获取父级的所有子节点
  const parent = el && el.parentNode;
  const parentPaddingT = isNaN(parseInt(parent.style.paddingTop))
    ? 0
    : parseInt(parent.style.paddingTop);
  const parentPaddingB = isNaN(parseInt(parent.style.paddingBottom))
    ? 0
    : parseInt(parent.style.paddingBottom);
  for (var i = 0; i < children.length; i++) {
    //循环
    if (children[i].nodeType == 1 && children[i] != el) {
      //如果该节点是元素节点与不是这个节点本身
      childrenList.push(children[i]); // 添加到兄弟节点里
    }
  }
  let exitH = 0;
  childrenList.forEach((el) => {
    exitH += el.getBoundingClientRect().height;
  });
  // 获取调用传递过来的数据
  const { Height } = binding.value;

  // 获取距底部距离（用于展示页码等信息，51为页码盒子高度）
  const customHeight = Height || 51;
  // 计算列表高度
  const height =
    document.getElementById("app-main").offsetHeight -
    customHeight -
    exitH -
    parentPaddingT -
    parentPaddingB;
  // 设置高度

  el.style.height = height + "px";
  el.style.minHeight = height + "px";
  el.style.maxHeight = height + "px";

  if (el.getElementsByClassName("el-table__empty-block").length > 0) {
    el.getElementsByClassName("el-table__empty-block")[0].style.height =
      height - 100 + "px";
  }

  // 解决拖动列宽行不对齐问题--渲染表格
  vnode.context.$refs[bindRef].doLayout();
};

export default {
  // 初始化设置
  bind(el, binding, vnode) {
    // 设置resize监听方法
    // el.parentNode.addEventListener(
    //   "resize",
    //   throttle(() => {
    //     doResize(el, binding);
    //   }, 150)
    // );
    // 设置resize监听方法

    let resizeTimer = null; // 定时器
    el.resizeListener = throttle(() => {
      if (resizeTimer) {
        cancelAnimationFrame(resizeTimer);
      }
      resizeTimer = requestAnimationFrame(() => {
        // 赋值计算后的高度
        el.style.height = "";
        el.style.minHeight = "";
        el.style.maxHeight = "";
        doResize(el, binding, vnode);
      });
    }, 30);
    // 绑定监听方法到addResizeListener
    addResizeListener(window.document.body, el.resizeListener);
  },
  // 所在组件的 VNode 更新时设置
  // 页面上搜索表单是可以展开收起的，当展开更多表单搜索时，表格高度没变（展开收起需要将表格数据重新赋值，内容变化则会重新计算高度）
  update(el, binding, vnode) {
    doResize(el, binding, vnode);
  },
  // 销毁时设置
  unbind(el) {
    // 移除resize监听
    removeResizeListener(window.document.body, el.resizeListener);
    // el.parentNode.removeEventListener("resize", () => {});
  },
};
