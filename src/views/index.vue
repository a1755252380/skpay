<template>
  <div class="ele-body ele-body-card">
    <!--
  userType 0-系统管理员
  【商户账户统计】/【主体账户统计】/【代理账户统计】/【商户端订单统计】/【通道端订单统计】
  1-商户代理
  【商户账户统计】 /【代理账户统计】
  -->

    <!-- <el-card header="当日代收数据统计" class="index_card"> -->
    <div class="index_title">当日代收数据统计</div>

    <MerchantAccountStatistics :LineTitle="'代收成功率'" ref="MerchantAccountStatistics" class="index_card"
      :CardData="AgencyAccountStatisticsCard">
    </MerchantAccountStatistics>
    <!-- </el-card> -->
    <!-- v-if="userType === 0" -->
    <!-- <el-card header="当日代付数据统计" class="index_card"> -->
    <div class="index_title">当日代付数据统计</div>
    <DailyPaymentDataStatisticsVue :LineTitle="'代付成功率'" ref="SuccessRateOfProxyPayment" class="index_card"
      :CardData="PaymentDataStatistics">
    </DailyPaymentDataStatisticsVue>
    <!-- </el-card> -->

    <!-- <el-row :gutter="30" v-if="userType === 0">
        <el-col :md="12" :sm="12" :xs="24">
          <el-card header="商户端订单统计" class="index_card">
            <MerchantEndOrderStatistics></MerchantEndOrderStatistics>
          </el-card>
        </el-col>
        <el-col :md="12" :sm="12" :xs="24">
          <el-card header="通道端订单统计" class="index_card">
            <ChannelEndOrderStatistics></ChannelEndOrderStatistics>
          </el-card>
        </el-col>
      </el-row> -->
    <!-- 代理账户统计 -->
    <!-- <el-card header="代理账户统计" class="index_card">
        <CreateEcharts :id="'AgencyAccountStatistics'" :options="AgencyAccountStatisticsOptions" :styles="{
          height: '18rem',
        }"></CreateEcharts>

      </el-card> -->

  </div>
</template>

<style scoped>
@media only screen and (min-width: 992px) {
  .el-col-md-4 {
    width: 19.666667%;
  }
}

.analysis-chart-card-num {
  font-size: 24px;
  /* 字体稍大 */
  line-height: 36px;
  /* 行高也相应调整 */
  padding: 10px 20px;
  /* 内边距也稍大 */
  width: 100px;
  /* 设定一个固定的宽度，根据需要调整 */
  text-align: center;
  /* 文字居中 */
}
</style>
<script>

