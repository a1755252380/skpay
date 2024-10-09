<template>
  <el-row :gutter="20">
    <!-- <el-col :md="16" :sm="16" :xs="24">
      <SuccessRateOfProxyPayment ref="SuccessRateOfProxyPayment" :id="'MerchantAccountStatistics' + index" :styles="{
        height: '28rem',
        padding: '1rem 0',
      }"></SuccessRateOfProxyPayment>
    </el-col> -->
    <el-col :md="6" :sm="6" :xs="12" class="card-col" v-for="(item, index) in CardData" :key="index">

      <NumCard :name="item.name" :value="item.value" :key="item.key" :precision="item.precision"
        :currency="item.currency" :position="item.position ? item.position : 'prefix'" :color="item.color"></NumCard>

    </el-col>
  </el-row>
</template>

<script>
import NumCard from "../../components/Excellent/index/NumCard.vue";
import SuccessRateOfProxyPayment from "./line/SuccessRateOfProxyPayment.vue";
export default {
  name: "WorkspaceJsonSuccessRateOfProxyPayment",
  props: {
    CardData: {
      type: Array,

    },

    LineLink: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      CardShow: [],
      index: parseInt(Math.random() * 1000),

    };
  },

  mounted() { },
  beforeDestroy() {

  },
  created() {


  },

  methods: {


    update() {
      this.$refs.SuccessRateOfProxyPayment.UpdateEchart();
    },
    //获取过去半小时时间段
    getHalfHourIntervals() {
      const timeSlots = [];

      // 获取当前时间
      let currentTime = moment();

      // 获取过去30个半小时时间段
      for (let i = 0; i < 30; i++) {
        // 格式化时间，只保留小时和分钟
        timeSlots.push(currentTime.format("HH:mm:ss"));

        // 减去半小时
        currentTime = currentTime.subtract(1, "minutes");
      }

      return timeSlots;
    },


  },
  components: { SuccessRateOfProxyPayment, NumCard },
};
</script>
<style lang="scss" scoped>
.card-col {}
</style>
