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

        <el-button type="primary" icon="el-icon-s-claim" size="mini" @click="Settlement">结算</el-button>
        <!-- <el-button  icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->

        <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"></right-toolbar> -->
      </el-form-item>
      <el-form-item>
        <div style="display: flex;">
          <el-input v-model="checkListInput" placeholder="请输入商户号,用逗号分隔" clearable size="mini"
            style=" margin-right: 6px;"></el-input>
          <el-button type="primary" icon="el-icon-download" size="mini" @click="CheckChoose">选择</el-button>
        </div>
      </el-form-item>
    </el-form>
    <div class="CalculationFormula">

      <strong>（本模块依据订单创建时间）</strong>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"
        v-if="!checkRole(['admin'])"></right-toolbar>
    </div>

    <el-table v-AutoHeight="{
      Ref: 'myTable'
    }" :data="mchSettlementListShow" @selection-change="handleSelectionChange" v-loading="loading"
      :default-sort="{ order: 'ascending', prop: 'mch_number' }" ref="myTable" border :row-key="'mch_number'"
      @select="handSelect" :highlight-selection-row="true">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商户号 " align="center" prop="mch_number" />
      <el-table-column label="已结算代收金额" align="center" prop="payin_success_amount_count"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="已结算代付金额" align="center" prop="pay_out_success_amount_count"
        :formatter="Formatter.TableAmount" />
      <!-- <el-table-column label="在途代付金额" align="center" prop="pending_amount_count" :formatter="Formatter.TableAmount" /> -->
      <el-table-column label="总代收手续费" align="center" prop="pay_in_success_service_charge"
        :formatter="Formatter.TableAmount" />
      <el-table-column label="总代付手续费" align="center" prop="pay_out_success_service_charge"
        :formatter="Formatter.TableAmount" />

      <!-- <el-table-column label="历史" align="center" class-name="small-padding ">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-warning-outline"
            @click="handleUpdate(scope.row)">历史数据</el-button>
        </template>
</el-table-column> -->


    </el-table>



    <!-- 详细弹窗 -->

    <DetailedContentVue :DetailedContentShow="DetailedContentShow" ref="DetailedContentVue" :ChooseRows="ChooseRows"
      @ReturnDetailedContentShow="ReturnDetailedContentShow">
    </DetailedContentVue>

  </div>
</template>

<script>

import { listMchSettlementList, getMchSettlementDay, delMchSettlement, addMchSettlement, updateMchSettlement } from "@/api/excellent/mchSettlement";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";
import DetailedContentVue from "./DetailedContent.vue";

export default {
  name: "MchSettlement",
  filters: {

  },
  data() {
    return {
      //输入想选中的行
      checkListInput: "",
      //选中数据
      ChooseRows: [],
      maxSelect: 5,//最大选中数
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
    };
  },
  computed: {
    // isSelectDisabled() {
    //   return this.ChooseRows.length >= this.maxSelect;
    // },
    mchSettlementListShow() {

      if (!this.queryParams.mchNum) {
        return this.mchSettlementList
      } else {

        return this.mchSettlementList.slice(this.SearchIndex, this.SearchIndex + 1)
      }
    }


  },
  created() {

  },
  mounted() {
    this.getList();
  },
  methods: {
    CheckChoose() {
      if (this.checkListInput == "") {
        return this.$message.warning("请输入商户号");
      }
      this.ChooseRows.splice(0)
      const list = this.checkListInput.split(/[,，]/).map(item => item.trim());

      for (let index = 0; index < list.length; index++) {
        const element = this.mchSettlementList.find(item => item.mch_number == list[index])
        element.isSelect = true

        this.$refs.myTable.toggleRowSelection(element, true);
      }

    },
    //进行结算
    Settlement() {
      if (this.ChooseRows.length == 0) {
        this.$message({
          message: "请选择需要结算的商户",
          type: "warning",
        });
        return
      }
      this.DetailedContentShow = true
    },
    //数据处理
    async DataProcessing(list) {
      list = this.$util.deepFreeze(list)
      return Object.values(
        list.reduce((acc, obj) => {
          // 比较 mch_num 相同的对象，保留 create_time 最大的
          if (!acc[obj.mch_number] || acc[obj.mch_number].create_time < obj.create_time) {
            acc[obj.mch_number] = obj;
            console.log(acc[obj.mch_number]);

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
      listMchSettlementList(query).then((response) => {
        this.mchSettlementList = response.results;
        this.mchSettlementList.map((item) => {
          item['isSelect'] = false
        })
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
      this.queryParams.mchNum = null; this.SearchIndex = -1
      this.handleQuery();
    },
    handSelect(selection, row) {
      row.isSelect = !row.isSelect

    },
    // 多选框选中数据
    handleSelectionChange(ChooseRows) {

      this.ChooseRows = ChooseRows;  // 更新选中的行

    },
    //是否禁用选择
    // selectableFun(row, index) {
    //   if (row.isSelect) {
    //     return true
    //   }
    //   if (this.isSelectDisabled) {
    //     return false
    //   }
    //   return true
    // },
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

// ::v-deep .el-table__header .el-table-column--selection {
//   .cell {
//     display: none;
//   }
// }</style>
