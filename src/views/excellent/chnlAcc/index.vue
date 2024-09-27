<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="通道名称" prop="channelName">
        <ChannelQuery @ChannelQueryChange="ChannelQueryChange"></ChannelQuery>
        <!-- <el-input v-model="queryParams.channelName" placeholder="请输入通道名称" clearable @keyup.enter.native="handleQuery" /> -->
      </el-form-item>
      <!-- <el-form-item label="平台代号" prop="terraceSymbol">
        <el-input v-model="queryParams.terraceSymbol" placeholder="请输入平台代号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item label="账户名称" prop="accountName">
        <el-input v-model="queryParams.accountName" placeholder="请输入账户名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['excellent:chnlAcc:edit']">资金调整</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <dynamicTableVue :loading="loading" :tableData="chnlAccList">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!--      <el-table-column label="通道id" align="center" prop="channelId" />-->
      <el-table-column label="通道名称" align="center" prop="channelName" fixed="left" />
      <!-- <el-table-column label="平台代号" align="center" prop="terraceSymbol" /> -->
      <el-table-column label="账户名称" align="center" prop="accountName" />
      <el-table-column label="货币代号" align="center" prop="currency" />
      <el-table-column label="账户余额" align="center" prop="accountBalance" />
      <el-table-column label="账户可用余额" align="center" prop="accountAvailableBalance" />
      <el-table-column label="当日代收" align="center" prop="dayPayin" />
      <el-table-column label="当日代付" align="center" prop="dayPayout" />
      <el-table-column label="代收金额" align="center" prop="payinAmout" />
      <el-table-column label="代付金额" align="center" prop="payoutAmout" />
      <el-table-column label="在途代付金额" align="center" prop="whilePayoutAmout" />
      <el-table-column label="资金调整" align="center" prop="fundAdjustment" />
      <el-table-column label="回款金额" align="center" prop="returnedFund" />
      <el-table-column label="代付手续费" align="center" prop="payoutFee" />
      <el-table-column label="代收手续费" align="center" prop="payinFee" />
      <!-- <el-table-column label="最后代收交易时间" align="center" prop="lastPayinTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastPayinTime, '{y}-{m}-{d}') }}</span>
        </template>
</el-table-column>
<el-table-column label="最后代付交易时间" align="center" prop="lastPayoutTime" width="180">
  <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastPayoutTime, '{y}-{m}-{d}') }}</span>
        </template>
</el-table-column>
<el-table-column label="最后代收成功调用时间" align="center" prop="lastPayinSuccessTime" width="180">
  <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastPayinSuccessTime, '{y}-{m}-{d}') }}</span>
        </template>
</el-table-column>
<el-table-column label="最后代付成功调用时间" align="center" prop="lastPayoutSuccessTime" width="180">
  <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastPayoutSuccessTime, '{y}-{m}-{d}') }}</span>
        </template>
