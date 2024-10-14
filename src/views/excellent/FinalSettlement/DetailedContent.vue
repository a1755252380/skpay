<template>
  <el-dialog :title="'历史数据'" :visible.sync="DetailedContentShowData" width="80%" append-to-body>

    <div class="fulltable_div" style="min-height: 70vh;">
      <el-form ref="DetailedContentSearch" size="small" :inline="true" label-width="120px">

        <el-form-item label="创建时间" prop="create_time">
          <el-date-picker v-model="timedata.create_time" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间"
            @change="parseTime($event, 'create_time')">
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="EmptyQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="DetailedContentSearchresetQuery">重置</el-button>
        </el-form-item>
      </el-form>


      <dynamicTableVue :tableData="DetailedContentList" :loading="DetailedContentLoading" ref="DetailedContentList">

        <el-table-column label="商户号" align="center" prop="mch_num" fixed="left" />
        <!-- <el-table-column label="商户名称" align="center" prop="mch_name" /> -->
        <!-- <el-table-column label="货币代号" align="center" prop="currency" /> -->
        <el-table-column label="账户余额" align="center" prop="account_balance" :formatter="Formatter.TableAmount" />
        <el-table-column label="待结算金额" align="center" prop="account_pending_settlement_balance"
          :formatter="Formatter.TableAmount" />
        <el-table-column label="账户可用余额" align="center" prop="account_available_balance"
          :formatter="Formatter.TableAmount" />
        <el-table-column label="代付余额" align="center" prop="account_payout_balance" :formatter="Formatter.TableAmount" />
        <el-table-column label="代付可用余额" align="center" prop="account_payout_available_balance"
          :formatter="Formatter.TableAmount" />

        <el-table-column label="代付冻结金额" align="center" prop="payou_freeze_amount" :formatter="Formatter.TableAmount" />
        <el-table-column label="代付冻结金额手续费" align="center" prop="payou_freeze_amount_service" width="180"
          :formatter="Formatter.TableAmount" />

        <el-table-column label="截止时间" align="center" prop="create_time" :formatter="Formatter.TableTimeSecond"
          width="180">


        </el-table-column>



      </dynamicTableVue>
      <pagination ref="pagination" v-show="DetailedContentListQueryParams.total > 0"
        :total="DetailedContentListQueryParams.total" :page.sync="DetailedContentListQueryParams.page"
        :limit.sync="DetailedContentListQueryParams.limit" @pagination="handleCurrentChange" />
    </div>

  </el-dialog>

</template>

<script>
import { listMchSettlement } from "@/api/excellent/FinalSettlement";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
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
        limit: 20, // 每页显示的条数,
        page: 1,
        total: 0
      },
      timedata: {
        create_time: [], // 开始时间
        create_end_time: null, // 结束时间
      },
      DetailedContentLoading: false
    };
  },
  computed: {
    DetailedContentShowData: {
      set(value) {
        this.DetailedContentLoading = false
        this.DetailedContentList.splice(0)
        this.DetailedContentListQueryParams = {
          create_time: null, // 开始时间
          create_end_time: null, // 结束时间
          limit: 20, // 每页显示的条数,
          page: 1,
          total: 0
        },
          this.timedata = {
            create_time: [], // 开始时间
            create_end_time: null, // 结束时间
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

      return this.DetailedContentList.slice(start, end);


    },

  },
  watch: {

  },

  mounted() {

  },

  methods: {
    parseTime(value, index) {
      let utcTimeBegin = value ? this.$util.getUtcTime(value[0]) / 1000 : null;
      let utcTimeEnd = value ? this.$util.getUtcTime(value[1]) / 1000 : null;
      if (index == "create_time") {
        this.$set(this.DetailedContentListQueryParams, 'create_time', utcTimeBegin);
        this.$set(this.DetailedContentListQueryParams, 'create_end_time', utcTimeEnd);
      }
    },
    // clearTime(value, index) {
    //   this.$set(this.timedata, index, null);
    //   this.$set(this.DetailedContentListQueryParams, index, null);
    // },
    //搜索按钮
    EmptyQuery() {
      this.DetailedContentList.splice(0)
      this.DetailedContentListQueryParams.last_id = null
      this.getList()
    },
    DetailedContentSearchresetQuery() {

      this.DetailedContentListQueryParams.create_time = null, // 开始时间
        this.DetailedContentListQueryParams.create_end_time = null, // 结束时间
        this.timedata = {
          create_time: [], // 开始时间
          create_end_time: null, // 结束时间
        },
        this.getList()
    },

    /** 查询商户结算列表 */
    getList(mch_number) {
      let num = mch_number ? mch_number : this.mch_number
      if (this.DetailedContentLoading) {
        return
      }
      this.DetailedContentLoading = true;
      let query = {
        create_time: this.DetailedContentListQueryParams.create_time, // 开始时间
        create_end_time: this.DetailedContentListQueryParams.create_end_time, // 结束时间
        mch_num: num
      };
      listMchSettlement(query).then((response) => {
        this.DetailedContentList = response.rows;
        this.DetailedContentListQueryParams.total = this.DetailedContentList.length;
        this.$nextTick(() => {
          this.$refs.DetailedContentList.rebuildTable()
          this.DetailedContentLoading = false;

        })
      });

    },
    //分页处理
    handleCurrentChange(page) {
      this.DetailedContentListQueryParams.currentPage = page.page;
      this.DetailedContentLoading = true;
      this.$refs.DetailedContentList.Totop();
      this.getList();
    },
    handleSizeChange(size) {
      this.DetailedContentListQueryParams.pageSize = size;
    },
  },
  components: {
    dynamicTableVue
  }
};
</script>
