<template>
  <div class="app-container fulltable_div">

    <!-- 搜索组件和表格容器 -->
    <div class="fulltable_div" style="min-height: auto;flex: 1;padding: 0 8px;" ref="fulltable_div">

      <!-- 搜索组件，包含事件处理 -->
      <mchSubFlowSearchVue :showSearch="showSearch" ref="mchSubFlowSearchVue" @ReturnSearch="ReturnSearch"
        :TabsChangeStatus="queryPage.type" @RequestingDataAgain="RequestingDataAgainMethods">
      </mchSubFlowSearchVue>

      <!-- 动态表格组件，双击单元格内容进行复制 -->
      <dynamicTableVue :loading="loading" :tableData="paginatedItems" @cellDblclick="(row, column, cell, event) => {
        this.$util.copyToClipboard(cell.innerText);
      }" :cellClassName="'HoverTooltipCopy'" ref="myTable" :showSummary="showSummary" :getSummaries="getSummaries">

        <!-- 表格列定义 -->
        <el-table-column label="商户号 " align="center" prop="mch_number" />
        <el-table-column label="商户开始余额 " align="center" prop="mch_start_balance" :formatter="Formatter.TableAmount" />
        <el-table-column label="商户最后余额 " align="center" prop="mch_final_balance" :formatter="Formatter.TableAmount" />
        <el-table-column label="资金变动金额 " align="center" prop="settle_amount" :formatter="Formatter.TableAmount" />
        <el-table-column label="资金变动原因" align="center" prop="msg" :show-overflow-tooltip="true" />
        <el-table-column label="交易类型" align="center" prop="operation" width="250">
          <template slot-scope="scope">
            <el-tag :type="Formatter.statusColorFormatter(0, 0, scope.row.operation)">{{ Formatter.typeFormatter(0, 0,
              scope.row.operation) }}</el-tag>
          </template>

        </el-table-column>
        <el-table-column label="创建者" align="center" prop="operator" />
        <!-- <el-table-column label="流水更新时间" align="center" prop="update_time" :formatter="Formatter.TableTimeSecond" width="160"/> -->
        <el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond"
          width="160" />
      </dynamicTableVue>

      <!-- 分页组件 -->
      <pagination ref="pagination" v-show="pageData.total > 0" :total="pageData.total" :page.sync="pageData.currentPage"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import { listMchAccFlow } from "@/api/excellent/mchAccFlow";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import mchSubFlowSearchVue from './mchSubFlow.vue';

export default {
  name: "mchSubFlow",
  data() {
    return {
      loading: true,
      showSearch: true, // 控制搜索组件显示
      mchSubFlowList: [], // 存储数据
      queryPage: { last_id: null }, // 查询分页数据
      pageData: { currentPage: 1, pageSize: 20, total: 1 }, // 分页相关数据
      showSummary: false, // 是否显示合计行
    };
  },
  computed: {
    // 计算分页后的数据
    paginatedItems() {
      const start = (this.pageData.currentPage - 1) * this.pageData.pageSize;
      const end = this.pageData.currentPage * this.pageData.pageSize;
      return this.mchSubFlowList.slice(start, end);
    },
  },


  methods: {
    // 重置搜索条件
    resetSearch() {
      this.mchSubFlowList = [];
      this.queryPage.last_id = null;
      this.pageData.currentPage = 1;
    },

    // 处理搜索结果返回
    ReturnSearch(Params) {
      this.resetSearch();
      this.getList(Params);
    },

    // 请求新的数据
    RequestingDataAgainMethods(Params) {
      this.getList(Params);
    },

    // 获取列表数据
    getList(queryParams) {
      this.loading = true;
      listMchAccFlow({ ...queryParams, ...this.queryPage }).then((response) => {
        this.queryPage.last_id = response.last_id;
        this.mchSubFlowList = [...this.mchSubFlowList, ...response.results];
        this.pageData.total = this.mchSubFlowList.length;
        this.loading = false;
        this.showSummary = !!queryParams.mch_number;
      });
    },

    // 处理分页切换
    handleCurrentChange(page) {
      this.pageData.currentPage = page.page;
      if (this.pageData.currentPage === Math.ceil(this.pageData.total / this.pageData.pageSize)) {
        this.$refs.mchSubFlowSearchVue.RequestingData();
      }
    },



    // 计算合计行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
        } else if ([4, 5, 6, 7].includes(index)) {
          sums[index] = 'N/A';
        } else {
          const values = data.map(item => Number(item[column.property]));
          sums[index] = values.reduce((prev, curr) => !isNaN(curr) ? prev + curr : prev, 0);
        }
      });
      return sums;
    }
  },
  components: { dynamicTableVue, mchSubFlowSearchVue },
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: inherit;
  padding: 0.5rem;
}
</style>
