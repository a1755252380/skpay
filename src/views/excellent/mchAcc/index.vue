<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商户号" prop="mch_num">
        <MchNumSelect v-model="queryParams.mch_num" @change="handleQuery"></MchNumSelect>

      </el-form-item>
      <el-form-item label="商户名称" prop="mch_name">
        <mchNameVue v-model="queryParams.mch_name" @change="handleQuery"></mchNameVue>
      </el-form-item>
      <el-form-item label="货币代号" prop="currency">
        <el-input v-model="queryParams.currency" placeholder="请输入货币代号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"></right-toolbar>
      </el-form-item>
    </el-form>
    <div class="CalculationFormula" v-if="hasPermiVisible(['excellent:mchAcc:edit'])">
      <strong>账户余额=待结算金额+账户可用余额+代付余额</strong>
      <strong>代付余额=代付可用余额+代付冻结金额</strong>
      <strong>商户下发使用可用余额调整</strong>
    </div>
    <dynamicTableVue :loading="loading" :tableData="mchAccList" @cellDblclick="(row, column, cell, event) => {
      this.$util.copyToClipboard(cell.innerText);
    }" :cellClassName="'HoverTooltipCopy'">
      <!--      <el-table-column label="商户id" align="center" prop="mchId" />-->
      <el-table-column label="商户号" align="center" prop="mch_num" fixed="left" />
      <el-table-column label="商户名称" align="center" prop="mch_name" />
      <el-table-column label="货币代号" align="center" prop="currency" />
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

      <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width"
        v-if="hasPermiVisible(['excellent:mchAcc:edit'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleUpdate2(scope.row)"
            v-hasPermi="['excellent:mchAcc:edit']">调整</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['excellent:mchAcc:edit']"
            >查看</el-button
          > -->
        </template>
      </el-table-column>
    </dynamicTableVue>

    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.page"
      :limit.sync="queryParams.limit" @pagination="getList" />

    <!-- 添加或修改商户账户总金额对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="Breakdown-el-form"
        label-position="top">
        <!--        <el-form-item label="商户id" prop="mchId">-->
        <!--          <el-input v-model="form.mchId" placeholder="请输入商户id" />-->
        <!--        </el-form-item>-->
        <el-form-item label="商户号" prop="mch_num">
          <el-input v-model="form.mch_num" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="商户名称" prop="mch_name">
          <el-input v-model="form.mch_name" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="货币代号" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入货币代号" />
        </el-form-item>
        <el-form-item label="账户余额" prop="account_balance">
          <el-input v-model="form.account_balance" placeholder="请输入账户余额" />
        </el-form-item>
        <el-form-item label="账户可用余额" prop="accountAvailableBalance">
          <el-input v-model="form.accountAvailableBalance" placeholder="请输入账户可用余额" />
        </el-form-item>
        <el-form-item label="当日代收" prop="dayPayin">
          <el-input v-model="form.dayPayin" placeholder="请输入当日代收" />
        </el-form-item>
        <el-form-item label="当日代付" prop="dayPayout">
          <el-input v-model="form.dayPayout" placeholder="请输入当日代付" />
        </el-form-item>
        <el-form-item label="已结算代收金额" prop="payinSettledAmout">
          <el-input v-model="form.payinSettledAmout" placeholder="请输入已结算代收金额" />
        </el-form-item>
        <el-form-item label="未结算代收金额" prop="payinUnsettledAmout">
          <el-input v-model="form.payinUnsettledAmout" placeholder="请输入未结算代收金额" />
        </el-form-item>
        <el-form-item label="代付金额" prop="payoutAmout">
          <el-input v-model="form.payoutAmout" placeholder="请输入代付金额" />
        </el-form-item>
        <el-form-item label="代付余额" prop="account_payout_balance">
          <el-input v-model="form.account_payout_balance" placeholder="请输入代付余额" />
        </el-form-item>
        <el-form-item label="资金调整" prop="fundAdjustment">
          <el-input v-model="form.fundAdjustment" placeholder="请输入资金调整" />
        </el-form-item>
        <el-form-item label="冻结金额" prop="freezeAmount">
          <el-input v-model="form.freezeAmount" placeholder="请输入冻结金额" />
        </el-form-item>
        <el-form-item label="代付可用余额" prop="account_payout_available_balance">
          <el-input v-model="form.account_payout_available_balance" placeholder="代付可用余额" />
        </el-form-item>
        <el-form-item label="待结算余额" prop="account_pending_settlement_balance">
          <el-input v-model="form.account_pending_settlement_balance" placeholder="待结算余额" />
        </el-form-item>
        <el-form-item label="代付回退金额" prop="payoutRollbackAmout">
          <el-input v-model="form.payoutRollbackAmout" placeholder="请输入代付回退金额" />
        </el-form-item>
        <el-form-item label="代付手续费" prop="payoutFee">
          <el-input v-model="form.payoutFee" placeholder="请输入代付手续费" />
        </el-form-item>
        <el-form-item label="代付冻结金额" prop="payou_freeze_amount">
          <el-input v-model="form.payou_freeze_amount" placeholder="请输入代付冻结金额" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 金额调整 -->
    <AdjustmentsToFunds :show="AdjustmentsToFundsShow" :Change="form" @CloseAdjustmentsToFunds="CloseAdjustmentsToFunds"
      @UpdateAdjustmentsToFunds="UpdateAdjustmentsToFunds">
    </AdjustmentsToFunds>
  </div>
