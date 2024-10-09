/**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 ruoyi
 */

import store from "@/store";

export const hasPermiVisible = (value) => {
  const all_permission = "*:*:*";
  const permissions = store.getters && store.getters.permissions;
  console.log(store.state.user.roles.includes("admin"));

  if (store.state.user.roles.includes("admin")) {
    return true;
  } else {
    return false;
  }
  if (value && value instanceof Array && value.length > 0) {
    const permissionFlag = value;

    const hasPermissions = permissions.some((permission) => {
      return (
        all_permission === permission || permissionFlag.includes(permission)
      );
    });

    return hasPermissions;
  } else {
    throw new Error(`请设置操作权限标签值`);
  }
};
