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
          <el-select v-model="queryParams.chnl_id" placeholder="请选择支付通道" clearable class="w100_input">
            <el-option v-for="dict in ChannelAccount" :key="dict.id" :label="dict.chnl_name" :value="dict.chnl_name" />
          </el-select>

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
          <!-- <el-date-picker v-model="timedata.update_time" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间"
            @change="parseTime($event, 'update_time')">
          </el-date-picker> -->
        </el-form-item>




      </template>
      <template #search_btn>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
        <slot name="btn"></slot>

      </template>

    </OrderAndSteam>
    <!-- <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-position="top"
      label-width="140px">

      <div class="FlexStart">


      </div>
    </el-form> -->

  </div>
</template>

<script>
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting"
import OrderAndSteam from "@/components/Excellent/SearchLayout/OrderAndSteam.vue";
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';
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
      queryParams: {
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
        update_end_time: null
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
    this.getChnlAccConfig()

  },


  methods: {
    // 时间格式化
    parseTime(value, index) {
      // console.log(value, index);
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

      // let utcTime = this.$util.getUtcTime(value) / 1000;

      // this.$set(this.timedata, index, value);
      // this.$set(this.queryParams, index, utcTime ? utcTime : null);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      console.log("数据请求");

      this.$emit('ReturnSearch', this.queryParams);
    },
    RequestingDataAgain() {

      this.$emit('RequestingDataAgain', this.queryParams);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.timedata = {
        create_time: [],
        update_time: []
      }
      this.queryParams = {
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
        update_end_time: null
      }

      this.handleQuery();
    },

    //导出功能
    handleExport() {
      if ((this.queryParams.create_end_time && this.queryParams.create_time) || (this.queryParams.update_time && this.queryParams.update_end_time)) {
        let params = {
          ...this.queryParams,
        }
        params['time_type'] = this.TabsChangeStatus
        params['type'] = this.$route.query.type
        this.download.DownloadXlsx('/order/download/commit', params);
        // SubmitDownloadOrder(params).then(res => {
        //   console.log(res);
        // })
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
    //查询通道账户列表
    getChnlAccConfig() {
      if (!this.hasPermiVisible(['excellent:OrderRecords:platform'])) {
        return
      }
      listChnlSetting().then(response => {
        this.ChannelAccount = response.rows
        return response.rows
      });

    }
  },
  components: {
    TimeFrameVue,
    OrderAndSteam,

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
</style>
