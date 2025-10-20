<template>
  <div style="
        " class="OrderRecords_table_search">

    <OrderAndSteam :queryParams="queryParams" :showSearch="showSearch">
      <template #search_option>
        <el-form-item label="商户" prop="mch_number_list" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
          <MchNumSelect v-model="queryParams.mch_number_list" placeholder="请选择商户" clearable class="w100_input" multiple
            filterable collapse-tags>
          </MchNumSelect>
        </el-form-item>
        <el-form-item label="支付通道" prop="chnl_id" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">

          <ChannelQuery v-model="queryParams.chnl_id"></ChannelQuery>
        </el-form-item>



        <el-form-item :label="'商户' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" prop="merchant_order_id">
          <el-input v-model="queryParams.merchant_order_id"
            :placeholder="'请输入商户' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" clearable @clear="handleQuery"
            @change="restListQuery" />
        </el-form-item>
        <el-form-item :label="'系统' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" prop="order_id">
          <el-input v-model="queryParams.order_id"
            :placeholder="'请输入系统' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item :label="'三方平台' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" prop="platform_order_id"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
          <el-input v-model="queryParams.platform_order_id"
            :placeholder="'请输入三方平台' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" clearable @clear="handleQuery"
            @change="restListQuery" />
        </el-form-item>
        <el-form-item label="UTR" prop="UTR">
          <el-input v-model="queryParams.utr" placeholder="请输入UTR" clearable @clear="handleQuery"
            @change="restListQuery" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable class="w100_input">
            <el-option v-for="dict in OrderStatus" :key="dict.value" :label="dict.name" :value="dict.value"
              v-show="dict.show == TabsChangeStatus" />
          </el-select>

        </el-form-item>
        <el-form-item label="回调状态" prop="callback_status">
          <el-select v-model="queryParams.callback_status" placeholder="请选择订单状态" clearable class="w100_input">
            <el-option v-for="dict in callbackStatus" :key="dict.value" :label="dict.name" :value="dict.value" />
          </el-select>

        </el-form-item>
        <el-form-item label="创建时间" prop="create_time" class="large">
          <TimeFrameVue v-model="timedata.create_time" @parseTime="parseTime" :ParameterIndex="'create_time'">
          </TimeFrameVue>
          <!-- <el-date-picker v-model="timedata.create_time" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间"
            @change="parseTime($event, 'create_time')">
          </el-date-picker> -->
        </el-form-item>
        <el-form-item label="更新时间" prop="update_time" class="large">
          <TimeFrameVue v-model="timedata.update_time" @parseTime="parseTime" :ParameterIndex="'update_time'">
          </TimeFrameVue>

        </el-form-item>




      </template>
      <template #search_btn>
        <div>
          <el-tooltip :content="BathSearchTips + '搜索'" placement="top" effect="light" v-if="BatchList.length > 0">
            <el-button type="warning" icon="el-icon-search" size="mini" @click="handleQuery">批量搜索</el-button>
          </el-tooltip>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" v-else>搜索</el-button>

          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          <el-tooltip :content="BathSearchTips + '导出'" placement="top" effect="light" v-if="BatchList.length > 0">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="ConfirmBatchExport">批量导出</el-button>
          </el-tooltip>
          <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
            v-else>导出</el-button>


          <el-button type="primary" icon="el-icon-search" size="mini" @click="BatchSearchOrdersShow = true"
            v-hasPermi="['excellent:OrderRecords:edit']">批量查单</el-button>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="AddOrderShow = true"
            v-hasPermi="['excellent:OrderRecords:edit']">创建订单</el-button>
          <slot name="btn"></slot>

        </div>




      </template>

    </OrderAndSteam>
    <!-- <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-position="top"
      label-width="140px">

      <div class="FlexStart">


      </div>
    </el-form> -->
    <!-- 输入订单号的方式进行查单 -->
    <!-- <BatchSearchOrders v-model="BatchSearchOrdersShow" @ConfirmBatchSearch="ConfirmBatchSearch"
      @ConfirmBatchExport="ConfirmBatchExport"></BatchSearchOrders> -->
    <BatchDrawer :BatchList.sync="BatchList" :drawer.sync="BatchSearchOrdersShow" @change="BathListChange">
      <div class="batch_div">
        <el-select v-model="BatchSelect" size="mini" style="width: 100%;">
          <el-option :label="item.label" :value="item.value" v-for="item in BatchSelectOptions"
            :key="item.value"></el-option>
        </el-select>
        <div class="batch_div_btn_div">
          <el-button type="info" style="" class=" batch_div_btn " size="small" @click="ConfirmBatchExport"
            icon="el-icon-download">批量导出</el-button>
          <el-button type="warning" style="" class=" batch_div_btn " size="small" @click="ConfirmBatchSearch"
            icon="el-icon-search">批量查询</el-button>
        </div>

      </div>
    </BatchDrawer>
    <!-- 添加订单 -->
    <AddOrder :show.sync="AddOrderShow" v-if="parseInt($route.query.type) == 1"></AddOrder>
    <AddOrderIn :show.sync="AddOrderShow" v-if="parseInt($route.query.type) == 0"></AddOrderIn>
  </div>
