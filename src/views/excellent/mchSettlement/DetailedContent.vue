<template>
  <el-dialog :title="'历史数据'" :visible.sync="DetailedContentShowData" width="80%" append-to-body>

    <div class="fulltable_div" style="min-height: 70vh;">
      <el-form ref="DetailedContentSearch" size="small" :inline="true" label-width="120px">

        <el-form-item label="查询时间" prop="create_time">

          <TimeFrameVue v-model="timedata.create_time" @parseTime="parseTime" :ParameterIndex="'create_time'">
          </TimeFrameVue>
        </el-form-item>


        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="EmptyQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="DetailedContentSearchresetQuery">重置</el-button>
        </el-form-item>
      </el-form>


      <dynamicTableVue :tableData="DetailedContentPaginatedItems" :loading="DetailedContentLoading"
        ref="mchSettlementDetail" :defaultSort="{ prop: 'create_time', order: 'descending' }" @cellDblclick="(row, column, cell, event) => {
          this.$util.copyToClipboard(cell.innerText);
        }" :cellClassName="'HoverTooltipCopy'">

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
          width="180">

        </el-table-column>
        <el-table-column label="操作" align="center" prop="create_time" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="Settlement(scope.row)" icon="el-icon-refresh">代付结算</el-button>

          </template>
        </el-table-column>


      </dynamicTableVue>
      <pagination ref="pagination" v-show="DetailedContentTotalPages > 0" :total="DetailedContentTotalPages"
        :page.sync="DetailedContentListQueryParams.currentPage" :limit.sync="DetailedContentListQueryParams.pageSize"
        @pagination="handleCurrentChange" />
    </div>
    <ProxyChangeDialogVue :Change="ProxyChange" ref="ProxyChangeDialogVue" :show="ProxyChangeDialogShow"
      @CloseProxyChangeDialog="CloseProxyChangeDialog" @UpdateProxyChangeDialog="UpdateProxyChangeDialog">
    </ProxyChangeDialogVue>
  </el-dialog>

</template>

