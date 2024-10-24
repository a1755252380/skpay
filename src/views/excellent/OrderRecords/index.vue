<template>
  <div class="OrderRecords_div fulltable_div" ref="OrderRecords_div">
    <el-tabs type="card" class="OrderRecords_title" @tab-click="TabsChange" v-model="queryPage.time_type"
      ref="OrderRecordsTitle">
      <el-tab-pane :label="'当前' + (this.queryPage.type == 1 ? '代付' : '代收') + '订单'" name="now"></el-tab-pane>
      <el-tab-pane :label="'历史' + (this.queryPage.type == 1 ? '代付' : '代收') + '订单'" name="history"></el-tab-pane>
    </el-tabs>


    <div class="OrderRecords_table FlexColumn" v-loading="TabsChangeloading">
      <!-- 筛选条件模块 -->
      <OrderSearch :showSearch="showSearch" ref="search" @ReturnSearch="ReturnSearch"
        :TabsChangeStatus="queryPage.time_type" @RequestingDataAgain="RequestingDataAgain">
        <el-button type="primary" icon="el-icon-refresh-left" size="mini" @click="OpenBatchModification"
          v-hasPermi="['excellent:OrderRecords:edit']" slot="btn">批量修改</el-button>
        <!-- <el-button type="primary" icon="el-icon-refresh-left" size="mini" @click="OpenBatchModification"
          slot="btn">批量回调</el-button> -->
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </OrderSearch>

      <dynamicTableVue :loading="loading" :tableData="paginatedItems" ref="myTable" @cellDblclick="(row, column, cell, event) => {
        this.$util.copyToClipboard(cell.innerText);
      }" :cellClassName="'HoverTooltipCopy'" @handleSelectionChange="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"
          :selectable="(row, index) => { return row.status != 0 }"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
        </el-table-column>
        <!-- <el-table-column label="订单id" align="center" prop="id" /> -->
        <el-table-column label="商户号" align="center" prop="mch_number" width="100" fixed="left"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">

        </el-table-column>
        <el-table-column label="商户订单号" align="center" prop="merchant_order_id" min-width="210">

        </el-table-column>
        <el-table-column label="系统订单号" align="center" prop="_id" min-width="130">

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
        <!-- <el-table-column label="用户手机号" align="center" prop="user_phone" /> -->

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
        <el-table-column label="通道名称" align="center" prop="chnl_name"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" />
        <el-table-column label="UTR" align="center" prop="utr" width="170">

        </el-table-column>
        <!-- <el-table-column label="通道费率" align="center" prop="chnl_fee_ratio" width="80" />
        <el-table-column label="商户费率" align="center" prop="mch_fee_ratio" width="80" />
        <el-table-column label="手续费" align="center" prop="fee_single" width="100" /> -->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
          :width="hasPermiVisible(['excellent:OrderRecords:edit']) ? 180 : 80">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleCallback(scope.row)"
              v-hasPermi="['excellent:OrderRecords:edit']">回调</el-button>
            <el-button size="mini" type="text" icon="el-icon-refresh" @click="handleChangeOrderStatus(scope.row)"
              v-hasPermi="['excellent:OrderRecords:edit']" v-if="scope.row.status != 0">调整</el-button>
            <el-button size="mini" type="text" icon="el-icon-view" @click="WarchDeatil(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </dynamicTableVue>

      <pagination ref="pagination" v-show="total > 0" :total="pageData.total" :page.sync="pageData.pageNum"
        :limit.sync="pageData.pageSize" @pagination="handleCurrentChange" :layout="'sizes,prev, pager, next'"
        :page-sizes="[10, 20, 30, 50, 100]" @handleSizeChange="handleSizeChange" />
    </div>

    <!-- 订单状态修改弹窗 -->
    <AdjustOrderStatus :show="AdjustOrderStatusShow" :Change="form" @CloseAdjustOrderStatus="CloseAdjustOrderStatus"
      @ChangeOrderStatusRow="ChangeOrderStatusRow" :type="queryPage.time_type"></AdjustOrderStatus>
    <!-- 批量修改弹窗 -->
    <BatchModification :show="BatchModificationShow" @CloseBatchModification="CloseBatchModification"
      :type="queryPage.time_type" @ChangeBatchModification="ChangeBatchModification"></BatchModification>
    <!-- 内容详情弹窗 -->
    <DetailedContent :show="detailShow" @updateShow="updateShow" :detail="form" :detailkey="detailKeyList">
    </DetailedContent>
  </div>
