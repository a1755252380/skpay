<template>
  <div class="app-container fulltable_div" ref="container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="商户号 " prop="mchNum">
        <MchNumSelect v-model="queryParams.mchNum" @change="handleQuery" @clear="() => {
          this.queryParams.mchNum = null; this.SearchIndex = -1
        }"></MchNumSelect>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"></right-toolbar> -->
      </el-form-item>
    </el-form>
    <div class="CalculationFormula">

      <strong>（本模块依据订单创建时间）</strong>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"
        v-if="!checkRole(['admin'])"></right-toolbar>
    </div>

    <dynamicTableVue :tableData="paginatedItems" @handleSelectionChange="handleSelectionChange" :loading="loading"
      :defaultSort="{
        order: 'ascending', prop: 'mch_number'
      }" ref="myTable">

      <el-table-column label="商户号 " align="center" prop="mch_number" />
      <el-table-column label="商户名称" align="center" prop="mch_name" />
      <el-table-column label="货币代号" align="center" prop="currency" />
      <el-table-column label="已结算代收金额" align="center" prop="payin_success_amount_count"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="已结算代付金额" align="center" prop="pay_out_success_amount_count"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="在途代付金额" align="center" prop="pending_amount_count" :formatter="Formatter.TableAmount" />
      <el-table-column label="总代收手续费" align="center" prop="pay_in_success_service_charge"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="总代付手续费" align="center" prop="pay_out_success_service_charge"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="截止时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond"
        width="180" />
      <el-table-column label="历史" align="center" class-name="small-padding ">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-warning-outline"
            @click="handleUpdate(scope.row)">历史数据</el-button>
        </template>
      </el-table-column>


    </dynamicTableVue>

    <pagination ref="pagination" v-show="totalPages > 0" :total="total" :page.sync="pageData.currentPage"
      :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" />

    <!-- 详细弹窗 -->

    <DetailedContentVue :DetailedContentShow="DetailedContentShow" ref="DetailedContentVue"
      :mch_number="DetailedContentNumber" @ReturnDetailedContentShow="ReturnDetailedContentShow">
    </DetailedContentVue>

  </div>
</template>

<script>

import { listMchSettlement, getMchSettlementDay, delMchSettlement, addMchSettlement, updateMchSettlement } from "@/api/excellent/mchSettlement";
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
        mchNum: null, // 商户号


      },
      SearchIndex: -1, //搜索数据索引
      last_id: null,
      pageData: {
        currentPage: 1, // 当前页码
        pageSize: 20, // 每页显示的条数
        total: 1, // 数据总条数
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      height: 0,
      RepeatedRequests: false,
      // 详情
      DetailedContentShow: false,
      DetailedContentNumber: 0
    };
  },
  computed: {
    // 计算当前页显示的数据
    paginatedItems() {

      const start = (this.pageData.currentPage - 1) * this.pageData.pageSize;
      const end = this.pageData.currentPage * this.pageData.pageSize;
      if (this.queryParams.mchNum) {
        return this.mchSettlementList.slice(this.SearchIndex, this.SearchIndex + 1);

      } else {
        return this.mchSettlementList.slice(start, end);

      }
    },
    // 计算总页数
    totalPages() {
      return Math.ceil(this.pageData.total / this.pageData.pageSize);
    },


  },
  created() {

  },
  mounted() {
    this.getList();
  },
  methods: {
    //数据处理
    async DataProcessing(list) {
      list = this.$util.deepFreeze(list)
      return Object.values(
        list.reduce((acc, obj) => {
          // 比较 mch_num 相同的对象，保留 create_time 最大的
          if (!acc[obj.mch_number] || acc[obj.mch_number].create_time < obj.create_time) {
            acc[obj.mch_number] = obj;
          }
          return acc;
        }, {})
      );
    },
    /** 查询商户结算列表 */
    getList() {
      this.loading = true;
      if (this.RepeatedRequests) {
        this.loading = false;
        return
      }
      let query = { ...this.queryParams };
      listMchSettlement(query).then((response) => {
        this.mchSettlementList = response.results;
        this.pageData.total = this.mchSettlementList.length;
        this.loading = false;

      });

    },
    //分页处理
    handleCurrentChange(page) {
      this.pageData.currentPage = page.page;
      this.loading = true;
      this.$refs.myTable.Totop();

      // 如果到达最后一页并且没有足够的数据，则加载更多数据
      if (
        this.pageData.currentPage === this.totalPages &&
        this.mchSettlementList.length < this.pageData.total + 200
      ) {
        this.getList()
      } else {
        setTimeout(() => {
          this.loading = false;
        }, 380);
      }
    },
    handleSizeChange(size) {
      this.pageData.pageSize = size;
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

      this.SearchIndex = this.mchSettlementList.findIndex(res => {

        return this.queryParams.mchNum == res.mch_number
      })

      // this.pageData.page = 1;
      // this.last_id = null
      // this.mchSettlementList.splice(0)
      // this.getList();
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
      this.DetailedContentNumber = row.mch_number
      this.$refs.DetailedContentVue.getList(this.DetailedContentNumber)

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
