<template>
  <div class="app-container fulltable_div">
    <!-- 搜索区域 -->
    <div class="fulltable_div" style="min-height: auto;flex: 1;padding: 0 8px;">
      <!-- 搜索组件 -->
      <mchAccFlowSearchVue :showSearch="showSearch" ref="search" @ReturnSearch="ReturnSearch"
        @RequestingDataAgain="RequestingDataAgain" :TypeParameter="queryPage" />

      <!-- 动态表格组件 -->
      <!-- <dynamicTableVue :loading="loading" :tableData="paginatedItems" @cellDblclick="cellDblclick"
        :cellClassName="' HoverTooltipCopy'" ref="myTable">


        <el-table-column label="商户号 " align="center" prop="mch_number" fixed="left" width="80" />

        <el-table-column label="账户初期金额" align="center" prop="mch_start_balance" :formatter="Formatter.TableAmount"
          width="120" />
        <el-table-column label="账户末期金额" align="center" prop="mch_final_balance" :formatter="Formatter.TableAmount"
          width="120" />
        <el-table-column label="余额变动信息" align="center" prop="operation" :formatter="BalanceChangeInformation"
          show-overflow-tooltip width="180" />
        <el-table-column label="订单金额" align="center" prop="amount" :formatter="Formatter.TableAmount" />
        <el-table-column label="订单变动金额" align="center" prop="settle_amount" :formatter="Formatter.TableAmount"
          width="150">
          <template slot-scope="scope">
            <span>{{ NumFormat(scope.row.settle_amount, scope.row.msg) }}</span>
          </template>
</el-table-column>
<el-table-column label="资金变动原因" align="center" prop="msg" show-overflow-tooltip min-width="150" />
<el-table-column label="资金变动类型" align="center" prop="operation" :formatter="Formatter.typeFormatter" width="250">
  <template slot-scope="scope">
            <el-tag :type="Formatter.statusColorFormatter(0, 0, scope.row.operation)">{{ Formatter.typeFormatter(0, 0,
              scope.row.operation) }}</el-tag>
          </template>

</el-table-column>
<el-table-column label="订单号 " align="center" prop="order_id" width="100">
</el-table-column>

<el-table-column label="商户订单号" align="center" prop="merchant_order_id" width="210" show-overflow-tooltip />