</template>

<script>
import {
  listOrderRecords,
  getOrderRecords,
  delOrderRecords,
  addOrderRecords,
  updateOrderRecords,
  ModifyOrderStatus,
} from "@/api/excellent/OrderRecords";
import AdjustOrderStatus from "./AdjustOrderStatus.vue";
import OrderSearch from "./OrderSearch.vue";
import DetailedContent from "@/components/Excellent/DetailedContent.vue";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import moment from "moment-timezone";
import BatchModification from "./BatchModification.vue";
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
    DetailedContent,
    dynamicTableVue,
    BatchModification,
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
        type: "0", //0是代收 1是代付
        last_id: null,
        time_type: "now",
      },
      pageData: {
        currentPage: 1, // 当前页码
        pageSize: 10, // 每页显示的条数
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
      detailKeyList: [
        {
          title: "用户信息",
          Jurisdiction: "",
          content: [
            {
              label: "用户名",
              key: "user_name",
              Jurisdiction: "",
            },

            {
              label: "用户手机号",
              key: "user_phone",
              Jurisdiction: "",
            },
            {
              label: "用户地址",
              key: "user_address",
              Jurisdiction: "",
            },
            {
              label: "用户邮箱",
              key: "user_email",
              Jurisdiction: "",
            },
            {
              label: "用户银行账户",
              key: "user_bank_acct",
              Jurisdiction: "",
            },
            {
              label: "用户支付凭证",
              key: "utr",
              Jurisdiction: "",
            },
          ],
        },

        {
          title: "通道信息",
          content: [
            {
              label: "通道名称",
              key: "chnl_name",
              Jurisdiction: "",
            },
            {
              label: "通道费率",
              value: "100.00",
              key: "chnl_fee_ratio",
              Jurisdiction: "",
            },
          ],
          Jurisdiction: ["excellent:OrderRecords:platform"],
        },
        {
          title: "订单信息",
          Jurisdiction: "",
          content: [
            {
              label: "订单编号",
              value: "20210101000001",
              key: "_id",
              Jurisdiction: "",
            },
            {
              label: "订单金额",
              value: "100.00",
              key: "amount",
              Jurisdiction: "",
            },

            {
              label: "订单状态",
              key: "status",
              type: "tag",
              Jurisdiction: "",
            },
            // {
            //   label: "订单时间",
            //   key: "amount",
            //   Jurisdiction: "",
            // },
            // {
            //   label: "订单备注",
            //   key: "amount",
            //   Jurisdiction: "",
            // },
          ],
        },
        {
          title: "交易信息",
          Jurisdiction: "",
          content: [
            {
              label: "商户号",
              key: "mch_number",
              Jurisdiction: "",
            },
            {
              label: "商户费率",
              key: "mch_fee_ratio",
              Jurisdiction: "",
            },

            {
              label: "商户订单号",
              key: "merchant_order_id",
              Jurisdiction: "",
            },

            {
              label: "三方订单号",
              key: "platform_order_id",
              Jurisdiction: ["excellent:OrderRecords:platform"],
            },
            {
              label: "单笔手续费",
              key: "fee_single",
              Jurisdiction: "",
            },

            {
              label: "回调状态",
              key: "callback_status",
              type: "tag",
              Jurisdiction: "",
            },
            {
              label: "银行ifsc",
              key: "bank_ifsc",
              Jurisdiction: "",
            },
            {
              label: "UPI链接",
              key: "upi_link",
              Jurisdiction: "",
            },

            {
              label: "创建时间",
              key: "create_time",
              type: "formatTime",
              Jurisdiction: "",
            },

            {
              label: "更新时间",
              key: "update_time",
              type: "formatTime",
              Jurisdiction: "",
            },
            {
              label: "三方回复信息",
              key: "resp_msg",
              Jurisdiction: ["excellent:OrderRecords:platform"],
            },
          ],
        },
      ],
      height: 0,
      RepeatedRequests: false,
      //批量修改
      BatchModificationShow: false,
      BatchModificationList: [],
    };
  },
  created() {
    this.loading = true;
    this.queryPage.type = this.$route.query.type;
  },
  mounted() { },
  methods: {
    //关闭修改状态弹窗
    CloseBatchModification(value) {
      this.BatchModificationShow = value;
    },
    //批量修改状态
    ChangeBatchModification(value) {
      let loading = this.$loading({
        lock: true,
        text: "正在批量调整状态，请稍后...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      let promise = [];
      for (let index = 0; index < this.BatchModificationList.length; index++) {
        let query = {
          _id: this.BatchModificationList[index]._id,
          mch_number: this.BatchModificationList[index].mch_number,
          order_type: parseInt(this.queryPage.type),
        };

        //在超时状态选择回调状态时不给通过，不修改
        //在超时状态是只能选择同步状态
        if (
          this.BatchModificationList[index].status == 2 &&
          value.operation == 3
        ) {
          continue;
        }
        query["operation"] =
          this.BatchModificationList[index].status == 0
            ? this.BatchModificationList[index].status
            : value.operation;

        setTimeout(() => {
          promise.push(this.ChangeOrderStatus(query, false));
        }, 200);
      }
      console.log(promise);

      Promise.all(promise).then((res) => {

        this.$refs.myTable.clearSelection();
        this.BatchModificationList.splice(0);
        this.BatchModificationShow = false;

        setTimeout(() => {
          loading.close();
          this.RepeatedRequests = false
          this.$refs.search.handleQuery();//重新搜索一次
        }, 300);
        this.$message({
          message: "批量修改成功",
          type: "success",
        });

      });
    },
    //单个修改状态
    ChangeOrderStatusRow(value) {
      let query = {
        _id: value._id,
        mch_number: value.mch_number,
        order_type: parseInt(this.queryPage.type),
        operation: value.operation,
      };

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
            _id: value._id,
            mch_number: value.mch_number,
            order_type: parseInt(this.queryPage.type),
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
        this.$message.warning("请选择要修改的数据");
        return;
      } else {
        this.BatchModificationShow = true;
      }
    },
    handleSelectionChange(value) {
      this.BatchModificationList = value;
    },
    //返回搜索条件
    ReturnSearch(Params) {
      this.loading = true;
      this.resetSearch();
      this.RepeatedRequests = false
      this.getList(Params);
    },
    RequestingDataAgain(Params) {
      this.loading = true;

      this.getList(Params);
    },
    /** 查询订单列表 */

    getList(queryParams) {
      if (this.RepeatedRequests) {
        this.loading = false;
        return;
      }
      // this.loading = true;
      let query = { ...queryParams, ...this.queryPage };

      listOrderRecords(query).then((response) => {
        this.queryPage["last_id"] = response["last_id"];

        this.OrderRecordsList = [...this.OrderRecordsList, ...response.results];
        this.pageData.total = this.OrderRecordsList.length;
        this.loading = false;
        if (response["last_id"] == '') {
          this.RepeatedRequests = true;
        }
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除订单编号为"' + ids + '"的数据项？')
        .then(function () {
          return delOrderRecords(ids);
        })
        .then(() => {
          this.getList();
          this.$refs.search.handleQuery();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
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
          let index = this.OrderRecordsList.findIndex((res) => {
            return res._id == value._id;
          });
          if (response.status == 0 || response.status == 1) {
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

          } else if (response.status == 2) {
            this.$modal.msgWarning("订单还未完成，请稍后再试");
            this.AdjustOrderStatusShow = false;
          } else if (response.status == -1) {
            this.$modal.msgError(errorMsg);
            this.AdjustOrderStatusShow = false;
          }
          resolve(response);
        });
      });
    },
    //重置
    resetSearch() {
      console.log("重置");

      this.OrderRecordsList.splice(0)
      this.queryPage.last_id = null
      this.pageData = {
        currentPage: 1, // 当前页码
        pageSize: this.pageData.pageSize, // 每页显示的条数
        total: 1, // 数据总条数
      }
      this.$refs.myTable.clearSelection();
      this.BatchModificationList.splice(0);
      console.log("重置...");

    },

    //订单详情

    //tab选项切换按钮
    TabsChange(value) {
      this.loading = true;
      this.queryPage.time_type = value.name;

      // this.resetSearch();
      this.$refs.search.resetQuery();
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
