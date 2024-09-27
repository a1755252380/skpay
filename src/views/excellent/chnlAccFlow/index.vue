<template>
  <div class="app-container fulltable_div">
    <div class="" style="display: flex; justify-content: space-between; align-items: center">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="账户名称" prop="accountName">
          <el-input v-model="queryParams.accountName" placeholder="账户名称" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker v-model="daterangeCreateTime" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <dynamicTableVue :loading="loading" :tableData="chnlAccFlowList">
      <!--      <el-table-column label="通道id" align="center" prop="channelId" />-->
      <el-table-column label="账户名称" align="center" prop="accountName" />
      <!-- <el-table-column label="平台代号" align="center" prop="accountName" /> -->
      <el-table-column label="通道名称" align="center" prop="channelName" />
      <el-table-column label="流水号" align="center" prop="flowId" />
      <el-table-column label="会计科目" align="center" prop="subjectName">
        <template slot-scope="scope">
          <span v-if="scope.row.subjectName === 1">PAYING</span>
          <span v-else-if="scope.row.subjectName === 2">PAYOUT</span>
          <span v-else-if="scope.row.subjectName === 3">ADJUST</span>
        </template>
      </el-table-column>
      <el-table-column label="科目变动金额" align="center" prop="subChangeAmout" />
      <el-table-column label="账户变动金额" align="center" prop="accChangeAmout" />
      <el-table-column label="资金变动原因" align="center" prop="changeReason" />
      <!-- <el-table-column label="科目初期金额" align="center" prop="subBeginAmout" /> -->
      <!-- <el-table-column label="科目末期金额" align="center" prop="subEndAmout" /> -->
      <el-table-column label="账户初期金额" align="center" prop="accBeginAmout" />
      <el-table-column label="账户末期金额" align="center" prop="accEndAmout" />
      <el-table-column label="相关订单号" align="center" prop="relativeOrder" />
      <el-table-column label="订单号" align="center" prop="orderNo" />
    </dynamicTableVue>

    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改通道账户流水对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="账户名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="平台代号" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入平台代号" />
        </el-form-item>
        <el-form-item label="通道名称" prop="channelName">
          <el-input v-model="form.channelName" placeholder="请输入通道名称" />
        </el-form-item>
        <el-form-item label="流水号" prop="flowId">
          <el-input v-model="form.flowId" placeholder="请输入流水号" />
        </el-form-item>
        <el-form-item label="科目变动金额" prop="subChangeAmout">
          <el-input v-model="form.subChangeAmout" placeholder="请输入科目变动金额" />
        </el-form-item>
        <el-form-item label="账户变动金额" prop="accChangeAmout">
          <el-input v-model="form.accChangeAmout" placeholder="请输入账户变动金额" />
        </el-form-item>
        <el-form-item label="科目初期金额" prop="subBeginAmout">
          <el-input v-model="form.subBeginAmout" placeholder="请输入科目初期金额" />
        </el-form-item>
        <el-form-item label="科目末期金额" prop="subEndAmout">
          <el-input v-model="form.subEndAmout" placeholder="请输入科目末期金额" />
        </el-form-item>
        <el-form-item label="账户初期金额" prop="accBeginAmout">
          <el-input v-model="form.accBeginAmout" placeholder="请输入账户初期金额" />
        </el-form-item>
        <el-form-item label="账户末期金额" prop="accEndAmout">
          <el-input v-model="form.accEndAmout" placeholder="请输入账户末期金额" />
        </el-form-item>
        <el-form-item label="相关订单号" prop="relativeOrder">
          <el-input v-model="form.relativeOrder" placeholder="请输入相关订单号" />
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
import {
  listChnlAccFlow,
  getChnlAccFlow,
  delChnlAccFlow,
  addChnlAccFlow,
  updateChnlAccFlow,
} from "@/api/excellent/chnlAccFlow";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";

export default {
  name: "ChnlAccFlow",
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
      // 通道账户流水表格数据
      chnlAccFlowList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 删除标志 0.正常 1.删除时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        accountName: null,
        createTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        accountName: [
          { required: true, message: "账户名称不能为空", trigger: "blur" },
        ],
        flowId: [
          { required: true, message: "流水号不能为空", trigger: "blur" },
        ],
        subjectName: [
          {
            required: true,
            message: "会计科目 0.COLLECTION[10] 1.COLLECTION_FEE[12]不能为空",
            trigger: "change",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询通道账户流水列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.daterangeCreateTime && "" != this.daterangeCreateTime) {
        this.queryParams.params["beginCreateTime"] =
          this.daterangeCreateTime[0] + " 00:00:00";
        this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1] + " 23:59:59";
      }
      listChnlAccFlow(this.queryParams).then((response) => {
        this.chnlAccFlowList = response.rows;
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
        accNum: null,
        accountName: null,
        channelName: null,
        flowId: null,
        subjectName: null,
        subChangeAmout: null,
        accChangeAmout: null,
        changeReason: null,
        subBeginAmout: null,
        subEndAmout: null,
        accBeginAmout: null,
        accEndAmout: null,
        relativeOrder: null,
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
      this.queryParams.pageNum = 1;
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
      this.title = "添加通道账户流水";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getChnlAccFlow(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改通道账户流水";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateChnlAccFlow(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addChnlAccFlow(this.form).then((response) => {
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
        .confirm('是否确认删除通道账户流水编号为"' + ids + '"的数据项？')
        .then(function () {
          return delChnlAccFlow(ids);
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
        "excellent/chnlAccFlow/export",
        {
          ...this.queryParams,
        },
        `chnlAccFlow_${new Date().getTime()}.xlsx`
      );
    },
  },
  components: { dynamicTableVue },
};
</script>