<el-table-column label="流水更新时间" align="center" prop="update_time" :formatter="Formatter.TableTimeSecond" width="180" />
<el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond" width="180" />
</dynamicTableVue> -->
      <el-table v-AutoHeight="{
        Ref: 'myTable', Height: 43
      }" v-table-move="['myTable']" :data="paginatedItems" v-loading="loading" ref="myTable" border :height="200"
        row-key="_id" @cell-dblclick="cellDblclick">
        <el-table-column label="商户号 " align="center" prop="mch_number" fixed="left" width="80" />

        <el-table-column label="账户初期金额" align="center" prop="mch_start_balance" :formatter="Formatter.TableAmount"
          width="120" />
        <el-table-column label="账户末期金额" align="center" prop="mch_final_balance" :formatter="Formatter.TableAmount"
          width="120" />
        <el-table-column label="余额变动信息" align="center" prop="operation" :formatter="BalanceChangeInformation"
          show-overflow-tooltip width="180" />
        <el-table-column label="订单金额" align="center" prop="amount" :formatter="Formatter.TableAmount" />
        <el-table-column label="订单变动金额" align="center" prop="settle_amount" :formatter="Formatter.TableAmount"
          width="150">
          <template slot-scope="scope">
            <span>{{ NumFormat(scope.row.settle_amount, scope.row.msg) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="资金变动原因" align="center" prop="msg" show-overflow-tooltip min-width="150" />
        <el-table-column label="资金变动类型" align="center" prop="operation" :formatter="Formatter.typeFormatter"
          width="250">
          <template slot-scope="scope">
            <el-tag :type="Formatter.statusColorFormatter(0, 0, scope.row.operation)">{{ Formatter.typeFormatter(0, 0,
              scope.row.operation) }}</el-tag>
          </template>

        </el-table-column>
        <el-table-column label="订单号 " align="center" prop="order_id" width="100">
        </el-table-column>

        <el-table-column label="商户订单号" align="center" prop="merchant_order_id" width="210" show-overflow-tooltip />

        <el-table-column label="流水更新时间" align="center" prop="update_time" :formatter="Formatter.TableTimeSecond"
          width="180" />
        <el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond"
          width="180" />


      </el-table>

      <!-- 分页组件 -->
      <pagination ref="pagination" v-show="totalPages > 0" :total="pageData.total" :page.sync="pageData.currentPage"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import { listMchAccFlow } from "@/api/excellent/mchAccFlow";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import mchAccFlowSearchVue from './mchAccFlowSearch.vue';

export default {
  name: "MchAccFlow",

  data() {
    return {
      loading: true, // 加载状态
      mchAccFlowList: [], // 商户流水列表
      queryParams: { page: 1, limit: 100 }, // 查询参数
      pageData: { currentPage: 1, pageSize: 100, total: 1 }, // 分页数据
      queryPage: { last_id: null, stream_type: 'total', type: null }, // 查询页面信息
      showSearch: true, // 是否显示搜索
      RepeatedRequests: false // 是否重复请求
    };
  },

  created() {
    // 初始化 stream_type 值
    this.queryPage.stream_type = this.$route.query.stream_type || 'total';
    if (this.$route.query.stream_type) {
      if (this.$route.query.stream_type == 'payin') {
        this.queryPage.type = 0;
      } else if (this.$route.query.stream_type == 'payout') {
        this.queryPage.type = 1;
      }
    } else {
      this.queryPage.type = null;
    }

    // this.queryPage.type = this.$route.query.stream_type ? (this.$route.query.stream_type == 'payin' ? 0 : 1) : null;

  },

  computed: {
    // 分页后的数据
    paginatedItems() {
      const start = (this.pageData.currentPage - 1) * this.pageData.pageSize;
      return this.mchAccFlowList.slice(start, start + this.pageData.pageSize);
    },
    // 总页数计算
    totalPages() {
      return Math.ceil(this.pageData.total / this.pageData.pageSize);
    },
  },

  methods: {
    // 格式化订单变动金额
    NumFormat(value, type) {
      const amount = (Math.floor(value) / 100).toFixed(2);
      return type === 'Reduce' || type === 'Frozen' ? -amount : amount;
    },

    // 重置搜索和查询数据
    resetSearch() {
      this.mchAccFlowList = [];
      this.queryPage.last_id = null;
      this.pageData = { currentPage: 1, pageSize: this.pageData.pageSize, total: 1 };
      this.RepeatedRequests = false;
    },

    // 搜索后处理
    ReturnSearch(Params) {
      this.loading = true;
      this.resetSearch();
      this.getList(Params);
    },

    // 请求新的数据
    RequestingDataAgain(Params) {
      this.loading = true;
      this.getList(Params);
    },

    // 获取商户流水数据
    getList(queryParams) {
      if (this.RepeatedRequests) {
        this.loading = false;
        return;
      }

      const query = { ...this.queryPage, ...queryParams };
      if (this.queryPage.stream_type == 'total') {
        query['order_type'] = queryParams.type;
      } else {
        query['order_type'] = this.queryPage.type
      }
      delete query.type;
      listMchAccFlow(query).then((response) => {
        this.queryPage.last_id = response.last_id;
        this.mchAccFlowList = [...this.mchAccFlowList, ...this.$util.deepFreeze(response.results)];
        this.pageData.total = this.mchAccFlowList.length;
        this.loading = false;
        if (!response.last_id) {
          this.RepeatedRequests = true;
        }
      });
    },

    // 分页切换处理
    handleCurrentChange(page) {
      this.pageData.currentPage = page.page;
      if (this.pageData.currentPage === this.totalPages && this.mchAccFlowList.length < this.pageData.total + 200) {
        this.$refs.search.RequestingDataAgain();
      } else {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }
    },

    // 表格双击复制单元格内容
    cellDblclick(row, column, cell) {
      this.$util.copyToClipboard(cell.innerText);
    },



    // 格式化余额变动信息
    BalanceChangeInformation(row) {
      if (row.order_type === 1 && row.operation === 0) {
        return "代付可用余额变动（与代收余额相加）";
      }
      if (row.order_type === 0 && row.operation === 0) {
        return "代收余额变动（与代付余额相加）";
      }
      return "账户余额变动";
    }
  },

  components: { dynamicTableVue, mchAccFlowSearchVue }
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
