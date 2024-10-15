<template>
  <div class="app-container fulltable_div">

    <div class="fulltable_div" style="min-height: auto;flex: 1;padding: 0 8px;">
      <mchSubFlowSearchVue :showSearch="showSearch" ref="mchSubFlowSearchVue" @ReturnSearch="ReturnSearch"
        :TabsChangeStatus="queryPage.type" @RequestingDataAgain="RequestingDataAgainMethods"></mchSubFlowSearchVue>
      <dynamicTableVue :loading="loading" :tableData="paginatedItems" @cellDblclick="cellDblclick" ref="myTable">
        <el-table-column label="商户号 " align="center" prop="mch_number" />
        <el-table-column label="商户开始余额 " align="center" prop="mch_start_balance" :formatter="Formatter.TableAmount">



        </el-table-column>
        <el-table-column label="商户最后余额 " align="center" prop="mch_final_balance" :formatter="Formatter.TableAmount">



        </el-table-column>
        <el-table-column label="资金变动金额 " align="center" prop="settle_amount" :formatter="Formatter.TableAmount">



        </el-table-column>
        <el-table-column label="资金变动原因" align="center" prop="msg" :show-overflow-tooltip="true" />
        <el-table-column label="交易类型" align="center" prop="operation" :formatter="typeFormatter" />
        <el-table-column label="创建者" align="center" prop="operator" />
        <!-- <el-table-column label="流水更新时间" align="center" prop="update_time" :formatter="Formatter.TableTimeSecond"
          width="160">

        </el-table-column> -->
        <el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond"
          width="160">
        </el-table-column>
      </dynamicTableVue>
      <pagination ref="pagination" v-show="pageData.total > 0" :total="pageData.total" :page.sync="pageData.currentPage"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import { listMchAccFlow, } from "@/api/excellent/mchAccFlow";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import mchSubFlowSearchVue from './mchSubFlow.vue';

export default {
  name: "mchSubFlow",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      mchSubFlowList: [],
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
      return this.mchSubFlowList.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.pageData.total / this.pageData.pageSize);
    },
  },
  methods: {
    TabsChange(value) {
      this.$refs.mchSubFlowSearchVue.resetQuery();
    },
    resetSearch() {
      this.mchSubFlowList.splice(0);
      this.queryPage.last_id = null;
      this.pageData = { currentPage: 1, pageSize: this.pageData.pageSize, total: 1 };
    },
    ReturnSearch(Params) {
      this.loading = true;
      this.resetSearch()

      this.getList(Params);
    },
    RequestingDataAgainMethods(Params) {
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
        this.mchSubFlowList = [...this.mchSubFlowList, ...response.results];
        this.pageData.total = this.mchSubFlowList.length;
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

      if (this.pageData.currentPage === this.totalPages && this.mchSubFlowList.length < this.pageData.total + 200) {
        this.$refs.mchSubFlowSearchVue.RequestingData()
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
      }
    },


  },
  components: { dynamicTableVue, mchSubFlowSearchVue },
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