import MerchantAccountStatistics from "./Index/DailyCollectionDataStatistics.vue";
import DailyPaymentDataStatisticsVue from './Index/DailyPaymentDataStatistics.vue';
import { statistics } from "@/api/excellent/index";
import moment from "moment";
import { listOrderSuccessRate } from "@/api/excellent/OrderSuccessRate";
export default {
  name: "Index",
  data() {
    return {
      // 控制台结果
      mch_console: {},
      chnl_console: {},
      agent_console: {},
      activeNames: ["1", "2", "3", "4", "5"],
      userType: "",
      controller: null,
      //代付
      PaymentDataStatistics: [
        {
          name: "代付成功数",
          value: 0,
          key: 'payout_success_count',
          precision: 0, color: 'rgb(34 197 94)',
        },

        {
          name: "代付总数",
          value: 0, key: 'payout_total_count',
          precision: 0,
          color: this.$store.state.settings.theme
        },
        {
          name: "代付成功金额",
          value: 0,
          key: 'payout_success_amount',
          precision: 2,
          currency: '$', color: 'rgb(34 197 94)',
        },
        {
          name: "代付总金额",
          value: 0, key: 'payout_total_amount',
          precision: 2,
          currency: '$',
          color: this.$store.state.settings.theme
        },
        {
          name: "代付在途订单数",
          value: 0, key: 'payout_pending_count',
          precision: 0,
          color: '#E6A23C'
        },
        {
          name: "代付服务费",
          value: 0, key: 'payout_service_amount',
          precision: 2,
          currency: '$',
          color: '#E6A23C'
        },
        {
          name: "代付成功率",
          value: 0,//(data.payout_success_count / data.payout_total_count).toFixed(2)
          key: 'rate',
          precision: 2,
          position: 'suffix',
          currency: '%', color: 'rgb(239 68 68)',
        },
        {
          name: "代付在途总金额",
          value: 0, key: 'payout_pending_total_amount',
          precision: 2,
          currency: '$',
          color: this.$store.state.settings.theme
        },






      ],
      //代收
      AgencyAccountStatisticsCard: [
        {
          name: "代收成功数",
          value: 0,
          key: 'payin_success_count',
          color: 'rgb(34 197 94)',
          precision: 0
        },
        {
          name: "代收总数",
          value: 0,
          key: 'payin_total_count',
          precision: 0,
          color: this.$store.state.settings.theme
        },

        {
          name: "代收成功金额",
          value: 0,
          key: 'payin_success_amount',
          color: 'rgb(34 197 94)',
          precision: 2,
          currency: '$'
        },
        {
          name: "代收总金额",
          value: 0,
          key: 'payin_total_amount',
          color: this.$store.state.settings.theme,
          precision: 2,
          currency: '$'
        },
        {
          name: "代收在途订单数",
          value: 0,
          key: 'payin_pending_count',
          color: "#E6A23C",
          precision: 0,
        },
        {
          name: "代收在途总金额",
          value: 0,
          key: 'payin_pending_total_amount',
          color: this.$store.state.settings.theme,
          precision: 2,
          currency: '$'
        },
        {
          // (data.payin_success_count / data.payin_total_count).toFixed(2)
          name: "代收成功率",
          value: 0,
          key: 'rate',

          precision: 2,
          position: 'suffix',
          currency: '%', color: 'rgb(239 68 68)',
        },
        {
          name: "代收服务费",
          value: 0,
          key: 'payin_service_amount',

          precision: 2,
          currency: '$', color: this.$store.state.settings.theme
        },



      ],
      //代理商户数据
      AgencyAccountStatisticsOptions: {},
    };
  },
  created() {
    this.$store.state.IndexData.isRepeatRequest = true
    this.InitializeData()
    this.SeekData()
  },
  beforeDestroy() {
    this.$store.state.IndexData.isRepeatRequest = false

  },
  activated() {
    this.$store.state.IndexData.isRepeatRequest = true
    this.SeekData()
  },
  deactivated() {
    this.$store.state.IndexData.isRepeatRequest = false
  },

  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    },
    //模拟数据增加
    addData(res) {
      //代付
      if (this.$store.state.IndexData.SuccessRateOfProxyPaymentX.length >= 30) {
        this.$store.state.IndexData.SuccessRateOfProxyPaymentX.shift();
        this.$store.state.IndexData.SuccessRateOfProxyPaymentY.shift();
        this.$store.state.IndexData.CollectionSuccessRateX.shift();
        this.$store.state.IndexData.CollectionSuccessRateY.shift();
      }
      let currentTime = moment().format("HH:mm:ss");
      // 代付成功率 X 轴去重检查
      if (this.$store.state.IndexData.SuccessRateOfProxyPaymentX[this.$store.state.IndexData.SuccessRateOfProxyPaymentX.length - 1] !== currentTime) {
        this.$store.state.IndexData.SuccessRateOfProxyPaymentX.push(currentTime);
      }

      // 代收成功率 X 轴去重检查
      if (this.$store.state.IndexData.CollectionSuccessRateX[this.$store.state.IndexData.CollectionSuccessRateX.length - 1] !== currentTime) {
        this.$store.state.IndexData.CollectionSuccessRateX.push(currentTime);
      }

      this.$store.state.IndexData.SuccessRateOfProxyPaymentY.push(

        isNaN((res.payout_success_count / res.payout_total_count).toFixed(4)) ? 0.0000 : (res.payout_success_count / res.payout_total_count).toFixed(4)

      );
      this.$refs.SuccessRateOfProxyPayment.update()
      //代收


      this.$store.state.IndexData.CollectionSuccessRateY.push(
        isNaN((res.payin_success_count / res.payin_total_count).toFixed(4)) ? 0.0000 : (res.payin_success_count / res.payin_total_count).toFixed(4)
      );
      this.$refs.MerchantAccountStatistics.update()


    },
    //查询数据
    SeekData() {


      if (!this.$store.state.IndexData.isRepeatRequest) {
        console.log("离开页面，取消递归请求");
        return
      }
      if (this.$store.state.user.roles && this.$store.state.user.roles.includes('admin')) {

        statistics().then((res) => {
          res = res.data;
          this.ProxyStatisticalDataProcessing(res);
          // this.addData(res);
          //代收
          this.AgencyAccountStatistics(res);
          console.log("首页调用了数据请求");

          this.Timer = setTimeout(() => {
            this.SeekData()
          }, 3000);
        }).catch((error) => {

        })
      } else {
        listOrderSuccessRate({
          cycle
            :
            "today",
          mch_list
            :
            [parseInt(this.$store.state.user.name)]
        }).then((res) => {
          console.log(res);

          res = res.data[0];
          this.ProxyStatisticalDataProcessing(res);
          // this.addData(res);
          //代收
          this.AgencyAccountStatistics(res);
          console.log("首页调用了数据请求");
          this.Timer = setTimeout(() => {
            this.SeekData()
          }, 3000);

        }).catch((error) => {

        })

      }


      ;
    },
    //代付数据统计
    ProxyStatisticalDataProcessing(data) {
      for (let index = 0; index < this.PaymentDataStatistics.length; index++) {
        let reslut;
        if (this.PaymentDataStatistics[index].key == 'rate') {
          reslut = (data.payout_success_count / data.payout_total_count) && !isNaN((data.payout_success_count / data.payout_total_count).toFixed(4)) ? (data.payout_success_count / data.payout_total_count).toFixed(4) * 100 : 0

        } else {
          reslut = data[this.PaymentDataStatistics[index].key] ? data[this.PaymentDataStatistics[index].key] : 0
          if (this.PaymentDataStatistics[index].precision == 2) {
            reslut = reslut / 100
          }

        }
        this.$set(this.PaymentDataStatistics[index], 'value', reslut);
      }

    },
    // 代收数据统计
    AgencyAccountStatistics(data) {
      // payin_success_count 当日代收成功数
      // payin_success_amount 当日代收成功金额
      // payin_total_count 当日代收总数
      // payin_total_amount  当日代收总金额
      // payin_pending_count 当日代收在途金额
      // payin_pending_total_amount 当日代收在途总金额
      // payin_service_amount 当日代收服务费
      //小方块数据
      let reslut;
      for (let index = 0; index < this.AgencyAccountStatisticsCard.length; index++) {
        if (this.AgencyAccountStatisticsCard[index].key == 'rate') {

          reslut = (data.payin_success_count / data.payin_total_count).toFixed(4) && !isNaN((data.payin_success_count / data.payin_total_count).toFixed(4)) ? (data.payin_success_count / data.payin_total_count).toFixed(4) * 100 : 0;

        } else {
          reslut = data[this.AgencyAccountStatisticsCard[index].key] ? data[this.AgencyAccountStatisticsCard[index].key] : 0
          if (this.AgencyAccountStatisticsCard[index].precision == 2) {
            reslut = parseInt(reslut / 100)
          }
        }
        if (reslut != this.AgencyAccountStatisticsCard[index].value) {
          this.$set(this.AgencyAccountStatisticsCard[index], 'value', reslut);
        }
      }
    },

    //初始化数据
    InitializeData() {
      let date = this.getHalfHourIntervals()
      this.$store.state.IndexData.SuccessRateOfProxyPaymentX = date;
      this.$store.state.IndexData.SuccessRateOfProxyPaymentY = new Array(15).fill(0);
      this.$store.state.IndexData.CollectionSuccessRateX = date;
      this.$store.state.IndexData.CollectionSuccessRateY = new Array(15).fill(0);
    },
    //获取过去半小时时间段
    getHalfHourIntervals() {
      const timeSlots = [];

      // 获取当前时间
      let currentTime = moment();

      // 获取过去30个半小时时间段
      for (let i = 0; i < 15; i++) {
        // 格式化时间，只保留小时和分钟
        timeSlots.push(currentTime.format("HH:mm:ss"));

        // 减去半小时
        currentTime = currentTime.subtract(1, "minutes");
      }

      return timeSlots;
    },
  },

  components: {
    MerchantAccountStatistics, DailyPaymentDataStatisticsVue
    // MainAccountStatistics,
    // MerchantEndOrderStatistics,
    // ChannelEndOrderStatistics,
  },
};
</script>
<style lang="scss">
.ele-body-card {
  padding: 0;
  // background: rgb(241, 244, 249) ;
  min-height: inherit;
  background: #F8FAFC;
}

