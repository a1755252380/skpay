export function TableAmount(row, column, cellValue, index) {
  let value = (cellValue / 100).toFixed(2);
  if (value) {
    return value;
  } else {
    return "0.00";
  }
}
export function TableRate(row, column, cellValue, index) {
  if (cellValue) {
    return value.toFixed(2) + "%";
  } else {
    return "0.00%";
  }
}
//格式化时间
import moment from "moment";
export function FormatTime(event, type = "YYYY-MM-DD HH:mm:ss") {
  return moment(event).tz("Asia/Kolkata").format(type);
}
export function FormatRate(value) {
  return value.toFixed(2) + "%";
}
