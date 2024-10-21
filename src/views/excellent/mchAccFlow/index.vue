<template>
  <div class="app-container fulltable_div">
    <!-- <el-tabs type="card" class="OrderRecords_title" ref="OrderRecordsTitle" @tab-click="TabsChange"
      v-model="queryPage.type">
      <el-tab-pane label="代收流水" name="0"></el-tab-pane>
      <el-tab-pane label="代付流水" name="1"></el-tab-pane>
      <el-tab-pane label="全部流水" name="3"></el-tab-pane>
    </el-tabs> -->
    <div class="fulltable_div" style="min-height: auto;flex: 1;padding: 0 8px;">
      <mchAccFlowSearchVue :showSearch="showSearch" ref="search" @ReturnSearch="ReturnSearch"
        :TabsChangeStatus="queryPage.type" @RequestingDataAgain="RequestingDataAgain"></mchAccFlowSearchVue>
      <dynamicTableVue :loading="loading" :tableData="paginatedItems" @cellDblclick="cellDblclick"
        :cellClassName="' HoverTooltipCopy'" ref="myTable">
        <!-- <el-table-column label="流水号" align="center" prop="_id" width="230" fixed="left" /> -->

        <el-table-column label="商户号 " align="center" prop="mch_number" fixed="left" />
        <el-table-column label="账户初期金额" align="center" prop="mch_start_balance" :formatter="Formatter.TableAmount"
          width="120">

        </el-table-column>
        <el-table-column label="账户末期金额" align="center" prop="mch_final_balance" :formatter="Formatter.TableAmount"
          width="120">


        </el-table-column>

        <el-table-column label="余额变动信息" align="center" prop="operation" :formatter="BalanceChangeInformation"
          show-overflow-tooltip width="270">


        </el-table-column>

        <el-table-column label="订单金额" align="center" prop="amount" :formatter="Formatter.TableAmount">

        </el-table-column>
        <el-table-column label="订单变动金额 " align="center" prop="settle_amount" :formatter="Formatter.TableAmount">
          <template slot-scope="scope">
            <span>{{ NumFormat(scope.row.settle_amount, scope.row.msg) }}</span>
          </template>

        </el-table-column>

        <el-table-column label="资金变动原因" align="center" prop="msg" :show-overflow-tooltip="true" />
        <el-table-column label="资金变动类型" align="center" prop="operation" :formatter="typeFormatter" />
        <el-table-column label="相关订单号" align="center" prop="merchant_order_id" width="210" />
        <el-table-column label="流水更新时间" align="center" prop="update_time" :formatter="Formatter.TableTimeSecond"
          width="180">
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond"
          width="180">
        </el-table-column>
      </dynamicTableVue>
      <pagination ref="pagination" v-show="totalPages > 0" :total="pageData.total" :page.sync="pageData.currentPage"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import { listMchAccFlow, getMchAccFlow, updateMchAccFlow } from "@/api/excellent/mchAccFlow";
import { listMchSetting } from "@/api/excellent/MchSetting";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import mchAccFlowSearchVue from './mchAccFlowSearch.vue';

export default {
  name: "MchAccFlow",

  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      mchAccFlowList: [],
      queryParams: { page: 1, limit: 20, mchNum: null, subjectName: null },
      pageData: { currentPage: 1, pageSize: 20, total: 1 },
      queryPage: { last_id: null },
      form: {},
      ClientSearchList: [],
      ClientSearchLoading: false,
      FirstSearched: true,
      RepeatedRequests: false
    };
  },
  created() {

  },
  computed: {
    paginatedItems() {
      const start = (this.pageData.currentPage - 1) * this.pageData.pageSize;
      const end = this.pageData.currentPage * this.pageData.pageSize;

      return this.mchAccFlowList.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.pageData.total / this.pageData.pageSize);
    },
  },

  methods: {
    //订单变动金额格式化
    NumFormat(value, index) {
      if (index == 'Reduce' || index == 'Frozen') {
        return -(Math.floor(value) / 100).toFixed(2)
      } else if (index == 'Increase' || index == 'Refund') {
        return (Math.floor(value) / 100).toFixed(2)
      } else {
        return (Math.floor(value) / 100).toFixed(2)
      }
    },
    TabsChange(value) {
      if (value.name) {
        this.queryPage.type = null
      } else {
        this.queryPage.type = value.name
      }
      this.$refs.search.resetQuery();
    },
    resetSearch() {
      this.mchAccFlowList.splice(0);
      this.queryPage.last_id = null;
      this.pageData = { currentPage: 1, pageSize: this.pageData.pageSize, total: 1 };
    },
    ReturnSearch(Params) {
      this.loading = true;
      this.resetSearch()

      this.getList(Params);
    },
    RequestingDataAgain(Params) {
      this.loading = true;
      this.getList(Params);
    },
    getList(queryParams) {
      if (this.RepeatedRequests) { this.loading = false; return; }
      this.RepeatedRequests = true;
      this.loading = true;
      let query = { ...queryParams, ...this.queryPage };

      listMchAccFlow(query).then((response) => {
        this.queryPage["last_id"] = response["last_id"];
        response.results = this.$util.deepFreeze(response.results)
        this.mchAccFlowList = [...this.mchAccFlowList, ...response.results];

        this.pageData.total = this.mchAccFlowList.length;
        this.loading = false;
        this.RepeatedRequests = false;
        if (response["last_id"] == '') {
          this.RepeatedRequests = true;
        }
      });
    },
    handleCurrentChange(page) {
      this.pageData.currentPage = page.page;
      this.loading = true;
      this.$refs.myTable.Totop();

      if (this.pageData.currentPage === this.totalPages && this.mchAccFlowList.length < this.pageData.total + 200) {
        this.$refs.search.RequestingDataAgain();
      } else {
        setTimeout(() => {
          this.loading = false;
        }, 380);
      }
    },
    cellDblclick(row, column, cell, event) {
      this.$util.copyToClipboard(cell.innerText);
    },
    typeFormatter(row) {

      if (row.operation == "1") {
        return "待结算余额调整记录";
      }
      else if (row.operation == "2") {
        return "代付余额调整记录";
      }
      else if (row.operation == "3") {
        return "可用余额调整记录";
      } else if (row.operation == "0") {
        return "订单流水记录";
      }
    },
    //余额变动信息格式化
    BalanceChangeInformation(row, column, cellValue, index) {

      if (row.order_type == 1 && row.operation == 0) {
        return "代付可用余额变动（最终与代收余额，代付pending订单金额相加）"
      }
      if (row.order_type == 0 && row.operation == 0) {
        return "代收余额变动（最终与代付可用余额，代付pending订单金额相加）"
      } else {
        return "账户余额变动"
      }
    }
  },
  components: { dynamicTableVue, mchAccFlowSearchVue },
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: inherit;
  padding: 0.5rem 0.5rem 0 0.5rem;
}
</style>
