<template>
  <div class="app-container fulltable_div" ref="container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="商户号 " prop="mch_num">
        <MchNumSelect v-model="queryParams.mch_num" @change="handleQuery"></MchNumSelect>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"></right-toolbar> -->
      </el-form-item>
    </el-form>


    <dynamicTableVue :tableData="mchSettlementList" @handleSelectionChange="handleSelectionChange" :loading="loading"
      ref="myTable" @cellDblclick="(row, column, cell, event) => {
        this.$util.copyToClipboard(cell.innerText);
      }" :cellClassName="'HoverTooltipCopy'">

      <el-table-column label="商户号" align="center" prop="mch_num" fixed="left" />
      <!-- <el-table-column label="商户名称" align="center" prop="mch_name" /> -->
      <!-- <el-table-column label="货币代号" align="center" prop="currency" /> -->
      <el-table-column label="账户余额" align="center" prop="account_balance" :formatter="Formatter.TableAmount" />
      <el-table-column label="待结算金额" align="center" prop="account_pending_settlement_balance"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="账户可用余额" align="center" prop="account_available_balance"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="代付余额" align="center" prop="account_payout_balance" :formatter="Formatter.TableAmount" />
      <el-table-column label="代付可用余额" align="center" prop="account_payout_available_balance"
        :formatter="Formatter.TableAmount" />

      <el-table-column label="代付冻结金额" align="center" prop="payou_freeze_amount" :formatter="Formatter.TableAmount" />
      <el-table-column label="代付冻结金额手续费" align="center" prop="payou_freeze_amount_service"
        :formatter="Formatter.TableAmount" />

      <el-table-column label="操作" align="center" class-name="small-padding ">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-warning-outline"
            @click="handleUpdate(scope.row)">详情</el-button>
        </template>
      </el-table-column>


    </dynamicTableVue>

    <pagination ref="pagination" v-show="pageData.total > 0" :total="pageData.total" :page.sync="queryParams.page"
      :limit.sync="queryParams.limit" @pagination="getList" />

    <!-- 详细弹窗 -->

    <DetailedContentVue :DetailedContentShow="DetailedContentShow" :mch_number="DetailedContentNumber"
      @ReturnDetailedContentShow="ReturnDetailedContentShow">
    </DetailedContentVue>

  </div>
</template>

<script>

import { listMchSettlement, getMchSettlementDay, delMchSettlement, addMchSettlement, updateMchSettlement } from "@/api/excellent/FinalSettlement";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";
import DetailedContentVue from "./DetailedContent.vue";


export default {
  name: "MchSettlement",
  filters: {

  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 1,
      // 商户结算表格数据
      mchSettlementList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 当日总代付手续费时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        mch_num: null, // 商户号
        page: 1, // 当前页码
        limit: 20, // 每页显示的条数
      },
      SearchIndex: -1, //搜索数据索引

      last_id: null,
      pageData: {

        total: 1, // 数据总条数
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      height: 0,
      // 详情
      DetailedContentShow: false,
      DetailedContentNumber: 0
    };
  },

  created() {

  },
  mounted() {
    this.getList();
  },
  methods: {
    /** 查询商户结算列表 */
    getList() {
      this.loading = true;
      let query = { ...this.queryParams };
      listMchSettlement(query).then((response) => {

        this.mchSettlementList = response.rows;
        this.pageData.total = response.total;
        this.loading = false;
      });

    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        mchId: null,
        mchNum: null,
        currency: null,
        mchName: null,
        payinSettledAmout: null,
        payinUnsettledAmout: null,
        payoutSettledAmout: null,
        whilePayoutAmout: null,
        totalFundAdjustment: null,
        totalPayinFee: null,
        totalPayoutFee: null,
        dayPayinSettledAmout: null,
        dayPayoutSettledAmout: null,
        dayFundAdjustment: null,
        dayPayinFee: null,
        dayPayoutFee: null,
        createTime: null
      };
      this.resetForm("form");
    },
    // handleChange(value) {
    //   console.log(value);

    //   this.queryParams.mchNum = value
    //   this.handleQuery()
    // },
    /** 搜索按钮操作 */
    handleQuery() {

      this.pageData.page = 1;
      this.mchSettlementList.splice(0)
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeCreateTime = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加商户结算";
    },


    /** 详情按钮操作 */
    handleUpdate(row) {
      this.DetailedContentShow = true
      this.DetailedContentListLoading = true
      this.DetailedContentNumber = row.mch_num

    },
    ReturnDetailedContentShow(value) {
      this.DetailedContentShow = value
    },
    formatDate(date) {
      date = new Date(date.replace(' ', 'T'))

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMchSettlement(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMchSettlement(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除商户结算编号为"' + ids + '"的数据项？').then(function () {
        return delMchSettlement(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/mchSettlement/export', {
        ...this.queryParams
      }, `mchSettlement_${new Date().getTime()}.xlsx`)
    }
  },
  components: {
    DetailedContentVue,
    dynamicTableVue, MchNumSelect,
  },
};
</script>
<style lang="scss" scoped>
.DetailForm {
  ::v-deep .el-form-item__label {}
}

.DetailForm ::v-deep .el-form-item__label {
  font-size: 16px;
  font-weight: bold;
  color: #000
}
</style>
