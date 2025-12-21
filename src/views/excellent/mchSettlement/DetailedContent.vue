<template>

  <el-dialog :title="'历史数据'" :visible.sync="DetailedContentShowData" width="90%" :close-on-click-modal="false">
    <div class="fulltable_div" style="height: 600px;margin-bottom: 26px;">
      <el-form ref="DetailedContentSearch" :inline="true" label-width="80px" size="small">

        <el-form-item label="通道ID" prop="chnl_id">
          <ChannelQuery v-model="DetailedContentListQueryParams.chnl_id" @change="ChannelQueryChange"></ChannelQuery>

        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="EmptyQuery" size="mini">搜索</el-button>
          <el-button type="primary" icon="el-icon-refresh" @click="BatchSettlement" size="mini">批量结算</el-button>
          <el-button icon="el-icon-refresh" @click="reset" size="mini">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="tableTip">
        （<span class="todayText">蓝色部分</span>表示今日数据，<span class="secondText">浅蓝色部分</span>表示昨日数据）
      </div>
      <el-table :data="treeTableData" :class="!ReadyRequest ? 'SettlementForm' : ''" row-key="id" :empty-text="!ReadyRequest ? '请先选择通道再进行查询' : '暂无数据'
        " :highlight-current-row="false" ref="multipleTable" :row-class-name="rowClassNameFun" @select="selectFun"
        @select-all="selectAllFun" :header-row-class-name="headerRowClassName" :tree-props="{ children: 'children' }"
        :default-sort="{ prop: 'PendingSettlementAmount', order: 'descending' }" :height="450" show-summary
        :summary-method="getSummaries">
        <el-table-column type="selection" width="55" align="center" :selectable="readyselectable" />
        <el-table-column label="商户号 " align="center" prop="mch_number" width="150" />
        <el-table-column label="通道ID" align="center" prop="chnl_id" width="80"
          :formatter="Formatter.ChannelNameFormatter" />

        <el-table-column label="账户可用余额" align="center" prop="account_available_balance" min-width="130"
          :formatter="Formatter.TableAmount">
          <template slot-scope="scope">
            {{ Amount(scope.row.account_available_balance) }}
          </template>

        </el-table-column>
        <el-table-column label="未结算代收金额" align="center" prop="PendingSettlementAmount" min-width="130"
          :formatter="Formatter.TableAmount" />
        <el-table-column label="结算后金额" align="center" prop="SettlementAmount" min-width="130"
          :formatter="Formatter.TableAmount">
          <template slot-scope="scope">
            {{ SettlementAmount(scope.row) }}
          </template>

        </el-table-column>
        <el-table-column label="已结算代收金额" align="center" prop="payin_success_amount_count" min-width="130"
          :formatter="Formatter.TableAmount" />
        <el-table-column label="开始时间" align="center" prop="start_time" :formatter="Formatter.TableTimeSecond"
          width="200">
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="end_time" :formatter="Formatter.TableTimeSecond" width="200">
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <div v-if="scope.row.parentId != 0">
              <el-button type="text" size="small" @click="Settlement(scope.row)" icon="el-icon-refresh" v-if="
                scope.row.payout_settle_status == 0 &&
                scope.row.payin_success_amount_count > 0
              ">代付结算</el-button>

              <span v-else-if="scope.row.payout_settle_status == -1" class="disabledFont"
                style="color: #f56c6c;">无法结算</span>
              <span class="disabledFont" v-else-if="scope.row.payin_success_amount_count == 0">无数据结算</span>
              <span class="disabledFont" v-else>代付已结算</span>
            </div>
            <div v-else>
              <el-tag v-if="scope.row.payout_settle_status == -1" type="danger">无法结算</el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ProxyChangeDialogVue :Change="ProxyChange" ref="ProxyChangeDialogVue" :show="ProxyChangeDialogShow"
      @CloseProxyChangeDialog="CloseProxyChangeDialog" @UpdateProxyChangeDialog="UpdateProxyChangeDialog">
    </ProxyChangeDialogVue>
  </el-dialog>
