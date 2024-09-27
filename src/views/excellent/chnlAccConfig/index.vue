<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="通道名称" prop="channelName">
        <ChannelQuery @ChannelQueryChange="ChannelQueryChange"></ChannelQuery>
        <!-- <el-input
          v-model="queryParams.channelName"
          placeholder="请输入通道名称"
          clearable
          @keyup.enter.native="handleQuery"
        /> -->
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['excellent:chnlAccConfig:add']">新增开户</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['excellent:chnlAccConfig:edit']">修改（启用/禁用/变更ip）</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <dynamicTableVue :loading="loading" :tableData="chnlAccConfigList" @selection-change="handleSelectionChange">
      <!-- <el-table-column type="selection" width="30" align="center" /> -->
      <!--      <el-table-column label="通道id" align="center" prop="channelId" />-->
      <el-table-column label="账户名称" align="center" prop="accountName" />

      <el-table-column label="通道选择" align="center" prop="channelName" />
      <!-- <el-table-column label="平台代号" align="center" prop="terraceSymbol" /> -->
      <el-table-column label="通道币别" align="center" prop="chnlCurrency" />
      <el-table-column label="币别" align="center" prop="currency" />
      <el-table-column label="账户类型" align="center" prop="accountType">
        <template slot-scope="scope">
          <span v-if="scope.row.accountType === 0">普通账户</span>
          <span v-else-if="scope.row.accountType === 1">托底备用账户</span>
        </template>
      </el-table-column>
      <el-table-column label="商户状态" align="center" prop="state">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.state" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeState($event, scope.row, 0)">
          </el-switch>
          <!-- <span v-if="scope.row.state === 0">启用</span>
          <span v-else-if="scope.row.state === 1">禁用</span> -->
        </template>
      </el-table-column>
      <!-- <el-table-column label="代付开关" align="center" prop="payoutSwitch">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.payoutSwitch" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeState($event, scope.row, 1)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="代收开关 " align="center" prop="payinSwitch">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.payinSwitch" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeState($event, scope.row, 2)">
          </el-switch>
        </template>
      </el-table-column> -->
      <el-table-column label="三方代收平台账户" align="center" prop="painAcc" />
      <el-table-column label="三方代付平台账户" align="center" prop="payoutAcc" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
        v-if="hasPermiVisible(['excellent:chnlAccConfig:edit'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['excellent:chnlAccConfig:edit']">修改</el-button>
        </template>
      </el-table-column>
    </dynamicTableVue>

    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改通道账户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="Breakdown-el-form"
        label-position="top">
        <el-form-item label="账户名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="通道选择" prop="channelName">
          <el-select v-model="form.channelName" placeholder="请选择通道名称" class="w100_input">
            <el-option v-for="dict in chnlSettingList" :key="dict.id" :label="dict.channelName"
              :value="dict.channelName" />
          </el-select>


          <!-- <el-input v-model="form.channelName" placeholder="请输入通道名称" /> -->
        </el-form-item>
        <!-- <el-form-item label="平台代号" prop="terraceSymbol">
          <el-input v-model="form.terraceSymbol" placeholder="请输入平台代号" />
        </el-form-item> -->
        <!-- <el-form-item label="通道币别" prop="chnlCurrency">
          <el-input v-model="form.chnlCurrency" placeholder="请输入通道币别" disabled />
        </el-form-item> -->

        <el-form-item label="币别" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入币别" disabled />
        </el-form-item>
        <el-form-item label="每分钟代收查询频率上限" prop="payinQueryFreTop">
          <el-input-number v-model="form.payinQueryFreTop" placeholder="请输入每分钟代收查询频率上限" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payinQueryFreTop" placeholder="请输入每分钟代收查询频率上限" /> -->
        </el-form-item>
        <el-form-item label="每分钟代付查询频率上限" prop="payoutQueryFreTop">
          <el-input-number v-model="form.payoutQueryFreTop" placeholder="请输入每分钟代付查询频率上限" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payoutQueryFreTop" placeholder="请输入每分钟代付查询频率上限" /> -->
        </el-form-item>

        <el-form-item label="每分钟交易频率上限" prop="tradeFreTop">
          <el-input-number v-model="form.tradeFreTop" placeholder="请输入每分钟交易频率上限" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.tradeFreTop" placeholder="请输入每分钟交易频率上限" /> -->
        </el-form-item>
        <el-form-item label="每分钟代收频率上限" prop="payinFreYop">
          <el-input-number v-model="form.payinFreYop" placeholder="请输入每分钟代收频率上限" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payinFreYop" placeholder="请输入每分钟代收频率上限" /> -->
        </el-form-item>
        <el-form-item label="每分钟代付频率上限" prop="payoutFreTop">
          <el-input-number v-model="form.payoutFreTop" placeholder="请输入每分钟代付频率上限" :min="0" class="w100_input" />
          <!-- <el-input v-model="form.payoutFreTop" placeholder="请输入每分钟代付频率上限" /> -->
        </el-form-item>
        <el-form-item label="三方代收平台账户" prop="painAcc">
          <el-input v-model="form.painAcc" placeholder="请输入三方代收平台账户" />
        </el-form-item>
        <el-form-item label="三方代付平台账户" prop="payoutAcc">
          <el-input v-model="form.payoutAcc" placeholder="请输入三方代付平台账户" />
        </el-form-item>
        <el-form-item label="代收密钥" prop="payinKey">
          <el-input v-model="form.payinKey" placeholder="请输入代收密钥" />
        </el-form-item>
        <el-form-item label="代付密钥" prop="payoutKey">
          <el-input v-model="form.payoutKey" placeholder="请输入代付密钥" />
        </el-form-item>
        <el-form-item label="代收回调地址" prop="payinCallbackUrl">
          <el-input v-model="form.payinCallbackUrl" placeholder="请输入代收回调地址" />
        </el-form-item>
        <el-form-item label="代付回调地址" prop="payoutCallbackUrl">
          <el-input v-model="form.payoutCallbackUrl" placeholder="请输入代付回调地址" />
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
import { listChnlAccConfig, getChnlAccConfig, delChnlAccConfig, addChnlAccConfig, updateChnlAccConfig } from "@/api/excellent/chnlAccConfig";
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import ChannelQuery from "../../../components/Excellent/Channel/ChannelQuery.vue";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';

