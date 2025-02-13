<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="通道ID" prop="chnl_id">
        <ChannelQuery v-model="queryParams.chnl_id"></ChannelQuery>
        <!-- <el-input v-model="queryParams.chnl_name" placeholder="请输入通道名称" clearable @keyup.enter.native="handleQuery" /> -->
      </el-form-item>
      <!-- <el-form-item label="平台代号" prop="terraceSymbol">
        <el-input v-model="queryParams.terraceSymbol" placeholder="请输入平台代号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['excellent:chnlSetting:add']">新增通道</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['excellent:chnlSetting:edit']">修改(启用/禁用)</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <dynamicTableVue :loading="loading" :tableData="chnlSettingList">
      <!-- <el-table-column type="selection" width="30" align="center" /> -->
      <el-table-column label="通道ID" align="center" prop="id" />
      <!-- <el-table-column label="通道名称" align="center" prop="id" v-if="hasPermiVisible(['excellent:chnlSetting:edit'])" /> -->
      <!-- <el-table-column label="平台代号" align="center" prop="terraceSymbol" /> -->

      <el-table-column label="代收状态" align="center" prop="payin_state">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.payin_state" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeState($event, scope.row, 2)">
          </el-switch>

        </template>
      </el-table-column>
      <el-table-column label="代付状态" align="center" prop="payout_state">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.payout_state" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeState($event, scope.row, 1)">
          </el-switch>

        </template>
      </el-table-column>

      <el-table-column label="货币代号" align="center" prop="currency" />



      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
        v-if="hasPermiVisible(['excellent:chnlSetting:edit'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['excellent:chnlSetting:edit']">修改</el-button>
        </template>
      </el-table-column>
    </dynamicTableVue>

    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.page"
      :limit.sync="queryParams.limit" @pagination="getList" />

    <!-- 添加或修改支付通道对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="Breakdown-el-form"
        label-position="top">
        <el-form-item label="通道ID" prop="id" v-if="form.id">
          <el-input v-model="form.id" placeholder="请输入通道名称" disabled />
        </el-form-item>


        <el-form-item label="货币代号" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入货币代号" disabled />
        </el-form-item>

        <el-form-item label="代收费率" prop="payin_rate">
          <el-input-number v-model="form.payin_rate" placeholder="请输入代收费率" :min="0.0000" :precision="4" :step="0.0001"
            class="w100_input" />
          <!-- <el-input v-model="form.payin_rate" placeholder="请输入代收费率" /> -->
        </el-form-item>
        <el-form-item label="代付费率" prop="payout_rate">
          <el-input-number v-model="form.payout_rate" placeholder="请输入代收费率" :min="0.0000" :precision="4" :step="0.0001"
            class="w100_input" />

        </el-form-item>


        <el-form-item label="单笔代付手续费" prop="payout_fee_single">
          <el-input-number v-model="form.payout_fee_single" placeholder="请输入单笔代付手续费" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payout_fee_single" placeholder="请输入单笔代付手续费" /> -->

        </el-form-item>
        <el-form-item label="单笔代收最低限额" prop="payin_min_limit">
          <el-input-number v-model="form.payin_min_limit" placeholder="请输入单笔代收最低限额" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payin_min_limit" placeholder="请输入单笔代收最低限额" /> -->
        </el-form-item>
        <el-form-item label="单笔代付最低限额" prop="payout_min_limit">
          <el-input-number v-model="form.payout_min_limit" placeholder="请输入单笔代付最低限额" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payout_min_limit" placeholder="请输入单笔代付最低限额" /> -->
        </el-form-item>
        <el-form-item label="单笔代收最大限额" prop="payin_max_limit">
          <el-input-number v-model="form.payin_max_limit" placeholder="请输入单笔代收最大限额" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payin_max_limit" placeholder="请输入单笔代收最大限额" /> -->
        </el-form-item>
        <el-form-item label="单笔代付最大限额" prop="payout_max_limit">
          <el-input-number v-model="form.payout_max_limit" placeholder="请输入单笔代付最大限额" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payout_max_limit" placeholder="请输入单笔代付最大限额" /> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listChnlSetting, getChnlSetting, delChnlSetting, addChnlSetting, updateChnlSetting } from "@/api/excellent/chnlSetting";
import ChannelQuery from "../../../components/Excellent/Channel/ChannelQuery.vue";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
import moment from "moment";

export default {
  name: "ChnlSetting",
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
      // 支付通道表格数据
      chnlSettingList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        limit: 20,
        chnl_id: null,
        terraceSymbol: null,
        state: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        // chnl_name: [
        //   { required: true, message: "通道名称不能为空", trigger: "blur" }
        // ],
        // state: [
        //   { required: true, message: "状态 0.启用 1.禁用不能为空", trigger: "change" }
        // ],
        // payout_state: [
        //   { required: true, message: "代付状态 0.启用 1.禁用不能为空", trigger: "change" }
        // ],
        // payin_state: [
        //   { required: true, message: "代收状态 0.启用 1.禁用不能为空", trigger: "change" }
        // ],
        payinMode: [
          { required: true, message: "请选择代收模式", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询支付通道列表 */
    getList() {
      this.loading = true;
      listChnlSetting(this.queryParams).then(response => {
        this.chnlSettingList = response.rows;
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
        chnl_name: null,
        terraceSymbol: null,
        state: null,
        payout_state: null,
        payin_state: null,
        currency: "INR",
        chargeback: null,
        payinMode: null,
        payin_rate: null,
        payout_rate: null,
        payout_fee_single: null,
        payinFeeSingle: null,
        payin_min_limit: null,
        payout_min_limit: null,
        payin_max_limit: null,
        payout_max_limit: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
      this.title = "添加支付通道";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.chnl_name || this.ids
      getChnlSetting(id).then(response => {
        for (const key in this.form) {
          this.form[key] = response.rows[0][key] != null ? response.rows[0][key] : this.form[key]
        }
        // this.form = response.data;
        this.open = true;
        this.title = "修改支付通道";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateChnlSetting(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form['chnl_name'] = String(moment().format('YYYY-MM-DD/HH:mm:ss'));
            addChnlSetting(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除支付通道编号为"' + ids + '"的数据项？').then(function () {
        return delChnlSetting(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/chnlSetting/export', {
        ...this.queryParams
      }, `chnlSetting_${new Date().getTime()}.xlsx`)
    },
    //代付状态以及状态修改按钮
    ChangeState(ChangeData, data, type) {
      // type 1为代付状态的修改 0为状态的修改 2为代收状态的修改
      let index = this.chnlSettingList.findIndex(res => {
        return res.id === data.id;
      })
      let form = data
      let key = ""
      if (type == 0) {
        form.state = ChangeData
        key = "state"

      } else if (type == 1) {
        form.payout_state = ChangeData
        key = "payout_state"

      } else if (type == 2) {
        form.payin_state = ChangeData
        key = "payin_state"
      }
      updateChnlSetting(form).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.$set(this.chnlSettingList[index], key, ChangeData);
      });
    },


  },
  components: {
    ChannelQuery, dynamicTableVue
  }
};
</script>