</template>

<script>
import { listMchSettlement, QueryChannelSettlementAmount } from "@/api/excellent/mchSettlement";
import {
  listMchAcc

} from "@/api/excellent/mchAcc";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import ProxyChangeDialogVue from "./DetailedContent/ProxyChangeDialog.vue";
import { updateMchAcc } from "@/api/excellent/mchAcc";
import ChannelQuery from "@/components/Excellent/Channel/ChannelQuery.vue";
import moment from "moment-timezone";
import { mockRequest, PollingRequest, MultiPollingRequest } from "@/utils/ProgressRequest";

export default {
  name: "WorkspaceJsonDetailedContent",
  props: ["DetailedContentShow", "ChooseRows", "MchTotal", "queryParams"],

  data() {
    return {

      selectedRows: [], // 用于保存选中的行
      DetailedContentList: [], //原有数据
      treeTableData: [], //树形表格数据
      DetailedContentListLoading: true,
      DetailedContentListQueryParams: {
        start_time: null, // 开始时间
        end_time: null, // 结束时间
        last_id: null, // 上一次查询的id
        pageSize: 10, // 每页显示的条数,
        total: 1,
        chnl_id: null,
        currentPage: 1,
      },

      DetailedContentLoading: false,
      RepeatedRequests: false,
      //代付结算弹窗数据
      ProxyChange: {},
      ProxyChangeDialogShow: false,
      //progress
      progressShow: false,

      //高亮选项
      SelectValue: null,
      SelectOptions: [],


    };
  },
  computed: {
    DetailedContentShowData: {
      set(value) {
        this.DetailedContentList.splice(0);
        this.reset();
        this.$emit("ReturnDetailedContentShow", value);
      },
      get() {
        return this.DetailedContentShow;
      },
    },
    //是否可以进行请求查询
    ReadyRequest() {
      if (
        this.DetailedContentListQueryParams.chnl_id
      ) {
        return true;
      }
      return false;
    },
    //查询商户结算详情
    QueryDetailedContentList() {
      const mchNumbers = []
      for (let index = 0; index < this.ChooseRows.length; index++) {
        const element = this.ChooseRows[index];
        const chnlIndex = element.children.findIndex(item => item.chnl_id === this.DetailedContentListQueryParams.chnl_id)
        if (chnlIndex !== -1) {
          mchNumbers.push(element.mch_number);
        }
      }
      return mchNumbers
      // return this.ChooseRows.map((row) => {
      //   return row.mch_number;
      // });
    },

  },

  mounted() {
    this.reset();

  },

  methods: {

    ChannelQueryChange(value) {
      this.$set(this.DetailedContentListQueryParams, "chnl_id", value);
    },
    //搜索按钮
    EmptyQuery() {
      if (!this.ReadyRequest) {
        this.$message.error("请选择通道，再进行查询");
        return;
      }
      this.DetailedContentLoading = true;
      this.expandRowKeys = [];
      this.getList();
    },
    //重置请求参数
    reset() {
      this.treeTableData.splice(0);
      this.timedata = {
        create_time: [], // 开始时间
      };
      this.DetailedContentListQueryParams = {
        start_time: null, // 开始时间
        end_time: null, // 结束时间
        last_id: null, // 上一次查询的id
        pageSize: 10, // 每页显示的条数,
        total: 1,
        chnl_id: null,
      };
    },

    //关闭代付结算弹窗
    CloseProxyChangeDialog() {
      this.ProxyChangeDialogShow = false;
    },
    //打开代付结算弹窗
    Settlement(value) {
      this.ProxyChange = value;
      this.ProxyChangeDialogShow = true;
    },
    //批量结算
    BatchSettlement() {
      let selectData = [];
      function filterTreeData(data) {
        data.forEach((item) => {
          if (
            item.isSelect &&
            item.payout_settle_status != 1 &&
            item.parentId != 0
          ) {
            selectData.push(item);
          }
          if (item.children && item.children.length > 0) {
            filterTreeData(item.children);
          }
        });
      }
      filterTreeData(this.treeTableData);

      if (selectData.length == 0) {
        this.$message({
          message: "请选择需要结算的订单",
          type: "warning",
        });
        return;
      }

      this.$prompt("请输入备注信息", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(async ({ value }) => {
          const loading = this.$loading({
            lock: true,
            text: "正在结算中，请稍后...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          })
          let confirmList = [];
          for (let index = 0; index < selectData.length; index++) {
            if (selectData[index].payin_success_amount_count != 0) {
              const mergedObj = {
                mch_number: selectData[index].mch_number,
                msg: value,
                operation: 5,
                big_amount: selectData[index].payin_success_amount_count,
                end_time: selectData[index].end_time,
                payout_settle_status: 1,
                chnl_id: selectData[index].chnl_id,
              };
              mergedObj["big_amount"] = mergedObj["big_amount"] * -1;
              mergedObj["msg"] +=
                "（" +
                selectData[index]["chnl_id"] +
                "，结算时间：" +
                this.Formatter.FormatTime(
                  selectData[index]["start_time"] * 1000,
                  "YYYY-MM-DD HH:mm:ss"
                ) +
                "-" +
                this.Formatter.FormatTime(
                  selectData[index]["end_time"] * 1000,
                  "YYYY-MM-DD HH:mm:ss"
                ) +
                "）";
              confirmList.push(mergedObj);
            }
          }
          updateMchAcc(confirmList).then((res) => {
            loading.close();


            this.$message({
              type: "success",
              message: "批量结算成功",
            });
            this.DetailedContentShowData = false

            // this.EmptyQuery();
            return;
          }).catch((err) => {
            loading.close();

          })
          return;

        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入",
          });
        });

    },
    //提交修改信息
    UpdateProxyChangeDialog(value, data) {
      let index = this.treeTableData.findIndex(
        (item) => item.mch_number == data.mch_number
      );
      let childrenIndex = this.treeTableData[index].children.findIndex(
        (item) => item._id == data._id
      );
      const loading = this.$loading({
        lock: true,
        text: "正在提交，请稍后...",
        // spinner: 'el-icon-loading',
      });

      updateMchAcc(value)
        .then((response) => {
          if (response.code == -1) {
            this.$message({
              type: "error",
              message: "结算失败",
            });
            return;
          }
          this.$modal.msgSuccess("提交成功");
          this.$set(
            this.treeTableData[index].children[childrenIndex],
            "payout_settle_status",
            1
          );
        })
        .finally(() => {
          this.ProxyChangeDialogShow = false;

          loading.close();
        });
    },
    /** 查询商户结算列表 */
    async getList() {
      this.DetailedContentLoading = true;

      let confirmList = [];
      let listMchAccList = [];

      for (let index = 0; index < this.ChooseRows.length; index++) {
        const element = this.ChooseRows[index];
        const chnlIndex = element.children.findIndex(item => item.chnl_id === this.DetailedContentListQueryParams.chnl_id)
        if (chnlIndex !== -1) {
          let query = {
            start_time: this.queryParams.start_time, // 开始时间
            end_time: this.queryParams.end_time, // 结束时间
            last_id: null, // 上一次查询的id
            mch_number: element.mch_number,
            chnl_id: this.DetailedContentListQueryParams.chnl_id,
          };
          confirmList.push(query);
        }
      }
      console.log(confirmList);

      if (confirmList.length === 0) {
        this.$message.warning("暂无该通道的结算记录");
        return;
      }
      this.DetailedContentList.splice(0);
      MultiPollingRequest(
        [
          {
            name: "listMchSettlement",
            method: listMchSettlement,
            params: confirmList,
          },
          {
            name: "listMchAcc",
            method: listMchAcc,
            params: [{
              page: 1,
              limit: 500,
            }],
          },
        ]
      )
        .then(async (response) => {
          console.log(response);

          const results = response['listMchSettlement'].map((item) => {
            return item.results;
          });
          for (let index = 0; index < results.length; index++) {
            this.DetailedContentList = this.DetailedContentList.concat(
              results[index]
            );
          }
          this.DetailedContentListQueryParams.total = this.treeTableData.length;

          //查询商户总余额结果
          let ListMchResults = {}
          response['listMchAcc'][0].rows.map((item) => {
            ListMchResults[item.mch_num] = item
            return;
          });
          this.treeTableData = await this.processData(ListMchResults);
          this.DetailedContentLoading = false;

          this.$nextTick(() => {
            this.$refs.multipleTable.doLayout();
            this.$forceUpdate();
          });
        });

    },
    //分页处理
    handleCurrentChange(page) {
      this.DetailedContentListQueryParams.currentPage = page.page;
      this.DetailedContentLoading = true;
      this.$refs.multipleTable.scrollTop = 0;

      // 如果到达最后一页并且没有足够的数据，则加载更多数据
      if (
        this.DetailedContentListQueryParams.currentPage === this.totalPages &&
        this.DetailedContentList.length <
        this.DetailedContentListQueryParams.total + 200
      ) {
        this.getList();
      } else {
        setTimeout(() => {
          this.DetailedContentLoading = false;
        }, 380);
      }
    },
    handleSizeChange(size) {
      this.DetailedContentListQueryParams.pageSize = size;
    },
    //数据处理
    // 时间戳转日期
    formatDate(timestamp) {
      const date = moment(timestamp).tz("Asia/Kolkata");
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    // 时间戳转详细时间
    formatTimestamp(timestamp) {
      if (!timestamp) return "-";
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    },
    // // 处理数据为树形结构
    async processData(ListMchResults) {
      const groupedData = this.DetailedContentList.reduce((acc, item) => {
        // // 判断 startDate 是否在 dayStart 之后，并且 createDate 是否在 dayEnd 之前
        if (!acc[item.mch_number]) {
          acc[item.mch_number] = [];
        }
        acc[item.mch_number].push(item);
        return acc;
      }, {});
      // 是否可以选择当前行
      function isSelectable(row, index) {

        if (index == 0) {
          // 至少有一个未结算 → PendingSettlementAmount > 0
          const hasUnsettled = Number(row.PendingSettlementAmount) > 0;

          const children = row.children || [];

          const allAmountsZero = children.length > 0 ? children.every(
            c => Number(c.payin_success_amount_count) === 0
          ) : false;

          return hasUnsettled && !allAmountsZero;
        } else {

          //未结算状态 以及且父级为未结算状态 结算金额小于0 则返回false  不给选择
          if (row.payout_settle_status != 0 || row.payin_success_amount_count <= 0) {
            return false;
          } else {
            return true;
          }
        }
      }
      // 转换为树形结构
      let q = Object.keys(groupedData).map((date, index) => {
        const children = groupedData[date];
        const end = Math.max(...children.map((child) => child.end_time));

        //是否是无法结算的状态
        const payout_settle_status = ListMchResults[children[0].mch_number].account_available_balance - children.reduce(
          (sum, child) => sum + (child.payout_settle_status == 0 ? child.payin_success_amount_count : 0),
          0
        ) < 0 ? -1 : 0
        //等待结算的金额
        const PendingSettlementAmount = children.reduce(
          (sum, child) => sum + (child.payout_settle_status == 0 ? child.payin_success_amount_count : 0),
          0
        )
        //已经结算的金额
        const TheSettledAmount = children.reduce(
          (sum, child) => sum + (child.payout_settle_status == 1 ? child.payin_success_amount_count : 0),
          0
        )

        // 汇总父节点数据
        const parentNode = {
          parentId: 0, // 设置父节点的层级为 1
          isSelect: "",
          id: `parent-${index}`, // 父节点唯一 ID\
          account_available_balance: ListMchResults[children[0].mch_number].account_available_balance,
          chnl_id: this.DetailedContentListQueryParams.chnl_id
            ? this.DetailedContentListQueryParams.chnl_id
            : "",
          chnl_name: children[0].chnl_name,
          currency: children[0].currency,
          mch_name: children[0].mch_name,
          mch_number: children[0].mch_number,
          pay_in_success_service_charge: children.reduce(
            (sum, child) => sum + child.pay_in_success_service_charge,
            0
          ),
          pay_out_success_amount_count: children.reduce(
            (sum, child) => sum + child.pay_out_success_amount_count,
            0
          ),
          pay_out_success_service_charge: children.reduce(
            (sum, child) => sum + child.pay_out_success_service_charge,
            0
          ),
          payin_success_amount_count: TheSettledAmount,
          PendingSettlementAmount: PendingSettlementAmount, //待结算金额
          payout_settle_status: payout_settle_status,
          pending_amount_count: children.reduce(
            (sum, child) => sum + child.pending_amount_count,
            0
          ),
          start_time: Math.min(...children.map((child) => child.start_time)),
          end_time: isNaN(end)
            ? moment().tz("Asia/Kolkata").add(1, "days").startOf("day") / 1000
            : end,

          children: children.map((child, idx) => ({
            ...child,
            payout_settle_status: payout_settle_status == -1 ? payout_settle_status : child.payout_settle_status,
            PendingSettlementAmount: child.payout_settle_status == 0 ? child.payin_success_amount_count : 0, //待结算金额
            account_available_balance: "/",
            id: `child-${index}-${idx}`, // 子节点唯一 ID
            parentId: `parent-${index}`, // 设置父节点的层级为 1
          })),
          hasChildren: children.length <= 0, // 标记为有子节点
        };
        return parentNode;
      });
      //初始化数据
      function initData(data) {
        data.forEach((item) => {

          item.isSelect = false; //默认为不选中
          item.isSelectable = isSelectable(item, item.parentId)
          if (item.children && item.children.length) {
            initData(item.children);
          }
        });
      }
      initData(q);

      return q;
    },

    // 复选框点击事件
    selectFun(selection, row) {
      this.setRowIsSelect(row);
    },
    // 复选框点击事件
    setRowIsSelect(row) {

      //判断是否可选择
      function isSelectable(row) {
        //row.payout_settle_status == 0 &&
        //row.payin_success_amount_count > 0
        return row.isSelectable;
      }
      //当点击父级点复选框时，当前的状态可能为未知状态，所以当前行状态设为false并选中，即可实现子级点全选效果
      if (row.isSelect === "") {
        if (
          isSelectable(row)
        ) {
          row.isSelect = false;
          this.$refs.multipleTable.toggleRowSelection(row, true);
        }
      }
      row.isSelect = !row.isSelect;

      let that = this;

      function selectAllChildrens(data) {

        data.forEach((item) => {
          if (
            item.payout_settle_status == 0 &&
            item.payin_success_amount_count > 0
          ) {
            item.isSelect = row.isSelect;

            that.$refs.multipleTable.toggleRowSelection(item, row.isSelect);
          }

          if (item.children && item.children.length) {
            selectAllChildrens(item.children);
          }
        });
      }
      function getSelectStatus(selectStatuaArr, data) {
        data.forEach((childrenItem) => {
          selectStatuaArr.push(childrenItem.isSelect);

          if (childrenItem.children && childrenItem.children.length) {
            getSelectStatus(selectStatuaArr, childrenItem.children);
          }
        });

        return selectStatuaArr;
      }

      function getLevelStatus(row) {
        //如果当前节点的parantId =0 并且有子节点，则为1

        //如果当前节点的parantId !=0 并且子节点没有子节点 则为3

        if (row.parentId == 0) {
          if (row.children && row.children.length) {
            return 1;
          } else {
            return 4;
          }
        } else {
          if (!row.children || !row.children.length) {
            return 3;
          } else {
            return 2;
          }
        }
      }

      let result = {};

      //获取明确的节点

      function getExplicitNode(data, parentId) {
        data.forEach((item) => {
          if (item.id == parentId) {
            result = item;
          }

          if (item.children && item.children.length) {
            getExplicitNode(item.children, parentId);
          }
        });

        return result;
      }

      function operateLastLeve(row) {
        //操作的是子节点  1、获取父节点  2、判断子节点选中个数，如果全部选中则父节点设为选中状态，如果都不选中，则为不选中状态，如果部分选择，则设为不明确状态

        let selectStatuaArr = [];

        let item = getExplicitNode(that.treeTableData, row.parentId);

        selectStatuaArr = item.children;

        if (
          selectStatuaArr.every((selectItem) => {
            return true == selectItem;
          })
        ) {
          item.isSelect = true;

          that.$refs.multipleTable.toggleRowSelection(item, true);
        } else if (
          selectStatuaArr.every((selectItem) => {
            return false == selectItem;
          })
        ) {
          item.isSelect = false;

          that.$refs.multipleTable.toggleRowSelection(item, false);
        } else {
          item.isSelect = "";
        }

        //则还有父级

        if (item.parentId != 0) {
          operateLastLeve(item);
        }
      }

      //判断操作的是子级点复选框还是父级点复选框，如果是父级点，则控制子级点的全选和不全选

      //1、只是父级 2、既是子集，又是父级 3、只是子级

      let levelSataus = getLevelStatus(row);

      if (levelSataus == 1) {
        selectAllChildrens(row.children);
      } else if (levelSataus == 2) {
        selectAllChildrens(row.children);

        operateLastLeve(row);
      } else if (levelSataus == 3) {
        operateLastLeve(row);
      }
    },
    // 检测表格数据是否全选
    checkIsAllSelect() {
      this.selectedRows = [];
      this.treeTableData.forEach((item) => {
        this.selectedRows.push(item.isSelect);
      });
      //判断一级产品是否是全选.如果一级产品全为true，则设置为取消全选，否则全选

      let isAllSelect = this.selectedRows.every((selectStatusItem) => {
        return true == selectStatusItem;
      });
      return isAllSelect;
    },
    // 表格全选事件
    selectAllFun(selection) {
      let isAllSelect = this.checkIsAllSelect();
      // item.payout_settle_status == 0 &&
      //     item.payin_success_amount_count > 0
      this.treeTableData.forEach((item) => {
        if (
          item.isSelectable &&
          item.payout_settle_status == 0 &&
          item.payin_success_amount_count > 0
        ) {
          item.isSelect = isAllSelect;
          this.$refs.multipleTable.toggleRowSelection(item, !isAllSelect);
        }

        this.selectFun(selection, item);
      });
    },
    handleSelectChange(value) {
      this.SelectValue = value;
    },
    // 表格行样式 当当前行的状态为不明确状态时，添加样式，使其复选框为不明确状态样式
    rowClassNameFun({ row }) {
      if (row.isSelect === "") {
        return "indeterminate";
      }

      const startDate = moment.utc(row.start_time * 1000).tz("Asia/Kolkata"); // 确保时区转换

      if (startDate.isSame(moment().tz("Asia/Kolkata"), "day")) {
        return "todayRow";
      } else if (
        startDate.isSame(moment().subtract(1, "day").tz("Asia/Kolkata"), "day")
      ) {
        return "secondRow"; // 昨天日期
      }
    },
    // 表格标题样式 当一级目录有为不明确状态时，添加样式，使其全选复选框为不明确状态样式
    headerRowClassName({ row }) {
      let selectedRows = [];

      this.treeTableData.forEach((item) => {
        selectedRows.push(item.isSelect);
      });

      if (selectedRows.includes("")) {
        return "indeterminate";
      }

      return "";
    },
    //是否可以选择当前行
    readyselectable(row, index) {
      //
      return row.isSelectable
      if (row.parentId == 0) {

        if (row.payout_settle_status != 0) {
          return false;
        }
        // 至少有一个未结算 → PendingSettlementAmount > 0
        const hasUnsettled = Number(row.PendingSettlementAmount) > 0;

        const children = row.children || [];
        const allAmountsZero = children.every(
          c => Number(c.payin_success_amount_count) === 0
        );

        return hasUnsettled && !allAmountsZero;
      } else {

        //未结算状态 以及且父级为未结算状态 结算金额小于0 则返回false  不给选择
        if (row.payout_settle_status != 0 || row.payin_success_amount_count <= 0) {
          return false;
        } else {
          return true;
        }
      }
    },


    //结算后金额‘
    SettlementAmount(data) {
      // account_available_balance payin_success_amount_count
      if (data.account_available_balance == "/") {
        return "/";
      }

      return ((data.account_available_balance - data.PendingSettlementAmount) / 100).toFixed(2);
    },
    Amount(data) {
      if (data == "/") {
        return "/";
      }
      return (data / 100).toFixed(2);
    },
    getSummaries({ columns, data }) {

      const sums = [];
      columns.forEach((column, index) => {
        if (index === 1) {
          sums[index] = '合计';
          return;
        }
        if (index === 4 || index === 6) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = (values.reduce((prev, curr) => prev + Number(curr), 0) / 100).toFixed(2);
          } else {
            sums[index] = '/';
          }

        } else {
          sums[index] = '';
        }

      });
      return sums;
    },
  },
  components: {
    dynamicTableVue,
    ProxyChangeDialogVue,
    ChannelQuery,

  },
};
</script>
<style lang="scss" scoped>
.tableTip {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 12px;
}

