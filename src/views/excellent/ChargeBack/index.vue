<template>
  <div class="OrderRecords_div fulltable_div" ref="OrderRecords_div">

    <div class="OrderRecords_table FlexColumn" v-loading="TabsChangeloading">
      <!-- 筛选条件模块 -->
      <OrderSearch :showSearch="showSearch" ref="search" @ReturnSearch="ReturnSearch"
        :TabsChangeStatus="queryPage.time_type" @RequestingDataAgain="RequestingDataAgain">
        <!-- <el-button type="primary" icon="el-icon-refresh-left" size="mini" @click="OpenBatchModification"
          v-hasPermi="['excellent:OrderRecords:edit']" slot="btn">批量修改</el-button>
        <el-button type="primary" icon="el-icon-refresh-left" size="mini" @click="OpenBatchCallBack"
          v-hasPermi="['excellent:OrderRecords:edit']" slot="btn"
          v-if="queryPage.time_type == 'history'">批量回调</el-button> -->

        <!-- <el-button type="primary" icon="el-icon-refresh-left" size="mini" @click="BatchSearchOrdersShow = true"
          v-if="queryPage.time_type == 'history'" slot="btn">批量补单</el-button> -->
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </OrderSearch>

      <dynamicTableVue :loading="loading" :tableData="paginatedItems" ref="myTable" @cellDblclick="(row, column, cell, event) => {
        this.$util.copyToClipboard(cell.innerText);
      }" :cellClassName="'HoverTooltipCopy'" @handleSelectionChange="handleSelectionChange">
        <!-- :selectable="(row, index) => { return row.status != 0 }" -->

        <el-table-column type="selection" width="55" align="center"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
        </el-table-column>
        <el-table-column label="商户号" align="center" prop="mch_number" width="100" fixed="left"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">

        </el-table-column>
        <el-table-column label="商户订单号" align="center" prop="merchant_order_id" min-width="210" show-overflow-tooltip>

        </el-table-column>
        <el-table-column label="系统订单号" align="center" prop="_id" min-width="130" show-overflow-tooltip>

        </el-table-column>
        <el-table-column label="三方订单号" align="center" prop="platform_order_id"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" min-width="180" show-overflow-tooltip>

        </el-table-column>

        <el-table-column label="金额" align="center" width="100" prop="amount" :formatter="Formatter.TableAmount">

        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_time" min-width="155"
          :formatter="Formatter.TableTimeSecond">

        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="update_time" min-width="155"
          :formatter="Formatter.TableTimeSecond">

        </el-table-column>


        <el-table-column label="状态" align="center" prop="status" width="100" class-name="NoTooltip">
          <template slot-scope="scope">
            <el-tag :type="formatStatus(scope.row.status).type">{{
              formatStatus(scope.row.status).name
              }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回调状态" align="center" prop="callback_status" width="100" class-name="NoTooltip">
          <template slot-scope="scope">
            <el-tag :type="formatCallbackStatus(scope.row.callback_status).type">{{
              formatCallbackStatus(scope.row.callback_status).name
              }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通道名称" align="center" prop="chnl_id" :formatter="Formatter.ChannelNameFormatter"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" :width="80">
          <template slot-scope="scope">
            <!-- <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleCallback(scope.row)"
              v-hasPermi="['excellent:OrderRecords:edit']">回调</el-button>
            <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleChangeOrderStatus(scope.row)"
              v-hasPermi="['excellent:OrderRecords:edit']"
              v-if="scope.row.status != 0 || ($route.query.type == 1)">调整</el-button> -->
            <el-button size="mini" type="text" icon="el-icon-view" @click="WarchDeatil(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </dynamicTableVue>

      <pagination ref="pagination" v-show="total > 0" :total="pageData.total" :page.sync="pageData.pageNum"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" :layout="'sizes,prev, pager, next'"
        :page-sizes="[10, 20, 30, 50, 100, 150]" @handleSizeChange="handleSizeChange" />
    </div>

    <!-- 订单状态修改弹窗 -->
    <AdjustOrderStatus :show="AdjustOrderStatusShow" :Change="form" @CloseAdjustOrderStatus="CloseAdjustOrderStatus"
      @ChangeOrderStatusRow="ChangeOrderStatusRow" :type="queryPage.time_type"></AdjustOrderStatus>
    <!-- 批量修改弹窗 -->
    <BatchModification :show="BatchModificationShow" @CloseBatchModification="CloseBatchModification"
      :type="queryPage.time_type" @ChangeBatchModification="ChangeBatchModification">
    </BatchModification>
    <!-- 内容详情弹窗 -->
    <OrderDetail :show="detailShow" @updateShow="updateShow" :detail="form">
    </OrderDetail>
    <!-- 大数据修改订单 -->
    <BatchChangeState :BatchShow.sync="BatchInputShow" @submit="BatchInputSubmit"></BatchChangeState>
  </div>
</template>

<script>
import {
  listOrderRecords,
  ModifyOrderStatus, BatchListOrderRecords
} from "@/api/excellent/OrderRecords";
import AdjustOrderStatus from "./modules/AdjustOrderStatus.vue";
import OrderSearch from "./modules/OrderSearch.vue";

import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import moment from "moment-timezone";
import BatchModification from "./modules/BatchModification.vue";
import ProgressDialog from "@/components/dialog/ProgressDialog.vue";

import OrderDetail from "./modules/OrderDetail.vue";
import BatchChangeState from "./modules/BatchChangeState.vue";
export default {
  name: "OrderRecords",
  filters: {
    formatValue(value) {
      return value ? (value / 100).toFixed(2) : 0;
    },
    //状态调整
    formatStatus(value) {
      // 0-成功，1-失败，2-超时，5-已处理，6-已提交
      if (value == 0) {
        return "成功";
      } else if (value == 1) {
        return "失败";
      } else if (value == 2) {
        return "超时";
      } else if (value == 5) {
        return "已处理";
      } else if (value == 6) {
        return "已提交";
      } else {
        return "未知";
      }
    },
    //回调状态
    formatCallbackStatus(value) {
      // 0-未回调，1-已回调，
      if (value == 0) {
        return "未回调";
      } else if (value == 1) {
        return "已回调";
      } else {
        return "未知";
      }
    },
    //格式化时间
    formatTime(milliseconds) {
      // 将毫秒值转换为Date对象
      const date = new Date(milliseconds * 1000);

      // 使用 moment 进行格式化，指定时区为 IST
      return moment(date).tz("Asia/Kolkata").formatter("YYYY-MM-DD HH:mm:ss");
    },
  },
  components: {
    OrderSearch,
    AdjustOrderStatus,
    dynamicTableVue,
    BatchChangeState,
    BatchModification, ProgressDialog, OrderDetail,
  },
  computed: {
    // 计算当前页显示的数据
    paginatedItems() {
      const start = (this.pageData.currentPage - 1) * this.pageData.pageSize;
      const end = this.pageData.currentPage * this.pageData.pageSize;
      return this.OrderRecordsList.slice(start, end);
    },
    // 计算总页数
    totalPages() {
      return Math.ceil(this.pageData.total / this.pageData.pageSize);
    },
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
      total: 1000,
      // 订单表格数据
      OrderRecordsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryPage: {
        order_type: null, //0是代收 1是代付
        last_id: null,
        time_type: "history",
        charge_back: 1
      },
      lastQueryParams: null, // 记录上一次的搜索参数
      pageData: {
        currentPage: 1, // 当前页码
        pageSize: 100, // 每页显示的条数
        total: 1, // 数据总条数
      },

      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      //修改状态弹窗
      AdjustOrderStatusShow: false,
      //切换tab
      TabsChangeloading: false,
      //详情弹窗
      detailShow: false,

      height: 0,

      //批量修改
      BatchModificationShow: false,
      BatchModificationList: [],
      BatchInputShow: false,
      //进度条显示
      progressShow: false,
    };
  },
  created() {
    this.loading = true;
  },
  mounted() { },
  methods: {
    //关闭修改状态弹窗
    CloseBatchModification(value) {
      this.BatchModificationShow = value;
    },
    //输入大量订单号并进行修改状态时
    BatchInputSubmit(promise) {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      })
      ModifyOrderStatus(promise).then((response) => {
        this.$message({
          message: "批量修改成功",
          type: "success",
        });
        this.$refs.search.handleQuery();//重新搜索一次
      }).finally(() => {
        loading.close();
      })
    },
    //批量修改状态
    ChangeBatchModification(value) {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      })
      let query = {
        merchant_order_id_list: this.BatchModificationList.map((item) => item.merchant_order_id),
        operation: value.operation
      };

      ModifyOrderStatus(query).then((response) => {
        // if (value.operation == 4) {
        //   for (let index = 0; index < this.BatchModificationList.length; index++) {
        //     const listIndex = this.OrderRecordsList.findIndex((res) => {
        //       return res.merchant_order_id == this.BatchModificationList[index].merchant_order_id;
        //     });
        //     if (listIndex != -1) {
        //       this.OrderRecordsList.splice(listIndex, 1);
        //     }
        //   }
        // }
        this.$refs.myTable.clearSelection();
        this.BatchModificationList.splice(0);
        this.BatchModificationShow = false;
        this.$message({
          message: "批量修改成功",
          type: "success",
        });
        this.$refs.search.handleQuery();//重新搜索一次
      }).finally(() => {
        loading.close();
      })
    },
    //单个修改状态
    ChangeOrderStatusRow(value) {
      let query = {
        merchant_order_id_list: [value.merchant_order_id],
        // mch_number: value.mch_number,
        // order_type: parseInt(this.queryPage.order_type),
        operation: value.operation,
      };
      // return console.log(query);

      this.ChangeOrderStatus(query);
    },
    //点击回调
    handleCallback(value) {

      this.$confirm('是否对该订单进行回调？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(res => {

          let query = {
            merchant_order_id_list: [value.merchant_order_id],

            operation: 3,
          };
          this.ChangeOrderStatus(query);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },

    OpenBatchModification() {
      if (this.BatchModificationList.length == 0) {
        this.BatchInputShow = true;
        return;
      } else {
        this.BatchModificationShow = true;
      }
    },
    //批量回调
    OpenBatchCallBack() {
      if (this.BatchModificationList.length == 0) {
        this.$message.warning("请选择要修改的数据");
        return;
      } else {
        this.$confirm('是否对这些订单进行回调？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(res => {
          const loading = this.$loading({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          })
          let query = {
            merchant_order_id_list: this.BatchModificationList.map(item => item.merchant_order_id),
            operation: 3,
          };
          ModifyOrderStatus(query).then(() => {
            this.$message.success("批量回调成功");
            this.$refs.myTable.clearSelection();
            this.BatchModificationList.splice(0);

            this.$refs.search.handleQuery();//重新搜索一次
          }).finally(() => {
            loading.close();
          })

          // this.progressShow = true;
          // let confirmList = []
          // for (let index = 0; index < this.BatchModificationList.length; index++) {
          //   confirmList.push({
          //     merchant_order_id_list: this.BatchModificationList[index].merchant_order_id,
          //     mch_number: this.BatchModificationList[index].mch_number,
          //     order_type: parseInt(this.queryPage.order_type),
          //     operation: 3,
          //   })
          // }
          // this.$refs.ProgressDialog.batchRequest(confirmList, ModifyOrderStatus).then(res => {

          //   this.$message.success("批量回调成功");
          //   this.$refs.myTable.clearSelection();
          //   this.BatchModificationList.splice(0);

          //   this.$refs.search.handleQuery();//重新搜索一次

          // })


        })
      }
    },
    handleSelectionChange(value) {
      this.BatchModificationList = value;
    },
    //返回搜索条件
    ReturnSearch(Params) {
      this.resetSearch();
      this.getList(Params);
    },
    RequestingDataAgain(Params) {
      this.getList(Params);
    },
    /** 查询订单列表 */

    getList(queryParams) {
      function isObjectsEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
      }

      // this.loading = true;
      let query = { ...queryParams, ...this.queryPage };

      if (this.lastQueryParams && isObjectsEqual(query, this.lastQueryParams) && this.loading) {
        this.$message.error('请勿重复搜索！');
        return;
      }
      this.loading = true
      this.lastQueryParams = query; // 记录当前搜索参数
      listOrderRecords(query).then((response) => {
        this.queryPage["last_id"] = response["last_id"];
        this.OrderRecordsList = [...this.OrderRecordsList, ...response.results];
        this.pageData.total = this.OrderRecordsList.length;

      }).finally(() => {
        this.loading = false;
      })
        ;
    },

    //分页处理
    handleCurrentChange(page) {
      this.pageData.currentPage = page.page;
      this.loading = true;
      this.$refs.myTable.Totop();

      // 如果到达最后一页并且没有足够的数据，则加载更多数据
      if (
        this.pageData.currentPage === this.totalPages &&
        this.OrderRecordsList.length < this.pageData.total + 200
      ) {
        this.$refs.search.RequestingDataAgain();
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
        mchNumber: null,
        merchantOrderId: null,
        createTime: null,
        updateTime: null,
        amount: null,
        userName: null,
        userPhone: null,
        userEmail: null,
        bankIfsc: null,
        userBankAcct: null,
        userAddress: null,
        chnlName: null,
        chnlFeeRatio: null,
        mchFeeRatio: null,
        status: null,
        callbackStatus: null,
        orderType: null,
        paymentStatus: null,
        feeSingle: null,
        platformOrderId: null,
        respMsg: null,
        upiLink: null,
        utr: null,
      };
      this.resetForm("form");
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加订单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getOrderRecords(id).then((response) => {
        this.form = response;
        this.open = true;
        this.title = "修改订单";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateOrderRecords(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addOrderRecords(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },


    //调整订单状态
    CloseAdjustOrderStatus(value) {
      this.reset();
      this.AdjustOrderStatusShow = value;
    },
    handleChangeOrderStatus(row) {
      this.reset();
      this.form = row;
      this.AdjustOrderStatusShow = true;
    },
    //查看详情
    WarchDeatil(row) {
      this.reset();
      this.form = row;
      this.detailShow = true;
    },
    updateShow(value) {
      this.detailShow = value;
    },
    //修改状态提交
    ChangeOrderStatus(value, showMsg = true, SuccessMsg = "修改成功", errorMsg = "修改失败") {

      return new Promise((resolve, reject) => {
        ModifyOrderStatus(value).then((response) => {
          const result = response.results[0]
          let index = this.OrderRecordsList.findIndex((res) => {
            return res.merchant_order_id == value.merchant_order_id_list[0];
          });
          console.log(index, value.operation);

          if (value.operation == 4) {
            if (index != -1) {
              this.OrderRecordsList.splice(index, 1);
            }


            return this.$modal.msgSuccess(SuccessMsg);
          }
          if (result.status == 0 || result.status == 1) {
            if (showMsg) {
              this.$modal.msgSuccess(SuccessMsg);

            }
            this.AdjustOrderStatusShow = false;

            if (value.operation == 3) {
              if (showMsg) {
                this.$modal.msgSuccess("回调成功");
              }
              return
            }
            this.$set(this.OrderRecordsList[index], "status", value.operation);

          } else if (result.status == 2) {
            this.$modal.msgWarning("订单还未完成，请稍后再试");
            this.AdjustOrderStatusShow = false;
          } else if (result.status == -1) {
            this.$modal.msgError(errorMsg);
            this.AdjustOrderStatusShow = false;
          }
          resolve(result);
        });
      });
    },
    //重置
    resetSearch() {

      this.OrderRecordsList.splice(0)
      this.queryPage.last_id = null
      this.pageData = {
        currentPage: 1, // 当前页码
        pageSize: this.pageData.pageSize, // 每页显示的条数
        total: 1, // 数据总条数
      }
      this.$refs.myTable.clearSelection();
      this.BatchModificationList.splice(0);

    },



    //状态调整
    formatStatus(value) {
      // 0-成功，1-失败，2-超时，5-已处理，6-已提交

      if (value == 0) {
        return { name: "成功", type: "success" };
      } else if (value == 1) {
        return { name: "失败", type: "danger" };
      } else if (value == 2) {
        return { name: "超时", type: "warning" };
      } else if (value == 5) {
        return { name: "已处理", type: "success" };
      } else if (value == 6) {
        return { name: "已提交", type: "" };
      } else if (value == -1) {
        return { name: "修改失败", type: "danger" };
      } else if (value == -1) {
        return { name: "ChargeBack", type: "danger" };
      } else {
        return { name: "未知", type: "danger" };
      }
    },
    //状态调整
    formatCallbackStatus(value) {
      // 0-成功，1-失败，2-超时，5-已处理，6-已提交

      if (value == 0) {
        return { name: "未回调", type: "warning" };
      } else if (value == 1) {
        return { name: "已回调", type: "success" };
      } else {
        return { name: "未知", type: "danger" };
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.OrderRecords_div {
  position: relative;
  min-height: inherit;
  display: flex;
  flex-direction: column;

  .OrderRecords_title {
    // position: sticky;
    // top: 0;
    // z-index: 999;
  }

  .OrderRecords_table {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}
</style>
