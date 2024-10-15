import moment from "moment";

export function TableAmount(row, column, cellValue, index) {
  // console.log("------------------------------------");
  // console.log(row.mch_num);

  // console.log(column.label, ":", cellValue);
  let value = Math.floor(cellValue) / 100;
  // console.log(column.label, ":", value.toFixed(2));
  // console.log("------------------------------------");
  if (value) {
    return value.toFixed(2);
  } else {
    return "0.00";
  }
}
export function TableRate(row, column, cellValue, index) {
  if (cellValue) {
    return (cellValue * 100).toFixed(2) + "%";
  } else {
    return "0.00%";
  }
}

export function TableTimeSecond(row, column, cellValue, index) {
  return moment(cellValue * 1000)
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");
}
//格式化时间
export function FormatTime(event, type = "YYYY-MM-DD HH:mm:ss") {
  return moment(event).tz("Asia/Kolkata").format(type);
}
export function FormatRate(value) {
  return (value * 100).toFixed(2) + "%";
}