export default {
  name: "ChnlAccConfig",
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
      // 通道账户配置表格数据
      chnlAccConfigList: [],
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
        channelName: [
          { required: true, message: "请选择通道", trigger: "change" }
        ],
        accountName: [
          { required: true, message: "账户名称不能为空", trigger: "blur" }
        ],
        state: [
          { required: true, message: "状态 0.启用 1.禁用不能为空", trigger: "change" }
        ],
      },
      //通道配置
      chnlSettingList: [],

    };
  },
  created() {
    this.getList();
    this.SeekChannel()
  },
  methods: {
    //通道搜索
    ChannelQueryChange(value) {
      this.queryParams.channelName = value.channelName
    },
    /** 查询通道账户配置列表 */
    getList() {
      this.loading = true;
      listChnlAccConfig(this.queryParams).then(response => {
        this.chnlAccConfigList = response.rows;
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
        chnlCurrency: "INR",
        accountName: null,
        currency: "INR",
        accountType: null,
        state: null,
        payoutSwitch: null,
        payinSwitch: null,
        payoutQueryFreTop: null,
        payinQueryFreTop: null,
        tradeFreTop: null,
        payinFreYop: null,
        payoutFreTop: null,
        painAcc: null,
        payoutAcc: null,
        payinKey: null,
        payoutKey: null,
        payinCallbackUrl: null,
        payoutCallbackUrl: null,
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
      this.title = "添加通道账户配置";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getChnlAccConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改通道账户配置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      let from = this.form;
      console.log(this.form.channelId);

      console.log(this.chnlSettingList);
      let chnlIndex = this.chnlSettingList.findIndex((res) => {
        return res.channelName === this.form.channelName
      })
      console.log(chnlIndex);
      console.log(this.chnlSettingList[chnlIndex]);


      from['channelId'] = this.chnlSettingList[chnlIndex]['id']
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateChnlAccConfig(from).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addChnlAccConfig(from).then(response => {
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
      this.$modal.confirm('是否确认删除通道账户配置编号为"' + ids + '"的数据项？').then(function () {
        return delChnlAccConfig(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/chnlAccConfig/export', {
        ...this.queryParams
      }, `chnlAccConfig_${new Date().getTime()}.xlsx`)
    },
    //代付状态以及状态修改按钮
    ChangeState(ChangeData, data, type) {
      // type 1为代付状态的修改 0为状态的修改 2为代收状态的修改
      let index = this.chnlAccConfigList.findIndex(res => {
        return res.id === data.id;
      })
      let form = data
      let key = "state"
      if (type == 0) {
        form.state = ChangeData
        key = "state"
      } else if (type == 1) {
        form.payoutSwitch = ChangeData
        key = "payoutSwitch"
      } else if (type == 2) {
        form.payinSwitch = ChangeData
        key = "payinSwitch"
      }
      updateChnlAccConfig(form).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.$set(this.chnlAccConfigList[index], key, ChangeData);
      });
    },
    //查询所有通道
    SeekChannel() {
      listChnlSetting().then(response => {
        this.chnlSettingList = response.rows;
      });
    },
  },
  components: { ChannelQuery, dynamicTableVue },
};
</script>
