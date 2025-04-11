<template>
  <div style="
        " class="OrderRecords_table_search">

    <OrderAndSteam :queryParams="queryParams" :showSearch="showSearch">
      <template #search_option>
        <el-form-item label="商户" prop="mch_number" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
          <el-select v-model="queryParams.mch_number" placeholder="请选择商户" clearable class="w100_input">
            <el-option v-for="dict in MainAccount" :key="dict.id" :label="dict.mch_num" :value="dict.mch_num" />
          </el-select>

        </el-form-item>
        <el-form-item label="支付通道" prop="chnl_id" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
          <!-- <el-select v-model="queryParams.chnl_id" placeholder="请选择支付通道" clearable class="w100_input">
            <el-option v-for="dict in ChannelAccount" :key="dict.id" :label="dict.chnl_name" :value="dict.id" />
          </el-select> -->
          <ChannelQuery v-model="queryParams.chnl_id"></ChannelQuery>
        </el-form-item>
        <!-- <el-form-item label="主体账号" prop="MainAccount">
          <el-select   v-model="queryParams.MainAccount" placeholder="请选择主体账号" clearable
            class="w100_input">
            <el-option v-for="dict in MainAccount" :key="dict.id" :label="dict.accountName" :value="dict.id" />
          </el-select>
        </el-form-item> -->


        <el-form-item :label="'商户' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" prop="merchant_order_id">
          <el-input v-model="queryParams.merchant_order_id"
            :placeholder="'请输入商户' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item :label="'系统' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" prop="order_id">
          <el-input v-model="queryParams.order_id"
            :placeholder="'请输入系统' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item :label="'三方平台' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" prop="platform_order_id">
          <el-input v-model="queryParams.platform_order_id"
            :placeholder="'请输入三方平台' + ($route.query.type == 1 ? '代付' : '代收') + '订单号'" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item label="UTR" prop="UTR">
          <el-input v-model="queryParams.utr" placeholder="请输入UTR" clearable @clear="handleQuery" />
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="BatchSearchOrdersShow = true"
          v-hasPermi="['excellent:OrderRecords:edit']">批量查单</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="AddOrderShow = true"
          v-hasPermi="['excellent:OrderRecords:edit']">创建订单</el-button>
        <slot name="btn"></slot>

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
    <BatchDrawer :BatchList.sync="BatchList" :drawer.sync="BatchSearchOrdersShow">
      <div class="batch_div">
        <el-select v-model="BatchSelect" size="mini" style="width: 100%;">
          <el-option label="商户订单号" value="mch"></el-option>
          <el-option label="UTR" value="utr"></el-option>
          <el-option label="三方订单号" value="plat"></el-option>
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
// import BatchSearchOrders from './BatchSearchOrders.vue';
import BatchDrawer from "@/components/dialog/BatchDrawer.vue";
import AddOrder from "./AddOrderOut.vue";
import AddOrderIn from "./AddOrderIn.vue";

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
  data() {
    return {
      //添加订单
      AddOrderShow: false,
      //批量添加补单
      BatchSearchOrdersShow: false,
      BatchList: [],
      BatchSelect: 'mch',
      queryParams: {
        utr: null, //交易流水号
        mch_number: null,
        merchant_order_id: null,
        order_id: null,
        platform_order_id: null,
        chnl_id: null,
        // MainAccount: null, //商户的主体账户 暂不用
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
      //商户列表
      MainAccount: [],
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
  created() {
    this.getChnl()
    this.getMainAccount()

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
      this.queryParams.merchant_order_id_list = null
      this.queryParams.utr_list = null
      this.queryParams.platform_order_id_list = null
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.timedata = {
        create_time: [],
        update_time: []
      }
      this.queryParams = {
        utr: null,
        mch_number: null,
        merchant_order_id: null,
        order_id: null,
        platform_order_id: null,
        chnl_id: null,
        // MainAccount: null, //商户的主体账户 暂不用
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

      this.handleQuery();
    },
    //批量查单
    ConfirmBatchSearch() {
      if (this.BatchList.length == 0) {
        this.$message({
          message: '请先输入商户订单号',
          type: 'warning'
        })
        return
      }
      this.BatchSearchOrdersShow = false
      this.loading = true
      this.restListQuery()

      if (this.BatchSelect == 'utr') {
        this.queryParams.utr_list = JSON.parse(JSON.stringify(this.BatchList))
      }
      if (this.BatchSelect == 'mch') {
        this.queryParams.merchant_order_id_list = JSON.parse(JSON.stringify(this.BatchList))
      }
      if (this.BatchSelect == 'plat') {
        this.queryParams.platform_order_id_list = JSON.parse(JSON.stringify(this.BatchList))

      }
      this.BatchList.splice(0)
      this.$emit('ReturnSearch', this.RearrangeParams());
    },
    ConfirmBatchExport() {
      if (this.BatchList.length == 0) {
        this.$message({
          message: '请先输入商户订单号',
          type: 'warning'
        })
        return
      }
      this.BatchSearchOrdersShow = false
      this.loading = true
      const query = {
        time_type: this.TabsChangeStatus,
        order_type: Number(this.$route.query.type),
      }
      if (this.BatchSelect == 'utr') {
        query['utr_list'] = JSON.parse(JSON.stringify(this.BatchList))
      }
      if (this.BatchSelect == 'mch') {
        query['merchant_order_id_list'] = JSON.parse(JSON.stringify(this.BatchList))
      }
      if (this.BatchSelect == 'plat') {
        query['platform_order_id_list'] = JSON.parse(JSON.stringify(this.BatchList))

      }
      this.BatchList.splice(0)
      this.download.DownloadOrderXlsx('/order/download/commit', query, ('批量导出' + (this.$route.query.type == 1 ? '代付' : '代收') + '订单记录'));
    },
    //参数进行重新分配整理
    RearrangeParams() {
      const { merchant_order_id, merchant_order_id_list, utr, utr_list, platform_order_id, platform_order_id_list, ...obj } = this.queryParams;

      const queryParams = {
        ...obj,
        ...(merchant_order_id ? { merchant_order_id_list: [merchant_order_id] } : {}), // 仅在有值时添加
        ...(merchant_order_id_list ? { merchant_order_id_list } : {}), // 仅在有值时添加
        ...(utr ? { utr_list: [utr] } : {}), // 仅在有值时添加
        ...(utr_list ? { utr_list } : {}), // 仅在有值时添加
        ...(platform_order_id ? { platform_order_id_list: [platform_order_id] } : {}), // 仅在有值时添加
        ...(platform_order_id_list ? { platform_order_id_list } : {}) // 仅在有值时添加
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
        if (params['mch_number']) {
          TimeFrame += params['mch_number'] + '_'
        }
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
    //查询支付通道
    getChnl() {
      if (!this.hasPermiVisible(['excellent:OrderRecords:platform'])) {
        return
      }
      listChnlSetting().then(response => {
        this.PaymentChannel = response.rows
        return response.rows
      });


    },
    //查询主账户
    getMainAccount() {
      listMchSetting().then(response => {
        this.MainAccount = response.rows

        return response.rows
      });
    },

  },
  components: {
    TimeFrameVue,
    OrderAndSteam,
    AddOrder,
    ChannelQuery, BatchDrawer, AddOrderIn
  }
};
</script>
<style lang="scss" scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 8px;
}

::v-deep .el-form--label-top .el-form-item__label {
  padding: 0 0 6px 0;
}

::v-deep .el-date-editor--datetimerange.el-input,
.el-date-editor--datetimerange.el-input__inner {
  width: 100%;
}

::v-deep .el-range-editor .el-range-input::placeholder {
  font-size: 13px
}

.OrderRecords_table_search {
  padding: 0 16px 8px 16px;
  // margin-bottom: 20px;

  //   .search_option_div {
  //     display: grid;
  //     grid-auto-rows: 1fr;
  //     gap: 0 8px;
  //     /* 行高均等 */
  //     // grid-template-rows: repeat(2, 1fr);
  //     /* 强制分为两行 */
  //     grid-template-columns: repeat(auto-fill, minmax(245px, 19.5%));

  //   }
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
