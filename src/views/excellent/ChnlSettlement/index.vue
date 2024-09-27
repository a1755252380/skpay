<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="通道" prop="channelId">
        <ChannelQuery @ChannelQueryChange="ChannelQueryChange"></ChannelQuery>
      </el-form-item>
      <!-- <el-form-item label="主体账户" prop="accNum">
        <ChannelAccNumVue @ChannelAccNumChange="ChannelAccNumChange"></ChannelAccNumVue>
        <el-input v-model="queryParams.accNum" placeholder="请输入账户id" clearable @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <dynamicTableVue :loading="loading" :tableData="ChnlSettlementList"
      :DomList="[this.$refs.queryForm, this.$refs.pagination]">
      <el-table-column label="通道名称" align="center" prop="channelName" />
      <el-table-column label="货币代号" align="center" prop="currency" />
      <el-table-column label="代收成功金额" align="center" prop="payinSuccessAmount" />
      <el-table-column label="代付成功金额" align="center" prop="payoutSuccessAmount" />
      <el-table-column label="总资金调整" align="center" prop="totalFundAdjustment" />
      <el-table-column label="总代收手续费" align="center" prop="totalPayinFee" />
      <el-table-column label="总代付手续费" align="center" prop="totalPayoutFee" />
      <el-table-column label="在途代付金额" align="center" prop="whilePayoutAmout" />
      <el-table-column label="操作" align="center" class-name="small-padding ">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-warning-outline"
            @click="handleUpdate(scope.row)">详情</el-button>
        </template>
      </el-table-column>

    </dynamicTableVue>


    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 详细弹窗 -->
    <el-dialog :title="'结算详细'" :visible.sync="DetailedContentShow" width="1000px" append-to-body :before-close="() => {
      this.daterangeCreateTime = []
      this.DetailedContentShow = false
    }">

      <div>
        <el-form ref="DetailedContentSearch" size="small" :inline="true" label-width="68px">

          <el-form-item label="创建时间">
            <el-date-picker v-model="daterangeCreateTime" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="SeekDetailData">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="DetailedContentSearchresetQuery">重置</el-button>
          </el-form-item>
        </el-form>


        <el-table :data="DetailedContentList" border v-loading="DetailedContentListLoading" max-height="600">

          <el-table-column label="当日已结算代收金额" align="center" prop="dayPayinSettledAmout" />
          <el-table-column label="当日已结算代付金额" align="center" prop="dayPayoutSettledAmout" />
          <!-- <el-table-column label="当日总资金调整" align="center" prop="dayFundAdjustment" /> -->
          <el-table-column label="当日总代收手续费" align="center" prop="dayPayinFee" />
          <el-table-column label="当日总代收手续费" align="center" prop="dayPayoutFee" />
          <el-table-column label="日期" align="center" prop="updateTime">

            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>

          </el-table-column>

        </el-table>
      </div>





    </el-dialog>

  </div>
</template>

<script>
import { listChnlSettlement, listChnlSettlementDay, delChnlSettlement, addChnlSettlement, updateChnlSettlement } from "@/api/excellent/ChnlSettlement";
import ChannelQuery from "@/components/Excellent/Channel/ChannelQuery.vue";
import ChannelAccNumVue from '@/components/Excellent/Channel/ChannelAccNum.vue';
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';

export default {
  name: "ChnlSettlement",

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
      // 通道结算表格数据
      ChnlSettlementList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 当日总代付手续费时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        channelId: null,
        accNum: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      // 详情
      DetailedContentShow: false,
      DetailedContentList: [],
      DetailedContentListLoading: true
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    /** 查询通道结算列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      // if (null != this.daterangeCreateTime && '' != this.daterangeCreateTime) {
      //   this.queryParams.params["beginCreateTime"] = this.daterangeCreateTime[0];
      //   this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1];
      // }
      listChnlSettlement(this.queryParams).then(response => {
        this.ChnlSettlementList = response.rows;
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
        currency: null,
        payinSuccessAmount: null,
        payoutSuccessAmount: null,
        totalFundAdjustment: null,
        totalPayinFee: null,
        totalPayoutFee: null,
        whilePayoutAmout: null,
        dayPayinSettledAmout: null,
        dayPayoutSettledAmout: null,
        dayFundAdjustment: null,
        dayPayinFee: null,
        dayPayoutFee: null,
        createTime: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加通道结算";
    },
    DetailedContentSearchresetQuery() {
      this.resetForm("DetailedContentSearch");
      this.handleQuery();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.DetailedContentShow = true
      this.DetailedContentListLoading = true
      this.reset()
      this.form = row

      this.SeekDetailData()
    },
    SeekDetailData() {
      this.DetailedContentListLoading = true
      let params = {
        pageNum: null,
        pageSize: null,
        mchNum: null,
        id: this.form.id

      }
      let time = {}
      if (null != this.daterangeCreateTime && '' != this.daterangeCreateTime) {
        time["beginCreateTime"] = this.daterangeCreateTime[0];
        time["endCreateTime"] = this.daterangeCreateTime[1];
      }
      params['params'] = time
      listChnlSettlementDay(params).then(response => {
        this.DetailedContentList = response.rows
        this.DetailedContentListLoading = false
      })
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
            updateChnlSettlement(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addChnlSettlement(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除通道结算编号为"' + ids + '"的数据项？').then(function () {
        return delChnlSettlement(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/ChnlSettlement/export', {
        ...this.queryParams
      }, `ChnlSettlement_${new Date().getTime()}.xlsx`)
    },
    ChannelQueryChange(value) {
      this.queryParams.channelId = value.id
    },
    ChannelAccNumChange(value) {
      this.queryParams.accNum = value.id
    }
  },
  components: {
    ChannelQuery, ChannelAccNumVue, dynamicTableVue
  },
};
</script>
