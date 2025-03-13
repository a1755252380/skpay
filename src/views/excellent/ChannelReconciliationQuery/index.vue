<template>
  <div class="app-container fulltable_div" ref="container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="90px"
      :label-position="'top'">

      <el-form-item label="通道名" prop="mch_num">
        <ChannelQuery v-model="queryParams.chnl_id"></ChannelQuery>
      </el-form-item>
      <el-form-item label="订单类型" prop="mch_num">
        <el-select v-model="queryParams.order_type" placeholder="请选择订单类型">

          <el-option label="代收" :value="0"></el-option>
          <el-option label="代付" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间类型" prop="mch_num">
        <el-select v-model="queryParams.time_type">

          <el-option label="创建时间" :value="0"></el-option>
          <el-option label="更新时间" :value="1"></el-option>

        </el-select>
      </el-form-item>
      <el-form-item label="查询时间" prop="mch_num">

        <TimeFrameVue v-model="create_time" @parseTime="parseTime" :picker-options="pickerOptions">
        </TimeFrameVue>
      </el-form-item>

      <el-form-item label="操作" class="NoShowLabel">
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getList">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-table v-AutoHeight="{
      Ref: 'myTable',
    }" :data="ResultList" v-loading="loading" :class="!ReadyRequest ? 'SettlementForm' : ''" :empty-text="!ReadyRequest ? '请先选择通道名称以及时间范围再进行查询' : '暂无数据'
      " ref="myTable" border :highlight-selection-row="true" :height="200">
      <!-- :default-sort="{ order: 'descending', prop: 'unsettled_amount' }"  -->

      <!-- <el-table-column label="通道名称" align="center" prop="chnl_id" /> -->
      <el-table-column label="成功订单数" align="center" prop="count" />
      <el-table-column label="成功总金额" align="center" prop="total_amount" :formatter="Formatter.TableAmount" />



    </el-table>

  </div>
</template>

<script>
import { DynamicQueryChannel } from "@/api/excellent/chnlSetting";
import ChannelQuery from "@/components/Excellent/Channel/ChannelQuery.vue";
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';
import moment from "moment";
export default {
  data() {
    return {
      //请求参数
      queryParams: {
        order_type: 0,
        chnl_id: null,
        time_type: 0,
        start_time: null,
        end_time: null,

      },
      create_time: [],
      loading: false,
      ResultList: [],

      pickerOptions: {
        disabledDate(time) {
          const now = moment(); // 当前时间
          const todayStart = now.clone().startOf("day"); // 今天 00:00:00
          const pastWeekStart = todayStart.clone().subtract(7, "days"); // 7 天前 00:00:00
          const tomorrowStart = todayStart.clone().add(1, "days"); // 明天 00:00:00（14 号）

          // 允许选择范围：过去 7 天的 00:00:00 ~ 明天（14 号）的 00:00:00
          return moment(time).isBefore(pastWeekStart) || moment(time).isAfter(tomorrowStart);
        },
        disabledTime(selectedDate) {
          const selectedMoment = moment(selectedDate);
          const tomorrowStart = moment().startOf("day").add(1, "days"); // 明天 00:00:00（14 号）

          // **核心逻辑：禁用时分秒的选择下拉框**
          if (selectedMoment.isSame(tomorrowStart, "day")) {
            return {
              disabledHours: () => Array.from({ length: 24 }, (_, i) => (i === 0 ? [] : i)), // 仅允许 0 点
              disabledMinutes: () => Array.from({ length: 60 }, (_, i) => (i === 0 ? [] : i)), // 仅允许 00 分
              disabledSeconds: () => Array.from({ length: 60 }, (_, i) => (i === 0 ? [] : i)), // 仅允许 00 秒
            };
          }

          // 其他日期不禁用任何时间
          return { disabledHours: () => [], disabledMinutes: () => [], disabledSeconds: () => [] };
        }
      }
    }
  },
  created() {
  },
  computed: {
    ReadyRequest() {
      return this.queryParams.start_time && this.queryParams.end_time && this.queryParams.chnl_id;
    }
  },
  methods: {
    getList() {
      if (this.queryParams.start_time === null || this.queryParams.end_time === null || this.queryParams.chnl_id === null) {
        return this.$message.warning('请先选择通道名称以及时间范围再进行查询');
      }
      this.loading = true;
      DynamicQueryChannel(this.queryParams).then(res => {
        this.ResultList = (res.results == null ? [] : res.results);
        this.loading = false;
      })
    },
    resetQuery() {
      this.create_time = [];
      this.queryParams = {
        order_type: 0,
        chnl_id: null,
        time_type: 0,
        start_time: null,
      }
    },
    handleQuery() {
    },
    parseTime(value, index) {

      let utcTimeBegin = value[0];
      let utcTimeEnd = value[1];
      this.$set(this.queryParams, 'start_time', utcTimeBegin);
      this.$set(this.queryParams, 'end_time', utcTimeEnd);
    },
  },
  components: {
    ChannelQuery, TimeFrameVue
  }
}
</script>
<style lang="scss" scoped>
.DetailForm {}

.DetailForm ::v-deep .el-form-item__label {
  font-size: 16px;
  font-weight: bold;
  color: #000
}



// ::v-deep .el-table__header .el-table-column--selection {
//   .cell {
//     display: none;
//   }
// }


::v-deep .hover-row,
::v-deep .hover-row>td.el-table__cell {
  background: transparent !important;
}

::v-deep .el-table__row--level-1,
::v-deep .el-table__row--level-1.hover-row>td.el-table__cell,
::v-deep .el-table__row--level-1.hover-row {
  background: #f5f7fa !important;
}

.big_text {
  color: #000;
  font-size: 17px;
  font-weight: 600;
}
</style>
