<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="50px">
      <!-- <el-form-item label="登录名称" prop="logName">
        <el-input v-model="queryParams.logName" placeholder="请输入登录名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['excellent:agencyPeople:add']">新增</el-button>
      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <dynamicTableVue :loading="loading" :tableData="agencyPeopleList"
      :DomList="[this.$refs.queryForm, this.$refs.pagination]">
      <!-- <el-table-column label="登录名称" align="center" prop="logName" fixed="left" /> -->
      <el-table-column label="昵称" align="center" prop="nickname" fixed="left" />
      <el-table-column label="币别" align="center" prop="currency" />
      <el-table-column label="账户余额" align="center" prop="accountBalance" />
      <el-table-column label="账户可用余额" align="center" prop="accountAvailableBalance" />
      <el-table-column label="代付手续费" align="center" prop="payoutFee" />
      <el-table-column label="代收手续费" align="center" prop="payinFee" />
      <el-table-column label="资金调整" align="center" prop="fundAdjustment" />
      <el-table-column label="商户代收" align="center" prop="mchPayin" />
      <el-table-column label="商户代付" align="center" prop="mchPayout" />
      <el-table-column label="代付回退金额" align="center" prop="payoutRollbackAmout" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleUpdate2(scope.row)"
            v-hasPermi="['excellent:agencyPeople:edit']">调整</el-button>
          <!-- <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['excellent:agencyPeople:edit']">修改</el-button> -->

        </template>
      </el-table-column>
    </dynamicTableVue>

    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改代理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="65%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="Breakdown-el-form"
        label-position="top">
        <el-form-item label="登录名称" prop="logName">
          <el-input v-model="form.logName" placeholder="请输入登录名称" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="币别" prop="currency">
          <!-- <el-input placeholder="请输入币别" v-model="currency">
            <template slot="prepend">INR-</template>
          </el-input> -->
          <el-input v-model="form.currency" placeholder="请输入币别" disabled />
        </el-form-item>
        <el-form-item label="账户余额" prop="accountBalance">
          <el-input-number v-model="form.accountBalance" placeholder="请输入账户余额" class="w100_input" />
          <!-- <el-input v-model="form.accountBalance" placeholder="请输入账户余额" /> -->
        </el-form-item>
        <el-form-item label="账户可用余额" prop="accountAvailableBalance">
          <el-input-number v-model="form.accountAvailableBalance" placeholder="请输入账户可用余额" class="w100_input" />
          <!-- <el-input v-model="form.accountAvailableBalance" placeholder="请输入账户可用余额" /> -->
        </el-form-item>
        <el-form-item label="代付手续费" prop="payoutFee">
          <el-input-number v-model="form.payoutFee" placeholder="请输入代付手续费" class="w100_input" />
          <!-- <el-input v-model="form.payoutFee" placeholder="请输入代付手续费" /> -->
        </el-form-item>
        <el-form-item label="代收手续费" prop="payinFee">
          <el-input-number v-model="form.payinFee" placeholder="请输入代收手续费" class="w100_input" />
          <!-- <el-input v-model="form.payinFee" placeholder="请输入代收手续费" /> -->
        </el-form-item>
        <el-form-item label="资金调整" prop="fundAdjustment">
          <el-input-number v-model="form.fundAdjustment" placeholder="请输入资金调整" class="w100_input" />
          <!-- <el-input v-model="form.fundAdjustment" placeholder="请输入资金调整" /> -->
        </el-form-item>
        <el-form-item label="商户代收" prop="mchPayin">
          <el-input-number v-model="form.mchPayin" placeholder="请输入商户代收" class="w100_input" />
          <!-- <el-input v-model="form.mchPayin" placeholder="请输入商户代收" /> -->
        </el-form-item>
        <el-form-item label="商户代付" prop="mchPayout">
          <el-input-number v-model="form.mchPayout" placeholder="请输入商户代付" class="w100_input" />
          <!-- <el-input v-model="form.mchPayout" placeholder="请输入商户代付" /> -->
        </el-form-item>
        <el-form-item label="代付回退金额" prop="payoutRollbackAmout">
          <el-input-number v-model="form.payoutRollbackAmout" placeholder="请输入代付回退金额" class="w100_input" />
          <!-- <el-input v-model="form.payoutRollbackAmout" placeholder="请输入代付回退金额" /> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <AdjustmentsAgencyPeople :show="AdjustmentsToFundsShow" :Change="form"
      @CloseAdjustmentsToFunds="CloseAdjustmentsToFunds" @UpdateAdjustmentsToFunds="UpdateAdjustmentsToFunds">
    </AdjustmentsAgencyPeople>
  </div>
</template>

<script>
import { listAgencyPeople, getAgencyPeople, delAgencyPeople, addAgencyPeople, updateAgencyPeople } from "@/api/excellent/agencyPeople";
import AdjustmentsAgencyPeople from "./AdjustmentsAgencyPeople.vue";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';

export default {
  name: "AgencyPeople",
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
      // 代理表格数据
      agencyPeopleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        logName: null,
        nickname: null,
        currency: "INR",
        accountBalance: null,
        accountAvailableBalance: null,
        payoutFee: null,
        payinFee: null,
        fundAdjustment: null,
        mchPayin: null,
        mchPayout: null,
        payoutRollbackAmout: null,
      },
      // 表单参数
      form: {
        // 1.修改  2.资金调整
        type: 1
      },
      // 表单校验
      rules: {
        logName: [
          { required: true, message: "登录名称不能为空", trigger: "blur" }
        ],
      },
      AdjustmentsToFundsShow: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询代理列表 */
    getList() {
      this.loading = true;
      listAgencyPeople(this.queryParams).then(response => {
        this.agencyPeopleList = response.rows;
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
        logName: null,
        nickname: null,
        currency: "INR",
        accountBalance: null,
        accountAvailableBalance: null,
        payoutFee: null,
        payinFee: null,
        fundAdjustment: null,
        mchPayin: null,
        mchPayout: null,
        payoutRollbackAmout: null,
        createTime: null,
        updateTime: null,
        delFlag: null
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
      this.title = "添加代理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getAgencyPeople(id).then(response => {
        this.form = response.data;
        this.form.type = 1
        this.open = true;
        this.title = "修改代理";
      });
    },
    //调整金额
    handleUpdate2(row) {
      this.reset();
      const id = row.id || this.ids
      getAgencyPeople(id).then(response => {
        this.form = response.data;

        this.form.type = 2
        this.AdjustmentsToFundsShow = true;
        this.title = "修改代理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAgencyPeople(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAgencyPeople(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除代理编号为"' + ids + '"的数据项？').then(function () {
        return delAgencyPeople(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/agencyPeople/export', {
        ...this.queryParams
      }, `agencyPeople_${new Date().getTime()}.xlsx`)
    },
    //金额调整
    CloseAdjustmentsToFunds(value) {
      this.AdjustmentsToFundsShow = value
    },
    UpdateAdjustmentsToFunds(value) {
      this.AdjustmentsToFundsShow = false
      updateAgencyPeople(value).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.getList();
      });
    },
  },
  components: {
    AdjustmentsAgencyPeople, dynamicTableVue
  }
};
</script>
