import moment from "moment";
//表格金额格式化
export function TableAmount(row, column, cellValue, index) {
  let value = Math.floor(cellValue) / 100;
  if (value) {
    return value.toFixed(2);
  } else {
    return "0.00";
  }
}
export function TableAmount2(row, column, cellValue, index) {
  let value = Math.floor(cellValue);
  if (value) {
    return value.toFixed(2);
  } else {
    return "0.00";
  }
}
//表格费率格式化
export function TableRate(row, column, cellValue, index) {
  if (cellValue) {
    return (cellValue * 100).toFixed(2) + "%";
  } else {
    return "0.00%";
  }
}
//表格时间格式化
export function TableTimeSecond(row, column, cellValue, index) {
  return moment(cellValue * 1000)
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");
}
export function TableTimeFormatYMD(row, column, cellValue, index) {
  return moment(cellValue * 1000)
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD");
}
//格式化时间
export function FormatTime(event, type = "YYYY-MM-DD HH:mm:ss") {
  return moment(event).tz("Asia/Kolkata").format(type);
}
//格式化费率
export function FormatRate(value) {
  return (value * 100).toFixed(2) + "%";
}

//格式化金额
export function FormatAmount(value) {
  if (value) {
    return Math.floor(value) / 100;
  } else {
    return "0.00";
  }
}
// 格式化交易类型
export function typeFormatter(row, column, cellValue, index) {
  const types = {
    1: "账户待结算余额调整记录",
    2: "账户代付可用余额调整记录",
    3: "账户可用余额变动",
    0: "订单流水记录",
    6: "账户冻结金额变动",
  };
  return types[cellValue] || "";
}
export function statusColorFormatter(row, column, cellValue, index) {
  const types = {
    1: "success",
    2: "success",
    3: "warning",
    0: "info",
    6: "",
  };
  return types[cellValue] || "";
}
// 格式化通道名称显示
export function ChannelNameFormatter(row, column, cellValue, index) {
  return (row.chnl_name ? row.chnl_name[0] : "") + row.chnl_id;
}
//通道管理页面的名称格式化
export function SettingChannelNameFormatter(row, column, cellValue, index) {
  return (row.chnl_name ? row.chnl_name[0] : "") + row.id;
}
//商户配置页面通道名称格式化
export function MerchantChannelInNameFormatter(row, column, cellValue, index) {
  return (
    (row.payin_chnl_name ? row.payin_chnl_name[0] : "") + row.payin_chnl_id
  );
}
export function MerchantChannelOutNameFormatter(row, column, cellValue, index) {
  return (
    (row.payout_chnl_name ? row.payout_chnl_name[0] : "") + row.payout_chnl_id
  );
}
//分流通道
export function MerchantChannelOverInNameFormatter(
  row,
  column,
  cellValue,
  index
) {
  return (
    (row.payin_over_chnl_name ? row.payin_over_chnl_name[0] : "") +
    (row.payin_over_chnl_id ? row.payin_over_chnl_id : "")
  );
}
export function MerchantChannelOverOutNameFormatter(
  row,
  column,
  cellValue,
  index
) {
  return (
    (row.payout_over_chnl_name ? row.payout_over_chnl_name[0] : "") +
    (row.payout_over_chnl_id ? row.payout_over_chnl_id : "")
  );
}