<script>
import { listMchSettlement } from "@/api/excellent/mchSettlement";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';
import ProxyChangeDialogVue from './DetailedContent/ProxyChangeDialog.vue';
import { updateMchAcc } from "@/api/excellent/mchAcc";
export default {
  name: 'WorkspaceJsonDetailedContent',
  props: ['DetailedContentShow', 'mch_number'],

  data() {
    return {
      DetailedContentList: [],
      DetailedContentListLoading: true,
      DetailedContentListQueryParams: {
        create_time: null, // 开始时间
        create_end_time: null, // 结束时间
        last_id: null, // 上一次查询的id
        pageSize: 20, // 每页显示的条数,
        total: 1
      },
      timedata: {
        create_time: [],
      },
      DetailedContentLoading: false,
      RepeatedRequests: false,
      //代付结算弹窗数据
      ProxyChange: {},
      ProxyChangeDialogShow: false,

    };
  },
  computed: {
    DetailedContentShowData: {
      set(value) {
        this.DetailedContentList.splice(0)
        this.DetailedContentListQueryParams = {
          create_time: null, // 开始时间
          create_end_time: null, // 结束时间
          last_id: null, // 上一次查询的id
          pageSize: 20, // 每页显示的条数,
          total: 1
        },
          this.timedata = {
            create_time: null, // 开始时间
          },

          this.$emit('ReturnDetailedContentShow', value);
      },
      get() {
        return this.DetailedContentShow;
      }
    },
    // 计算详情页总页数
    DetailedContentTotalPages() {
      return Math.ceil(this.DetailedContentListQueryParams.total / this.DetailedContentListQueryParams.pageSize);
    },
    // 计算详情页当前页显示的数据
    DetailedContentPaginatedItems() {

      const start = (this.DetailedContentListQueryParams.currentPage - 1) * this.DetailedContentListQueryParams.pageSize;
      const end = this.DetailedContentListQueryParams.currentPage * this.DetailedContentListQueryParams.pageSize;


      return this.DetailedContentList.slice(isNaN(start) ? 0 : start, isNaN(end) ? this.DetailedContentList.length : end);


    },

  },


  mounted() {

  },

  methods: {
    parseTime(value, index) {

      let utcTimeBegin = value[0]
      let utcTimeEnd = value[1]
      if (index == "create_time") {
        this.$set(this.DetailedContentListQueryParams, 'create_time', utcTimeBegin);
        this.$set(this.DetailedContentListQueryParams, 'create_end_time', utcTimeEnd);
      }

    },

    //搜索按钮
    EmptyQuery() {
      this.DetailedContentList.splice(0)
      this.DetailedContentListQueryParams.last_id = null

      this.getList()
    },
    DetailedContentSearchresetQuery() {
      this.DetailedContentListQueryParams = {
        create_time: null, // 开始时间
        create_end_time: null, // 结束时间
        last_id: null, // 上一次查询的id
        pageSize: 20, // 每页显示的条数,
        total: 1
      }
      this.timedata = {
        create_time: null, // 开始时间
        end_time: null, // 结束时间
      },
        this.getList()
    },
    //关闭代付结算弹窗
    CloseProxyChangeDialog() {
      this.ProxyChangeDialogShow = false
    },
    //打开代付结算弹窗
    Settlement(value) {

      this.ProxyChange = value
      this.ProxyChangeDialogShow = true
    },
    //提交修改信息
    UpdateProxyChangeDialog(value) {

      const loading = this.$loading({
        lock: true,
        text: '正在提交，请稍后...',
        // spinner: 'el-icon-loading',
      });

      updateMchAcc(value).then((response) => {
        this.$modal.msgSuccess("提交成功");
        this.ProxyChangeDialogShow = false;
        this.getList();
        loading.close();
      });
    },
    /** 查询商户结算列表 */
    async getList(mch_number) {
      let mch = mch_number ? mch_number : this.mch_number
      // if (mch_number) {
      //   this.DetailedContentList.splice(0)
      // }
      if (this.DetailedContentLoading || this.RepeatedRequests) {
        this.RepeatedRequests = false
        return
      }
      this.DetailedContentLoading = true;
      let query = {
        create_time: this.DetailedContentListQueryParams.create_time, // 开始时间
        create_end_time: this.DetailedContentListQueryParams.create_end_time, // 结束时间
        last_id: this.DetailedContentListQueryParams.last_id, // 上一次查询的id
        mch_number: mch

      };

      return await listMchSettlement(query).then((response) => {
        this.DetailedContentListQueryParams.last_id = response["last_id"];
        response.results = this.$util.deepFreeze(response.results)
        this.DetailedContentList = [...this.DetailedContentList, ...response.results];

        this.DetailedContentListQueryParams.total = this.DetailedContentList.length;
        this.$nextTick(() => {
          this.DetailedContentLoading = false;
          if (response["last_id"] == '') {
            this.RepeatedRequests = true;
          }
          this.$forceUpdate()
        })

      });
    },
    //分页处理
    handleCurrentChange(page) {
      this.DetailedContentListQueryParams.currentPage = page.page;
      this.DetailedContentLoading = true;
      this.$refs.mchSettlementDetail.Totop();

      // 如果到达最后一页并且没有足够的数据，则加载更多数据
      if (
        this.DetailedContentListQueryParams.currentPage === this.totalPages &&
        this.DetailedContentList.length < this.DetailedContentListQueryParams.total + 200
      ) {
        this.getList()
      } else {
        setTimeout(() => {
          this.DetailedContentLoading = false;
        }, 380);
      }
    },
    handleSizeChange(size) {
      this.DetailedContentListQueryParams.pageSize = size;
    },
  },
  components: {
    dynamicTableVue, TimeFrameVue, ProxyChangeDialogVue
  }
};
</script>
