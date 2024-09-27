<template>
  <el-row :gutter="20">

    <el-col :md="16" :sm="16" :xs="24">
      <CollectionSuccessRateLine ref="CollectionSuccessRate" :id="'MerchantAccountStatistics' + index" :styles="{
        height: '28rem',
        padding: '1rem 0',
      }"></CollectionSuccessRateLine>
    </el-col>
    <el-col :md="4" :sm="4" :xs="12" v-for="(item, index) in CardData" :key="index" class="card-col ">
      <NumCard :name="item.name" :value="item.value" :color="item.color" :key="item.key" :precision="item.precision"
        :currency="item.currency" :position="item.position ? item.position : 'prefix'">
      </NumCard>
    </el-col>
  </el-row>
</template>

<script>
import NumCard from "../../components/Excellent/index/NumCard.vue";
import CollectionSuccessRateLine from "./line/CollectionSuccessRateLine.vue";
import moment from "moment";
export default {
  name: "WorkspaceJsonMerchantAccountStatistics",
  props: {
    CardData: {
      type: Array,
      default: [
        {
          name: "当日代收成功数",
          value: 0,
        },
        {
          name: "当日代收总数",
          value: 0,
        },
        {
          name: "当日代收成功金额",
          value: 0,
        },

        {
          name: "当日代收总金额",
          value: 0,
        },
        {
          name: "当日代收在途金额",
          value: 0,
        },
        {
          name: "当日代收在途总金额",
          value: 0,
        },
        {
          name: "当日代收服务费",
          value: 0,
        },
        {
          name: "代收成功率",
          value: "0",
        },
      ],
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

      //商户账户统计

    };
  },

  mounted() { },

  created() {



  },

  methods: {


    update() {
      this.$refs.CollectionSuccessRate.UpdateEchart();
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
  components: { CollectionSuccessRateLine, NumCard },
};
</script>
<style lang="scss" scoped></style>
