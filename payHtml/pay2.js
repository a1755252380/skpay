var timeInterval;
var countDown = 600;
var waitTime = 0;
var upiLink =
  "upi://pay?pa=meharcontructioncompany.54831092@sbi&pn=better111&mc=5039&tr=&tn=otQmOxHj&am=100.00&cu=INR&url=&mode=02&purpose=00&orgid=159002&sign=MEYCIQCqi00G7GjGJYiQLsx70fmZNoIULjjZhMf5N51i7RnWqAIhAJEkrVmGHObW5ImvWSb1F+1/QpaHJHQhcHEv1cIVSjlb";
var link = upiLink.replace("upi://", "");
let paymoney; //支付金额
let order_id; //订单号
//等待订单的支付状态
function wait() {
  refreshWaitTime();
  timeInterval = setInterval(function () {
    if (waitTime >= 0) {
      refreshWaitTime();
      if (waitTime >= countDown || (waitTime > 0 && waitTime % 3 == 0)) {
        syncOrder(order_id);
      }
      waitTime++;
    } else {
      $(".main .pay-button").removeClass("check");
      $(".main .pay-button").addClass("pay-button-display");
    }
  }, 1000);
}
//重置倒计时
function refreshWaitTime() {
  var left = countDown - waitTime;
  var minute = Math.floor(left / 60);
  var second = left % 60;
  var minStr = minute < 10 ? "0" + minute : minute;
  var secStr = second < 10 ? "0" + second : second;
  $(".wait2 .time").html(minStr + ":" + secStr);
}
//支付接口请求
function syncOrder(code) {
  setTimeout(() => {
    $("#payButton").css("display", "block");
    paymoney = (parseInt(2000) / 100).toFixed(2);
    $(".payMoney").text(paymoney);
    $("#loading").css("display", "none");
  }, 2000);
  if (code == null || code == undefined || code == "") {
    return;
  }

  // $.ajax({
  //   type: "GET",
  //   url: "https://www.payou.in/cashier/order/sync?order_id=" + code,
  //   dataType: "json",
  //   success: (data) => {
  //     console.log(data);

  //     //2 padding
  //     //1 成功
  //     //0 失败
  //     //6 不改
  //     $("#payButton").css("display", "block");
  //     paymoney = (parseInt(data.amount) / 100).toFixed(2);
  //     $(".payMoney").text(paymoney);
  //     upiLink = data.upiLink;
  //     $("#loading").css("display", "none");
  //     if (data.status === 0 || data.status === 1 || data.status === 2) {
  //       clearInterval(timeInterval);
  //       getQueryParams(data.status);
  //     }
  //     if (
  //       data.amount === null ||
  //       data.amount === undefined ||
  //       data.amount === ""
  //     ) {
  //       clearInterval(timeInterval);
  //       return;
  //     }
  //   },
  //   error: function (e) {},
  // });
  if (waitTime >= countDown) {
    clearInterval(timeInterval);
    getQueryParams(2);
  }
}
//订单状态渲染
function getQueryParams(status) {
  let showContent = "Payment successful";
  let bgColor = "#06a640";
  if (status == 0) {
    showContent = "Payment successful";
    bgColor = "#06a640";
  } else if (status == 2) {
    showContent = "Overtime Payment";
    bgColor = "#e91744";
  } else if (status == 1) {
    showContent = "Payment Failure";
    bgColor = "#e91744";
  }
  let htmlContent = `
    <div class="title" style="background-color :${bgColor}" id="stateTitleShow"><span class="title-txt stateShow ">${showContent}</span></div>
  <div class="content">
    <span class="content-txt"
      ><span class="stateShow">${showContent}</span>,please return to the app to view</span
    >
  </div>`;
  document.getElementById("PayChoose").style.display = "none";
  document.getElementById("PayResult").style.display = "Block";
  document.getElementById("PayResult").innerHTML = htmlContent;
}

$(function () {
  //获取url中传入的参数
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  order_id = params.get("order_id");

  var payType = localStorage.getItem("platform_pay_type");
  if (payType) {
    $(".pay-type .check").removeClass("check");
    $('.pay-type li[data="' + payType + '"]').addClass("check");
  } else {
    $(".pay-type .check").removeClass("check");
    $(".pay-type li:first").addClass("check");
  }
  $(".pay-type li").click(function () {
    $(".pay-type .check").removeClass("check");
    $(this).addClass("check");
  });
  $(".pay-button").click(function () {
    if ($(".main .pay-button").hasClass("pay-button-display")) {
      return;
    }
    payType = $(".pay-type .check").attr("data");
    localStorage.setItem("platform_pay_type", payType);
    var u = navigator.userAgent;
    var isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    if (payType == "mobikwik") {
      location.href = payType + "://" + link.replace("pay?", "open?");
    } else if (payType == "bhim") {
      location.href = payType + "://" + link.replace("pay?", "mandate?");
    } else {
      location.href =
        payType + "://" + (isIos || payType == "gpay" ? "upi/" : "") + link;
    }
  });
  syncOrder(order_id);
  wait(); //查询订单状态
});
