<template>
  <div class="app-container fulltable_div">
    <div class="FlexBetween" ref="search">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
        <el-form-item label="统计时间（分钟）" prop="StatisticalTime">
          <el-select v-model="queryParams.StatisticalTime" placeholder="请选择统计时间">
            <el-option v-for="item in StatisticalTimeOptions" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="getList">查询</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <dynamicTableVue :loading="loading" :tableData="OrderSuccessRateListSort" :cellClassName="'HoverTooltipCopy'"
      @cellDblclick="cellDblclick">
      <el-table-column prop="mch_number" label="商户号" align="center">

      </el-table-column>
      <el-table-column prop="payin_success_rate" label="代收成功率" align="center" class-name="rate_show"
        :formatter="Formatter.TableRate">

      </el-table-column>
      <el-table-column prop="payin_success_service_charge" label="代收成功手续费" align="center"
        :formatter="Formatter.TableAmount">

      </el-table-column>
      <el-table-column prop="payin_success_count" label="代收成功订单总数" align="center">

      </el-table-column>
      <el-table-column prop="payin_success_amount" label="代收成功订单总额" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>

      <el-table-column prop="payin_total_count" label="代收订单总数" align="center">

      </el-table-column>

      <el-table-column prop="payin_total_amount" label="代收总金额" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>



      <el-table-column prop="payout_success_rate" label="代付成功率" align="center" class-name="rate_show"
        :formatter="Formatter.TableRate">

      </el-table-column>
      <el-table-column prop="payout_success_service_charge" label="代付成功手续费" align="center"
        :formatter="Formatter.TableAmount">

      </el-table-column>
      <el-table-column prop="payout_success_count" label="代付成功订单总数" align="center">

      </el-table-column>
      <el-table-column prop="payout_total_amount" label="代付成功订单总额" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>

      <el-table-column prop="payout_total_count" label="代付订单总数" align="center">

      </el-table-column>
      <el-table-column prop="payout_total_amount" label="代付总金额" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>
      <el-table-column prop="payout_pending_amount_count" label="代付在途金额
" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>
      <el-table-column prop="payout_pending_count" label="代付在途金额总数" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>
    </dynamicTableVue>
  </div>
</template>

<script>
import { listOrderSuccessRate } from "@/api/excellent/OrderSuccessRate";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import { listMchAccConfig } from "@/api/excellent/mchAccConfig";
export default {
  name: "OrderSuccessRate",
  components: { dynamicTableVue },
  data() {
    return {
      loading: false,
      showSearch: true,
      queryParams: { StatisticalTime: "five" },
      StatisticalTimeOptions: [
        { label: "5分钟", value: "five" },
        { label: "10分钟", value: "ten" },
        { label: "30分钟", value: "thirty" },
        { label: "全部", value: "today" },
      ],
      OrderSuccessRateList: [],
      OrderSuccessRateListSort: [],
      mch_list: [],
    };
  },
  filters: {

  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.fetchMchSettings();
  },
  methods: {
    fetchMchSettings() {
      listMchAccConfig().then((res) => {
        this.mch_list = res.rows.map((item) => item.mch_num);
        for (let index = 0; index < this.mch_list.length; index++) {
          this.OrderSuccessRateList.push({
            mch_number: this.mch_list[index],
            payin_success_amount: 0,
            payin_success_count: 0,
            payin_success_rate: 0,
            payin_total_amount: 0,
            payin_total_count: 0,
            payout_success_amount: 0,
            payout_success_count: 0,
            payout_success_rate: 0,
            payout_total_amount: 0,
            payout_total_count: 0,
          });
        }
        this.getList();
      });
    },
    getList() {
      this.loading = true;
      const query = {
        mch_list: this.mch_list,
        cycle: this.queryParams.StatisticalTime,
      };
      listOrderSuccessRate(query).then((response) => {
        // this.OrderSuccessRateList = response.data;
        for (let index = 0; index < response.data.length; index++) {
          this.$set(
            this.OrderSuccessRateList,
            this.OrderSuccessRateList.findIndex((res) => {
              return response.data[index].mch_number === res.mch_number;
            }),
            response.data[index]
          );
        }
        this.handleSort().then(() => {
          this.loading = false;

        })
      });
    },
    resetQuery() {
      this.queryParams.StatisticalTime = "today";
      this.getList();
    },
    FormatAmount(value) {
      return (value / 100).toFixed(2);
    },
    FormatRate(value) {
      return value.toFixed(2) + "%";
    },
    async handleSort() {

      // 根据列名和排序顺序进行排序
      this.OrderSuccessRateListSort = await [...this.OrderSuccessRateList].sort((a, b) => {
        if (a.payin_total_count == '0' && b.payin_total_count == '0') {
          return b.payout_total_count - a.payout_total_count;
        } else if (a.payin_total_count == '0') {
          return 1;
        } else if (b.payin_total_count == '0') {
          return -1;
        } else {
          return b.payin_total_count - a.payin_total_count;
        }
      });
    },
    cellDblclick(row, column, cell, event) {
      this.$util.copyToClipboard(cell.innerText);
    }
  },
};
</script>
<style lang="scss">
.rate_show {
  background: rgb(186, 231, 255);
  color: #000;
  font-size: 16px;
  font-weight: 600;
  // border-bottom: 1px solid #000 !important;
  // border-right: 1px solid #000 !important;
  // border-top: 1px solid #000 !important;
  // border-left: 1px solid #000 !important;
}

.el-table .el-table__body tr:hover .rate_show {
  background: rgb(186, 231, 255) !important;
  color: #000;
}
</style>
