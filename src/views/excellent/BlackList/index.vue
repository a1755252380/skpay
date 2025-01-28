<template>
  <div class="app-container fulltable_div">
    <el-dialog title="添加黑名单" :visible.sync="showAddBlack" width="30%" :close-on-click-modal="false" size="small"
      :before-close="CloseAddBlack">
      <el-form :model="addBlackForm" ref="addBlackForm" label-width="100px" :label-position="'top'">
        <el-form-item label="设备号" prop="device_number">
          <el-input v-model="addBlackForm.device_number" placeholder="请输入设备号"></el-input>
        </el-form-item>
        <el-form-item label="ip地址" prop="ip">
          <el-input v-model="addBlackForm.ip" placeholder="请输入ip地址"></el-input>
        </el-form-item>
        <el-form-item label="银行账户acc" prop="user_bank_acct">
          <el-input v-model="addBlackForm.user_bank_acct" placeholder="请输入银行账户acc"></el-input>
        </el-form-item>
        <el-form-item label="UPI_ID" prop="upi_id">
          <el-input v-model="addBlackForm.upi_id" placeholder="请输入UPI_ID"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="CloseAddBlack" size="small">取 消</el-button>
        <el-button type="primary" @click="confirmAddBlack" size="small">确 定</el-button>

      </div>
    </el-dialog>
    <BatchAddBlack v-model="showBatchAddBlack"></BatchAddBlack>
    <!-- 搜索区域 -->
    <div class="fulltable_div" style="min-height: auto;flex: 1;padding: 0 8px;">
      <!-- 搜索组件 -->
      <mchAccFlowSearchVue :showSearch="showSearch" ref="search" @ReturnSearch="ReturnSearch"
        @RequestingDataAgain="RequestingDataAgain" :TypeParameter="queryPage">
        <template #search>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="AddBlack" plain>添加黑名单</el-button>
          <el-button type="primary" icon="el-icon-document-add" size="mini" @click="BatchBlack"
            plain>批量添加黑名单</el-button>

        </template>
      </mchAccFlowSearchVue>

      <!-- 动态表格组件 -->
      <!-- @cellDblclick="cellDblclick"
      :cellClassName="' HoverTooltipCopy'" -->
      <dynamicTableVue :loading="loading" :tableData="paginatedItems" ref="myTable" @cellDblclick="cellDblclick">

        <!-- 表格列配置 -->
        <el-table-column label="设备号 " align="center" prop="device_number" fixed="left" />
        <el-table-column label="ip地址段" align="center" prop="ip_segment" />
        <el-table-column label="银行账户acc" align="center" prop="user_bank_acct" />
        <el-table-column label="UPI_ID" align="center" prop="upi_id" />
        <el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond" />
        <el-table-column label="操作" align="center" prop="amount" width="150">
          <template slot-scope="scope">
            <el-button type="danger " size="small" round @click="removeBlack(scope.row)">移出黑名单</el-button>
          </template>

        </el-table-column>

      </dynamicTableVue>

      <!-- 分页组件 -->
      <pagination ref="pagination" v-show="totalPages > 0" :total="pageData.total" :page.sync="pageData.currentPage"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import { listUser, RemoveBlacklist, addBlacklistUser } from "@/api/excellent/Personnel";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import mchAccFlowSearchVue from './BlackListSearch.vue';
import BatchAddBlack from "./BatchAddBlack.vue";

export default {
  name: "BlackList",

  data() {
    return {
      //批量添加黑名单
      showBatchAddBlack: false,
      //单个添加黑名单
      addBlackForm: {
        device_number: null,
        ip: null,
        user_bank_acct: null,
        upi_id: null,
      },
      showAddBlack: false,
      loading: true, // 加载状态
      mchAccFlowList: [], // 商户流水列表
      queryParams: { page: 1, limit: 20 }, // 查询参数
      pageData: { currentPage: 1, pageSize: 20, total: 1 }, // 分页数据
      queryPage: { last_id: null, }, // 查询页面信息
      showSearch: true, // 是否显示搜索
      RepeatedRequests: false // 是否重复请求
    };
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
    //添加黑名单
    CloseAddBlack() {
      this.addBlackForm = {
        device_number: null,
        ip: null,
        user_bank_acct: null,
        upi_id: null,
      }
      this.showAddBlack = false;
    },
    AddBlack() {
      this.showAddBlack = true;
    },
    //检测upi_id是否合法
    checkUPI() {

      const upiIdRegex = /^.+\@.+/;
      if (!upiIdRegex.test(this.addBlackForm.upi_id)) {
        this.$message.error('UPI_ID 格式不正确,正确格式应为***@***');
        return false;
      } else {
        return true
      }
    },
    //提交添加黑名单
    confirmAddBlack() {
      const OnjectNotNull = Object.values(this.addBlackForm).some(
        value => value !== null && value !== undefined && value !== '' && !Number.isNaN(value)
      );
      if (!OnjectNotNull) {
        this.$message.error('请确保有一选项不为空！');
        return;
      }
      if ((this.addBlackForm.upi_id)) {
        if (!this.checkUPI()) {
          return
        }

      }
      for (const key in this.addBlackForm) {
        if (typeof this.addBlackForm[key] === 'string') {
          this.addBlackForm[key] = this.addBlackForm[key].replace(/\s+/g, '');
        }
      }
      const fullLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'

      })
      addBlacklistUser([
        {
          ...this.addBlackForm
        }
      ]).then(res => {

        this.CloseAddBlack();
        fullLoading.close();
        if (res.success_orders) {
          this.$message.success('添加成功');
          this.resetSearch()
          this.$refs.search.RequestingDataAgain();

        } else {
          if (res.failed_orders[0].error == 1) {
            this.$message.error('记录不存在，请勿添加');

          }
          else if (res.failed_orders[0].error == 2) {
            this.$message.warning('记录重复添加，请重新确认');

          }
          else {
            this.$message.error('添加失败');

          }
        }
      })

    },
    //批量添加黑名单
    BatchBlack() { this.showBatchAddBlack = true; },
    //移出黑名单
    removeBlack(row) {
      this.$confirm('确定要移除黑名单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        RemoveBlacklist(row._id).then(res => {
          this.$message.success('移除成功');
          this.resetSearch()
          this.$refs.search.RequestingDataAgain();
        })
      }).catch(() => {
        this.$message.info('已取消');
      })
    },
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
      listUser(query).then((response) => {
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

    // 格式化操作类型
    typeFormatter(row) {
      const types = {
        "1": "账户待结算余额变动",
        "2": "账户代付可用余额变动",
        "3": "账户可用余额变动",
        "0": "订单流水记录"
      };
      return types[row.operation] || "未知操作类型";
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

  components: { dynamicTableVue, mchAccFlowSearchVue, BatchAddBlack }
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: inherit;
  padding: 0.5rem;
}

::v-deep .el-dialog__body {
  padding: 10px 20px;
}
</style>