.index_card {
  // margin: 0 0 1rem 0;
  padding: 1rem 2rem;


  //旧的
  // margin-bottom: 2rem;
  // box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1) !important;
  // border-radius: 8px !important;
}

.index_card .el-card__header {
  border-bottom: none !important;
  font-size: 18px;
  font-weight: 600;
}

.index_title {
  border-bottom: none !important;
  font-size: 18px;
  font-weight: 600;
  padding: 0 16px;
}

.index_title:first-child {
  padding-top: 16px;
}
</style>
<!--<style scoped lang="scss">-->
<!--.home {-->
<!--  blockquote {-->
<!--    padding: 10px 20px;-->
<!--    margin: 0 0 20px;-->
<!--    font-size: 17.5px;-->
<!--    border-left: 5px solid #eee;-->
<!--  }-->
<!--  hr {-->
<!--    margin-top: 20px;-->
<!--    margin-bottom: 20px;-->
<!--    border: 0;-->
<!--    border-top: 1px solid #eee;-->
<!--  }-->
<!--  .col-item {-->
<!--    margin-bottom: 20px;-->
<!--  }-->

<!--  ul {-->
<!--    padding: 0;-->
<!--    margin: 0;-->
<!--  }-->

<!--  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;-->
<!--  font-size: 13px;-->
<!--  color: #676a6c;-->
<!--  overflow-x: hidden;-->

<!--  ul {-->
<!--    list-style-type: none;-->
<!--  }-->

<!--  h4 {-->
<!--    margin-top: 0px;-->
<!--  }-->

<!--  h2 {-->
<!--    margin-top: 10px;-->
<!--    font-size: 26px;-->
<!--    font-weight: 100;-->
<!--  }-->

<!--  p {-->
<!--    margin-top: 10px;-->

<!--    b {-->
<!--      font-weight: 700;-->
<!--    }-->
<!--  }-->

<!--  .update-log {-->
<!--    ol {-->
<!--      display: block;-->
<!--      list-style-type: decimal;-->
<!--      margin-block-start: 1em;-->
<!--      margin-block-end: 1em;-->
<!--      margin-inline-start: 0;-->
<!--      margin-inline-end: 0;-->
<!--      padding-inline-start: 40px;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