</template>

<script>
import {
  listMchAcc,
  getMchAcc,
  delMchAcc,
  addMchAcc,
  updateMchAcc,
} from "@/api/excellent/mchAcc";
import { listMchSetting } from "@/api/excellent/MchSetting";
import AdjustmentsToFunds from "./AdjustmentsToFunds.vue";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";
import mchNameVue from '@/components/Excellent/Mch/mchName.vue';

export default {
  name: "MchAcc",
  components: { AdjustmentsToFunds, dynamicTableVue, MchNumSelect, mchNameVue },
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
      // 商户账户总金额表格数据
      mchAccList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 删除标志 0.正常 1.删除时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        page: 1,
        limit: 20,
        mch_num: null,
        mch_name: null,
        currency: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        mch_num: [
          { required: true, message: "商户号不能为空", trigger: "blur" },
        ],
        mch_name: [
          { required: true, message: "商户名称不能为空", trigger: "blur" },
        ],
      },
      AdjustmentsToFundsShow: false,

      //客户搜索列表
      ClientSearchList: [],
      ClientSearchLoading: false,
      FirstSearched: true,
    };
  },
  created() {
    this.getList();
    this.mch_numSearch();
  },
  methods: {
    ClientSearchListChange(value) {
      this.queryParams.mch_num = value.mch_num;
      this.handleQuery();
    },
    /** 查询商户账户总金额列表 */
    getList() {
      this.loading = true;

      listMchAcc(this.queryParams).then((response) => {
        this.mchAccList = response.rows;
        this.total = response.total;
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
        mch_num: null,
        mch_name: null,
        currency: null,
        account_balance: null,
        accountAvailableBalance: null,
        dayPayin: null,
        dayPayout: null,
        payinSettledAmout: null,
        payinUnsettledAmout: null,
        payoutAmout: null,
        account_payout_balance: null,
        fundAdjustment: null,
        freezeAmount: null,
        account_payout_available_balance: null,
        account_pending_settlement_balance: null,
        payoutRollbackAmout: null,
        payoutFee: null,
        payou_freeze_amount: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;

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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加商户账户总金额";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.mchId || this.ids;
      getMchAcc(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改商户账户总金额";
      });
    },
    handleUpdate2(row) {
      this.reset();
      const id = row.mch_num || this.ids;
      getMchAcc(id).then((response) => {
        this.form = response.rows[0];
        this.AdjustmentsToFundsShow = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateMchAcc(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMchAcc(this.form).then((response) => {
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
      this.$modal
        .confirm('是否确认删除商户账户总金额编号为"' + ids + '"的数据项？')
        .then(function () {
          return delMchAcc(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "excellent/mchAcc/export",
        {
          ...this.queryParams,
        },
        `mchAcc_${new Date().getTime()}.xlsx`
      );
    },
    //金额调整
    CloseAdjustmentsToFunds(value) {
      this.AdjustmentsToFundsShow = value;
    },
    UpdateAdjustmentsToFunds(value) {
      const loading = this.$loading({
        lock: true,
        text: '正在修改，请稍后...',
        // spinner: 'el-icon-loading',
      });
      this.AdjustmentsToFundsShow = false;
      updateMchAcc(value).then((response) => {
        this.$modal.msgSuccess("修改成功");
        this.getList();
        loading.close();
      });
    },
    //搜索商户号
    mch_numSearch(value) {
      if (this.ClientSearchLoading) {
        return;
      }
      if (!/^-?\d+(\.\d+)?$/.test(value) && !this.FirstSearched) {
        this.$refs.ClientSearch.blur();
        this.$modal.msgWarning("请输入数字");
        this.FirstSearched = false;
        return;
      }
      this.ClientSearchLoading = true;

      this.FirstSearched = false;
      let query = {
        page: null,
        limit: null,
        mch_number: value,
        mch_name: null,
      };
      listMchSetting(query).then((response) => {
        this.ClientSearchList = response.rows;
        setTimeout(() => {
          this.ClientSearchLoading = false;
        }, 500);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.CalculationFormula {
  padding-bottom: 8px;

  strong {
    font-size: 14px;
    padding-left: 24px;
  }
}
</style>