.todayText {
  color: #2cabef !important;
}

.secondText {
  color: #92cdff !important;
}

.disabledFont {
  color: #c0c4cc;
  cursor: not-allowed;
  font-size: 12px;
  font-weight: 500;
}

::v-deep .hover-row,
::v-deep .hover-row>td.el-table__cell {
  background: transparent !important;
}

::v-deep .el-table__row--level-1,
::v-deep .el-table__row--level-1.hover-row>td.el-table__cell,
::v-deep .el-table__row--level-1.hover-row {
  background: #f5f7fa !important;
}

::v-deep .indeterminate .el-checkbox__input .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
}

::v-deep .SelectRow,
::v-deep .SelectRow.hover-row,
::v-deep.SelectRow.hover-row>td.el-table__cell {
  background: #e9f5ff !important;
}

::v-deep .indeterminate .el-checkbox__input.is-checked .el-checkbox__inner::after {
  transform: scale(0.5);
}

::v-deep .indeterminate .el-checkbox__input .el-checkbox__inner {
  background-color: #f2f6fc;
  border-color: #dcdfe6;
}

::v-deep .indeterminate .el-checkbox__input .el-checkbox__inner::after {
  border-color: #c0c4cc !important;
  background-color: #c0c4cc;
}

.product-show th .el-checkbox__inner {
  display: none !important;
}

::v-deep .indeterminate .el-checkbox__input .el-checkbox__inner::after {
  // content: "";
  position: absolute;
  display: block;
  background-color: #fff;
  height: 2px;
  transform: scale(0.5);
  left: 0;
  right: 0;
  top: 5px;
  width: auto !important;
}

::v-deep .el-dialog__body {
  padding: 10px 20px !important;
}

::v-deep .todayRow {
  background-color: #bae7ff !important;
}

::v-deep .secondRow {
  background-color: #e9f5ff !important;
}

::v-deep .thirdRow {
  background-color: #f2f9ff !important;
}

::v-deep .SettlementForm .el-table__empty-text {
  color: red !important;
  font-size: 16px;
  font-weight: 600;
}
</style>