</template>

<script>

import { listChnlSetting } from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting"
import ChannelQuery from "@/components/Excellent/Channel/ChannelQuery.vue";
import OrderAndSteam from "@/components/Excellent/SearchLayout/OrderAndSteam.vue";
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';
import BatchDrawer from "@/components/dialog/BatchDrawer.vue";
import AddOrder from "./AddOrderOut.vue";
import AddOrderIn from "./AddOrderIn.vue";
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";

export default {
  name: 'WorkspaceJsonOrderSearch',
  props: {
    'showSearch': {
      type: Boolean,
      default: true
    },
    'TabsChangeStatus': {
      type: [String, Number],
      default: 0


    },
  },
  computed: {
    BathSearchTips() {
      return '正在使用' + this.BatchSelectOptions.find(item => item.value == this.BatchSelect).label + '批量'
    }
  },
  data() {
    return {
      //添加订单
      AddOrderShow: false,
      //批量添加补单
      BatchSearchOrdersShow: false,
      BatchList: [],
      BatchSelect: 'mch',
      BatchSelectOptions: [
        {
          label: '商户订单号',
          value: 'mch'
        },
        {
          label: 'UTR',
          value: 'utr'
        },
        {
          label: '三方订单号',
          value: 'plat'
        },

      ],
      queryParams: {
        utr: null, //交易流水号
        mch_number_list: null,
        merchant_order_id: null,
        order_id: null,
        platform_order_id: null,
        chnl_id: null,
        status: null,
        end_time: null,
        callback_status: null, //回调状态
        //创建时间
        create_time: null,
        create_end_time: null,
        //更新时间
        update_time: null,
        update_end_time: null,
        utr_list: null,
        merchant_order_id_list: null,
        platform_order_id_list: null,
      },

      //展示用
      timedata: {
        // create_time: null,
        // end_time: null
        create_time: [],
        update_time: []
      },
      //支付通道
      PaymentChannel: [],

      //通道账户配置列表
      ChannelAccount: [],
      //订单状态
      // （0-成功，1-失败，2-超时，5-已处理，6-已提交）
      OrderStatus: [
        {
          name: '成功',
          value: 0,
          show: 'history'
        },
        {
          name: '失败',
          value: 1,
          show: 'history'
        },
        {
          name: '超时',
          value: 2,
          show: 'history'
        },
        {
          name: '已处理',
          value: 5,
          show: 'now'
        },
        {
          name: '已提交',
          value: 6,
          show: 'now'
        }

      ],
      callbackStatus: [
        {
          name: '已回调',
          value: 1,
        },
        {
          name: '未回调',
          value: 0,
        },

      ]
    };
  },

  mounted() {
    this.handleQuery();

  },



  methods: {
    // 时间格式化
    parseTime(value, index) {
      let utcTime, utcEndTime = null;
      if (value) {
        utcTime = value[0];
        utcEndTime = value[1];
      }
      if (index == 'create_time') {
        this.$set(this.queryParams, 'create_time', utcTime ? utcTime : null);
        this.$set(this.queryParams, 'create_end_time', utcEndTime ? utcEndTime : null);
      }
      if (index == 'update_time') {
        this.$set(this.queryParams, 'update_time', utcTime ? utcTime : null);
        this.$set(this.queryParams, 'update_end_time', utcEndTime ? utcEndTime : null);
      }


    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.restListQuery()
      this.$emit('ReturnSearch', this.RearrangeParams());
    },
    RequestingDataAgain() {

      this.$emit('RequestingDataAgain', this.RearrangeParams());
    },
    //重置列表的查询参数
    restListQuery() {
      if (this.queryParams.merchant_order_id) {
        this.queryParams.merchant_order_id_list = null
        this.BatchList.splice(0, this.BatchList.length)
      }
      if (this.queryParams.utr) {
        this.queryParams.utr_list = null
        this.BatchList.splice(0, this.BatchList.length)
      }
      if (this.queryParams.platform_order_id) {
        this.queryParams.platform_order_id_list = null
        this.BatchList.splice(0, this.BatchList.length)
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.timedata = {
        create_time: [],
        update_time: []
      }
      this.queryParams = {
        utr: null,
        mch_number_list: null,
        merchant_order_id: null,
        order_id: null,
        platform_order_id: null,
        chnl_id: null,
        status: null,
        end_time: null,
        callback_status: null, //回调状态
        //创建时间
        create_time: null,
        create_end_time: null,
        //更新时间
        update_time: null,
        update_end_time: null,
        utr_list: null,
        merchant_order_id_list: null,
        platform_order_id_list: null,
      }
      this.BatchList.splice(0, this.BatchList.length)
      this.handleQuery();
    },
    //批量查单
    beforeBath() {
      if (this.BatchList.length == 0) {
        this.$message({
          message: '请先输入商户订单号',
          type: 'warning'
        })
        return false
      }
      this.BatchSearchOrdersShow = false
      this.loading = true
      if (this.BatchSelect == 'utr') {
        this.queryParams.utr_list = this.BatchList.length > 0 ? this.BatchList : null
      }
      if (this.BatchSelect == 'mch') {
        this.queryParams.merchant_order_id_list = this.BatchList.length > 0 ? this.BatchList : null
      }
      if (this.BatchSelect == 'plat') {
        this.queryParams.platform_order_id_list = this.BatchList.length > 0 ? this.BatchList : null
      }
      return true
    },
    //批量列表改变
    BathListChange() {
      if (this.queryParams.merchant_order_id) {
        this.queryParams.merchant_order_id = null
      }
      if (this.queryParams.utr) {
        this.queryParams.utr = null
      }
      if (this.queryParams.platform_order_id) {
        this.queryParams.platform_order_id = null
      }
    },
    ConfirmBatchSearch() {
      if (this.beforeBath()) {
        this.$emit('ReturnSearch', this.RearrangeParams());

      }
    },
    ConfirmBatchExport() {
      if (this.beforeBath()) {
        const query = {
          time_type: this.TabsChangeStatus,
          order_type: Number(this.$route.query.type),
          ...this.RearrangeParams()
        }
        this.download.DownloadOrderXlsx('/order/download/commit', query, ('批量导出' + (this.$route.query.type == 1 ? '代付' : '代收') + '订单记录'));
      }
    },
    //参数进行重新分配整理
    RearrangeParams() {
      const { merchant_order_id, merchant_order_id_list, utr, utr_list, platform_order_id, platform_order_id_list, ...obj } = this.queryParams;
      const queryParams = {
        ...obj,
        ...(merchant_order_id ? { merchant_order_id_list: [merchant_order_id] } : {}), // 仅在有值时添加
        ...(merchant_order_id_list && merchant_order_id_list.length > 0 ? { merchant_order_id_list } : {}), // 仅在有值时添加
        ...(utr ? { utr_list: [utr] } : {}), // 仅在有值时添加
        ...(utr_list && utr_list.length > 0 ? { utr_list } : {}), // 仅在有值时添加
        ...(platform_order_id ? { platform_order_id_list: [platform_order_id] } : {}), // 仅在有值时添加
        ...(platform_order_id_list && platform_order_id_list.length > 0 ? { platform_order_id_list } : {}) // 仅在有值时添加
      };

      return queryParams;

    },
    //导出功能
    handleExport(query) {
      if ((this.queryParams.create_end_time && this.queryParams.create_time) || (this.queryParams.update_time && this.queryParams.update_end_time)) {
        let params = { ...this.RearrangeParams() }
        params['time_type'] = this.TabsChangeStatus
        params['order_type'] = Number(this.$route.query.type)
        let TimeFrame = ''
        // if (params['mch_number_list']) {
        //   TimeFrame += params['mch_number_list'] + '_'
        // }
        if (this.queryParams.create_time && this.queryParams.create_end_time) {
          TimeFrame += this.Formatter.FormatTime(this.queryParams.create_time * 1000, 'YYYY-MM-DD') + '-' + this.Formatter.FormatTime(this.queryParams.create_end_time * 1000, 'YYYY-MM-DD') + "_"
        }
        if (this.queryParams.update_time && this.queryParams.update_end_time) {
          TimeFrame += this.Formatter.FormatTime(this.queryParams.update_time * 1000, 'YYYY-MM-DD') + '-' + this.Formatter.FormatTime(this.queryParams.update_end_time * 1000, 'YYYY-MM-DD') + "_"
        }
        this.download.DownloadOrderXlsx('/order/download/commit', params, (TimeFrame + (this.$route.query.type == 1 ? '代付' : '代收') + '订单记录'));

      } else {
        this.$message({
          message: '请选择创建时间/更新时间',
          type: 'warning'
        })
        return
      }
    },



  },
  components: {
    TimeFrameVue,
    OrderAndSteam,
    AddOrder,
    ChannelQuery, BatchDrawer, AddOrderIn, MchNumSelect
  }
};
</script>
<style lang="scss" scoped>
// ::v-deep .el-form-item--mini.el-form-item {
//   margin-bottom: 8px;
// }

// ::v-deep .el-form--label-top .el-form-item__label {
//   padding: 0 0 6px 0;
// }

::v-deep .el-date-editor--datetimerange.el-input,
.el-date-editor--datetimerange.el-input__inner {
  width: 100%;
}

::v-deep .el-range-editor .el-range-input::placeholder {
  font-size: 13px
}


.batch_div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;

  .batch_div_btn_div {
    display: flex;
    width: 100%;
    margin-top: 12px;

    .batch_div_btn {

      flex: 1;
    }
  }


}
</style>
