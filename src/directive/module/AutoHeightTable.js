import {
  addResizeListener,
  removeResizeListener,
} from "element-ui/src/utils/resize-event";
import { throttle } from "@/utils/util.js";

let mainHeight = 0;

// 高度计算函数
const doResize = (el, binding, vnode) => {
  if (!el || !el.parentNode) return;

  const bindRef = binding.value && binding.value.Ref;
  const { Height } = binding.value || {};
  const customHeight = Height || 61;

  const parent = el.parentNode;
  const parentPaddingT = parseInt(parent.style.paddingTop) || 0;
  const parentPaddingB = parseInt(parent.style.paddingBottom) || 0;

  let childrenHeight = 0;
  Array.from(parent.children).forEach((child) => {
    if (child.nodeType === 1 && child !== el) {
      childrenHeight += child.getBoundingClientRect().height;
    }
  });

  if (!mainHeight) {
    const appMain = document.getElementById("app-main");
    mainHeight = appMain ? appMain.offsetHeight : window.innerHeight;
  }

  const height =
    mainHeight -
    customHeight -
    childrenHeight -
    parentPaddingT -
    parentPaddingB;

  if (el.style.height !== height + "px") {
    el.style.height = height + "px";
    el.style.minHeight = height + "px";
    el.style.maxHeight = height + "px";
  }

  const emptyBlock = el.querySelector(".el-table__empty-block");
  if (emptyBlock) {
    emptyBlock.style.height = height - 100 + "px";
  }

  if (
    bindRef &&
    vnode.context &&
    vnode.context.$refs[bindRef] &&
    vnode.context.$refs[bindRef].$el
  ) {
    const table = vnode.context.$refs[bindRef];
    if (
      table.$el.offsetHeight !== height &&
      typeof table.doLayout === "function"
    ) {
      table.doLayout();
    }
  }
};

// 轮询检测 $refs
const waitForRef = (
  vnode,
  refName,
  callback,
  maxTime = 2000,
  interval = 50
) => {
  let elapsed = 0;
  const timer = setInterval(() => {
    const table = vnode.context && vnode.context.$refs[refName];
    if (table && table.$el) {
      clearInterval(timer);
      callback();
    } else {
      elapsed += interval;
      if (elapsed >= maxTime) clearInterval(timer); // 超时停止
    }
  }, interval);
};

export default {
  bind(el, binding, vnode) {
    let resizeTimer = null;
    el.resizeListener = throttle(() => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        mainHeight = 0;
        el.style.height = "200px"; // 临时占位
        doResize(el, binding, vnode);
      });
    }, 50);

    // 监听 body 尺寸变化
    addResizeListener(document.body, el.resizeListener);

    // 初始执行一次，等待 $refs 可用
    const bindRef = binding.value && binding.value.Ref;
    if (bindRef) {
      waitForRef(vnode, bindRef, () => doResize(el, binding, vnode));
    } else {
      vnode.context.$nextTick(() => doResize(el, binding, vnode));
    }
  },

  update(el, binding, vnode) {
    const bindRef = binding.value && binding.value.Ref;
    if (bindRef) {
      waitForRef(vnode, bindRef, () => doResize(el, binding, vnode));
    } else {
      vnode.context.$nextTick(() => doResize(el, binding, vnode));
    }
  },

  unbind(el) {
    removeResizeListener(document.body, el.resizeListener);
  },
};