</el-table-column> -->
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" fixed="right"
        v-if="hasPermiVisible(['excellent:chnlSetting:edit', 'excellent:chnlAcc:update'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleUpdate2(scope.row)"
            v-hasPermi="['excellent:chnlAcc:update']">调整</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['excellent:chnlAcc:edit']">修改</el-button>
        </template>
      </el-table-column>
    </dynamicTableVue>

    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改通道账户总金额对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="Breakdown-el-form"
        label-position="top">
        <el-form-item label="通道名称" prop="channelName">
          <el-input v-model="form.channelName" placeholder="请输入通道名称" />
        </el-form-item>
        <!-- <el-form-item label="平台代号" prop="terraceSymbol">
          <el-input v-model="form.terraceSymbol" placeholder="请输入平台代号" />
        </el-form-item> -->
        <el-form-item label="账户名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="货币代号" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入货币代号" disabled />
        </el-form-item>
        <el-form-item label="账户余额" prop="accountBalance">
          <el-input v-model="form.accountBalance" placeholder="请输入账户余额" />
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

        <el-form-item label="代收金额" prop="payinAmout">
          <el-input v-model="form.payinAmout" placeholder="请输入代收金额" />
        </el-form-item>
        <el-form-item label="代付金额" prop="payoutAmout">
          <el-input v-model="form.payoutAmout" placeholder="请输入代付金额" />
        </el-form-item>


        <el-form-item label="在途代付金额" prop="whilePayoutAmout">
          <el-input v-model="form.whilePayoutAmout" placeholder="请输入在途代付金额" />
        </el-form-item>
        <el-form-item label="资金调整" prop="fundAdjustment">
          <el-input v-model="form.fundAdjustment" placeholder="请输入资金调整" />
        </el-form-item>
        <el-form-item label="回款金额" prop="returnedFund">
          <el-input v-model="form.returnedFund" placeholder="请输入回款金额" />
        </el-form-item>
        <el-form-item label="代收手续费" prop="payinFee">
          <el-input v-model="form.payinFee" placeholder="请输入代收手续费" />
        </el-form-item>
        <el-form-item label="代付手续费" prop="payoutFee">
          <el-input v-model="form.payoutFee" placeholder="请输入代付手续费" />
        </el-form-item>

        <el-form-item label="最后代收交易时间" prop="lastPayinTime">
          <el-date-picker clearable v-model="form.lastPayinTime" type="date" value-format="yyyy-MM-dd"
            class="w100_input" placeholder="请选择最后代收交易时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="最后代付交易时间" prop="lastPayoutTime">
          <el-date-picker clearable v-model="form.lastPayoutTime" class="w100_input" type="date"
            value-format="yyyy-MM-dd" placeholder="请选择最后代付交易时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="最后代收成功调用时间" prop="lastPayinSuccessTime">
          <el-date-picker clearable v-model="form.lastPayinSuccessTime" class="w100_input" type="date"
            value-format="yyyy-MM-dd" placeholder="请选择最后代收成功调用时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="最后代付成功调用时间" prop="lastPayoutSuccessTime">
          <el-date-picker clearable v-model="form.lastPayoutSuccessTime" class="w100_input" type="date"
            value-format="yyyy-MM-dd" placeholder="请选择最后代付成功调用时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 调整金额 -->
    <AdjustmentsToFunds :show="AdjustmentsToFundsShow" :Change="form" @CloseAdjustmentsToFunds="CloseAdjustmentsToFunds"
      @UpdateAdjustmentsToFunds="UpdateAdjustmentsToFunds"></AdjustmentsToFunds>
  </div>
</template>

<script>
import { listChnlAcc, getChnlAcc, delChnlAcc, addChnlAcc, updateChnlAcc } from "@/api/excellent/chnlAcc";
import ChannelQuery from "../../../components/Excellent/Channel/ChannelQuery.vue";
import AdjustmentsToFunds from './AdjustmentsToFunds.vue'
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';

export default {
  name: "ChnlAcc",
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
      // 通道账户总金额表格数据
      chnlAccList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        channelName: null,
        terraceSymbol: null,
        accountName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        accountName: [
          { required: true, message: "账户名称不能为空", trigger: "blur" }
        ],
      },
      AdjustmentsToFundsShow: false,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询通道账户总金额列表 */
    getList() {
      this.loading = true;
      listChnlAcc(this.queryParams).then(response => {
        this.chnlAccList = response.rows;
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
        channelId: null,
        channelName: null,
        terraceSymbol: null,
        accountName: null,
        currency: "INR",
        accountBalance: null,
        accountAvailableBalance: null,
        dayPayin: null,
        dayPayout: null,
        payinAmout: null,
        payoutAmout: null,
        whilePayoutAmout: null,
        fundAdjustment: null,
        returnedFund: null,
        payoutFee: null,
        payinFee: null,
        lastPayinTime: null,
        lastPayoutTime: null,
        lastPayinSuccessTime: null,
        lastPayoutSuccessTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
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
      this.title = "添加通道账户总金额";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getChnlAcc(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改通道账户总金额";
      });
    },
    //调整按钮
    handleUpdate2(row) {
      this.reset();
      const id = row.id || this.ids
      getChnlAcc(id).then(response => {
        this.form = response.data;
        this.AdjustmentsToFundsShow = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateChnlAcc(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addChnlAcc(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除通道账户总金额编号为"' + ids + '"的数据项？').then(function () {
        return delChnlAcc(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/chnlAcc/export', {
        ...this.queryParams
      }, `chnlAcc_${new Date().getTime()}.xlsx`)
    },
    //通道搜索
    ChannelQueryChange(value) {
      this.queryParams.channelName = value.channelName
    },
    //金额调整
    CloseAdjustmentsToFunds(value) {
      this.AdjustmentsToFundsShow = value
    },
    UpdateAdjustmentsToFunds(value) {
      this.AdjustmentsToFundsShow = false
      value['accountNumId'] = value.id
      updateChnlAcc(value).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.getList();
      });
    },
  },
  components: {
    ChannelQuery, AdjustmentsToFunds, dynamicTableVue
  }
};
</script>
