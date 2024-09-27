<template>
  <el-dialog :title="'结算详细'" :visible.sync="DetailedContentShowData" width="80%" append-to-body>

    <div class="fulltable_div" style="min-height: 70vh;">
      <el-form ref="DetailedContentSearch" size="small" :inline="true" label-width="120px">

        <el-form-item label="查询起始时间" prop="create_time">
          <el-date-picker v-model="timedata.create_time" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder="请选择查询起始时间" style="width: 200px" @change="parseTime($event, 'create_time')"
            @clear="clearTime('create_time')" />
        </el-form-item>

        <el-form-item label="查询截止时间" prop="end_time">
          <el-date-picker v-model="timedata.end_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择查询截止时间" style="width: 200px" @change="parseTime($event, 'end_time')"
            @clear="clearTime('end_time')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="EmptyQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="DetailedContentSearchresetQuery">重置</el-button>
        </el-form-item>
      </el-form>


      <dynamicTableVue :tableData="DetailedContentPaginatedItems" :loading="DetailedContentLoading"
        ref="DetailedContentList">

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
        <el-table-column label="创建时间" align="center" prop="create_time" :formatter="Formatter.TableAmount">
          <template slot-scope="scope">
            {{ Formatter.FormatTime(scope.row.create_time * 1000) }}
          </template>

        </el-table-column>



      </dynamicTableVue>
      <pagination ref="pagination" v-show="DetailedContentTotalPages > 0" :total="DetailedContentTotalPages"
        :page.sync="DetailedContentListQueryParams.currentPage" :limit.sync="DetailedContentListQueryParams.pageSize"
        @pagination="handleCurrentChange" />
    </div>

  </el-dialog>

</template>

<script>
import { listMchSettlement } from "@/api/excellent/mchSettlement";
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
        end_time: null, // 结束时间
        last_id: null, // 上一次查询的id
        pageSize: 20, // 每页显示的条数,
        total: 1
      },
      timedata: {
        create_time: null, // 开始时间
        end_time: null, // 结束时间
      },
      DetailedContentLoading: false
    };
  },
  computed: {
    DetailedContentShowData: {
      set(value) {
        this.DetailedContentListQueryParams = {
          create_time: null, // 开始时间
          end_time: null, // 结束时间
          last_id: null, // 上一次查询的id
          pageSize: 20, // 每页显示的条数
          total: 1
        },
          this.timedata = {
            create_time: null, // 开始时间
            end_time: null, // 结束时间
          },
          this.DetailedContentList.splice(0)
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
    mch_number(newval) {
      this.getList()
    }
  },

  mounted() {

  },

  methods: {
    parseTime(value, index) {

      let utcTime = this.$util.getUtcTime(value) / 1000;
      this.$set(this.timedata, index, value);
      this.$set(this.DetailedContentListQueryParams, index, utcTime ? utcTime : null);
    },
    clearTime(value, index) {
      this.$set(this.timedata, index, null);
      this.$set(this.DetailedContentListQueryParams, index, null);
    },
    //搜索按钮
    EmptyQuery() {
      this.DetailedContentList.splice(0)
      this.DetailedContentListQueryParams.last_id = null

      this.getList()
    },
    DetailedContentSearchresetQuery() {
      this.DetailedContentListQueryParams.create_time = null, // 开始时间
        this.DetailedContentListQueryParams.end_time = null, // 结束时间
        this.DetailedContentListQueryParams.last_id = null, // 上一次查询的id
        this.timedata = {
          create_time: null, // 开始时间
          end_time: null, // 结束时间
        },
        this.getList()
    },

    /** 查询商户结算列表 */
    getList() {
      if (this.DetailedContentLoading) {
        return
      }
      this.DetailedContentLoading = true;
      let query = {
        create_time: this.DetailedContentListQueryParams.create_time, // 开始时间
        end_time: this.DetailedContentListQueryParams.end_time, // 结束时间
        last_id: this.DetailedContentListQueryParams.last_id, // 上一次查询的id
        mch_number: this.mch_number

      };
      listMchSettlement(query).then((response) => {
        this.DetailedContentListQueryParams.last_id = response["last_id"];
        this.DetailedContentList = [...this.DetailedContentList, ...response.results];
        this.DetailedContentListQueryParams.total = this.DetailedContentList.length;
        this.DetailedContentLoading = false;
      });

    },
    //分页处理
    handleCurrentChange(page) {
      this.DetailedContentListQueryParams.currentPage = page.page;
      this.DetailedContentLoading = true;
      this.$refs.DetailedContentList.Totop();

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
    dynamicTableVue
  }
};
</script>
