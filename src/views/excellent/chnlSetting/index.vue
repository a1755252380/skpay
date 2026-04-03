<template>
  <div class="fulltable_div">
    <div v-if="!open" class="app-container ">
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
        <!-- <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
            v-hasPermi="['excellent:chnlSetting:add']">新增通道</el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-setting" size="mini" @click="openAllocationPoolDialog('payin1')"
            v-hasPermi="['excellent:chnlSetting:add']">代收分配池1</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-setting" size="mini" @click="openAllocationPoolDialog('payin2')"
            v-hasPermi="['excellent:chnlSetting:add']">代收分配池2</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-setting" size="mini" @click="openAllocationPoolDialog('payout')"
            v-hasPermi="['excellent:chnlSetting:add']">代付分配池</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-AutoHeight="{
        Ref: 'myTable', Height: 60
      }" v-table-move="['myTable']" v-loading="loading" :data="chnlSettingList" :height="200" border
        :default-sort="{ prop: 'id', order: 'ascending' }" ref="myTable">
        <!-- <el-table-column type="selection" width="30" align="center" /> -->
        <el-table-column label="通道ID" align="center" prop="id" :formatter="Formatter.SettingChannelNameFormatter"
          width="100" />
        <!-- <el-table-column label="通道名称" align="center" prop="id" v-if="hasPermiVisible(['excellent:chnlSetting:edit'])" /> -->
        <!-- <el-table-column label="平台代号" align="center" prop="terraceSymbol" /> -->

        <el-table-column label="代收状态" align="center" prop="payin_state" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.payin_state" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
              :inactive-value="1" @change="ChangeState($event, scope.row, 2)">
            </el-switch>

          </template>
        </el-table-column>
        <el-table-column label="代付状态" align="center" prop="payout_state" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.payout_state" active-color="#409EFF" inactive-color="#DCDFE6"
              :active-value="0" :inactive-value="1" @change="ChangeState($event, scope.row, 1)">
            </el-switch>

          </template>
        </el-table-column>

        <el-table-column label="货币代号" align="center" prop="currency" width="100" />
        <el-table-column label="结算模式" align="center" prop="settle_mode" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.settle_mode === 0" type="success">实时结算</el-tag>
            <el-tag v-else type="warning">延时结算</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="代收手续费" align="center" prop="payin_fee_single_interval" width="320">
          <template slot-scope="scope">
            <div style="" v-if="scope.row.payin_fee_single_interval">
              <span v-for="(item, index) in JSON.parse(scope.row.payin_fee_single_interval)" :key="index"
                class="table_expand_rate_item">
                <span class="table_expand_rate_label"> {{ index }}：</span><span class="table_expand_rate_value">{{
                  item }}</span>
              </span>
            </div>
            <div style="" v-else>
              -
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="chnl_symbol" />


        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="80"
          v-if="hasPermiVisible(['excellent:chnlSetting:edit'])">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
              v-hasPermi="['excellent:chnlSetting:edit']">修改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.page"
        :limit.sync="queryParams.limit" @pagination="getList" />
    </div>


    <!-- 通道信息编辑 -->
    <UpdateAdd ref="updateAddVue" v-else :show="open" :id="UpdateFormId" @cancel="cancel" @refresh="refresh">
    </UpdateAdd>
    <!-- 分配通道对话框 -->
    <AllocationPoolVue ref="allocationPoolVue" v-model="AllocationPool" :AllocationPoolType="AllocationPoolType">
    </AllocationPoolVue>

  </div>
</template>

<script>
import { listChnlSetting, getChnlSetting, delChnlSetting, addChnlSetting, updateChnlSetting } from "@/api/excellent/chnlSetting";
import ChannelQuery from "../../../components/Excellent/Channel/ChannelQuery.vue";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
import AllocationPoolVue from './modules/AllocationPool.vue';
import UpdateAdd from './modules/UpdateAdd.vue';
export default {
  name: "ChnlSetting",
  data() {
    return {
      AllocationPoolType: 'payin1',
      AllocationPool: false,
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
      // 更新添加表单ID
      UpdateFormId: null,
      // 查询参数
      queryParams: {
        page: 1,
        limit: 100,
        chnl_id: null,
        terraceSymbol: null,
        state: null,
      },


      // 表单校验
      rules: {
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
    // 打开分配通道对话框
    openAllocationPoolDialog(type) {
      this.AllocationPoolType = type;
      this.AllocationPool = true;
    },
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
    },
    // 刷新列表
    refresh() {
      this.open = false;
      this.getList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
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
      this.open = true;
      this.UpdateFormId = null
      this.title = "添加支付通道";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.open = true;
      this.UpdateFormId = row.chnl_name
      this.title = "修改支付通道";
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
        this.$message({
          message: '修改成功',
          type: 'success'
        })
        this.$set(this.chnlSettingList[index], key, ChangeData);
        this.$store.dispatch('fetchOptions', { isUpdate: true });
      });
    },


  },
  components: {
    ChannelQuery, dynamicTableVue, AllocationPoolVue, UpdateAdd
  }
};
</script>
<style lang="scss" scoped>
.table_expand_rate_item {
  margin: 6px 0;
  display: inline-block;
  width: 145px;
  font-weight: 600;

  .table_expand_rate_label {
    display: inline-block;
    width: 100px;
    color: #99a9bf;
  }

  .table_expand_rate_value {}
}
</style>
