<template>
  <div>
    <OrderAndSteam :queryParams="queryParams" :showSearch="showSearch">
      <template #search_option>
        <el-form-item v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" label="商户" prop="mch_number_list">
          <MchNumSelect v-model="queryParams.mch_number_list" class="w100_input" multiple collapse-tags> </MchNumSelect>

        </el-form-item>

        <!-- <el-form-item v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" label="支付通道" prop="chnl_id">
          <ChannelQuery v-model="queryParams.chnl_id"></ChannelQuery>
        </el-form-item> -->

        <el-form-item :label="'商户订单号'" prop="merchant_order_id">
          <el-input v-model="queryParams.merchant_order_id" :placeholder="'请输入商户订单号'" clearable @clear="handleQuery" />
        </el-form-item>

        <el-form-item :label="'订单号'" prop="order_id">
          <NumberInput v-model="queryParams.order_id" :placeholder="'请输入订单号'" clearable @clear="handleQuery">
          </NumberInput>
        </el-form-item>

        <el-form-item label="资金变动原因" prop="msg">
          <el-select v-model="queryParams.msg" placeholder="请选择资金变动原因" clearable class="w100_input">
            <template v-for="dict in msgList">
              <el-option :key="dict.value" :label="dict.name" :value="dict.value" />

            </template>

          </el-select>
        </el-form-item>

        <el-form-item label="交易类型" prop="msg">
          <el-select v-model="queryParams.operation" placeholder="请选择操作类型" class="w100_input"
            @change="DealOperationList">
            <template v-for="dict in operationList">
              <el-option :key="dict.value" :label="dict.name" :value="dict.value" />
            </template>

          </el-select>
        </el-form-item>
        <el-form-item label="订单类型" prop="msg" v-if="TypeParameter.stream_type == 'total'">
          <el-select v-model="queryParams.type" placeholder="请选择交易类型" class="w100_input">
            <template v-for="dict in typelist">
              <el-option :key="dict.value" :label="dict.name" :value="dict.value"
                v-show="dict.show.includes(queryParams.operation) || dict.show.includes('all')" />
            </template>

          </el-select>
        </el-form-item>
        <el-form-item label="订单创建时间" prop="create_time" class="large">
          <TimeFrameVue v-model="timedata.create_time" @parseTime="parseTime" :ParameterIndex="'create_time'">
          </TimeFrameVue>

        </el-form-item>

        <el-form-item label="流水更新时间" prop="update_time" class="large">
          <TimeFrameVue v-model="timedata.update_time" @parseTime="parseTime" :ParameterIndex="'update_time'">
          </TimeFrameVue>

        </el-form-item>

      </template>

      <template #search_btn>
        <div>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
          <el-button type="warning" plain icon="el-icon-search" size="mini" v-hasPermi="['excellent:OrderRecords:edit']"
            @click="BatchSearch">批量查单</el-button>
          <slot name="btn"></slot>
          <el-popover placement="bottom" width="80%" trigger="click" style="margin-left: 10px;">
            <span class="CalculationFormula">
              <strong>（本模块依据<span class="redcolor">代收订单更新时间</span>和<span class="redcolor">代付订单更新时间</span>）</strong>
              <strong>账户余额=待结算金额+账户可用余额+代付余额+账户冻结金额（扣除的是账户可用余额）</strong>
              <strong>代付余额=代付可用余额+代付冻结金额</strong>
            </span>
            <el-button slot="reference" icon="el-icon-s-opportunity" size="mini"></el-button>
          </el-popover>
        </div>


      </template>

    </OrderAndSteam>
    <BatchDrawer :BatchList.sync="BatchList" :drawer.sync="BatchSearchOrdersShow">
      <div class="batch_div">

        <div class="batch_div_btn_div">
          <el-button type="info" style="" class=" batch_div_btn " size="small" @click="ConfirmBatchExport"
            icon="el-icon-download">批量导出</el-button>
          <el-button type="warning" style="" class=" batch_div_btn " size="small" @click="ConfirmBatchSearch"
            icon="el-icon-search">批量查询</el-button>
        </div>

      </div>
    </BatchDrawer>
  </div>

</template>

<script>
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting";
import ChannelQuery from "@/components/Excellent/Channel/ChannelQuery.vue";
import OrderAndSteam from "@/components/Excellent/SearchLayout/OrderAndSteam.vue";
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';
import BatchDrawer from "@/components/dialog/BatchDrawer.vue";
import NumberInput from "@/components/element/NumberInput.vue";
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";

export default {
  name: 'WorkspaceJsonOrderSearch',

  props: ['showSearch', 'TypeParameter'],
  data() {
    return {
      queryParams: {
        mch_number_list: null,
        merchant_order_id: null,
        order_id: null,
        chnl_id: null,
        type: null,//交易类型
        msg: null,
        operation: null,
        //创建时间
        create_time: null,
        create_end_time: null,
        //更新时间
        update_time: null,
        update_end_time: null,
        merchant_order_id_list: null,//商户订单号列表
      },
      timedata: {
        create_time: [],
        update_time: []
      },
      BatchList: [],
      BatchSearchOrdersShow: false,


      typelist: [
        { name: '全部', value: null, show: ['all'] },
        { name: '代收', value: 0, show: [0, null] },
        { name: '代付', value: 1, show: [0, null] },
      ],

    };
  },

  computed: {
    msgList() {
      if (this.TypeParameter.type == 0) {
        return [
          { name: 'Increase', value: 'Increase', show: '0' },
        ]
      }
      if (this.TypeParameter.type == 1) {
        return [{ name: 'Refund', value: 'Refund', show: '1' },
        { name: 'Reduce', value: 'Reduce', show: '1' },
        { name: 'Frozen', value: 'Frozen', show: '1' },]
      }
      return [
        { name: 'Refund', value: 'Refund', show: '1' },
        { name: 'Reduce', value: 'Reduce', show: '1' },
        { name: 'Frozen', value: 'Frozen', show: '1' },
        { name: 'Increase', value: 'Increase', show: '0' },
      ]
    },
    operationList() {
      let operationList
      if (this.TypeParameter.stream_type == 'total') {
        return operationList = [
          { name: '全部', value: null, },
          { name: '代收代付记录', value: 0, },
          { name: '账户待结算余额调整记录', value: 1, },
          { name: '账户代付可用余额调整记录', value: 2, },
          { name: '账户可用余额调整记录', value: 3, },
        ]
      }
      if (this.TypeParameter.stream_type == 'payin') {
        return operationList = [
          { name: '全部', value: null, },
          { name: '代收记录', value: 0, },
          { name: '账户待结算余额调整记录', value: 1, },
          { name: '账户可用余额调整记录', value: 3, },
        ]
      }
      if (this.TypeParameter.stream_type == 'payout') {
        return operationList = [
          { name: '全部', value: null, },
          { name: '代付记录', value: 0, },
          { name: '账户代付可用余额调整记录', value: 2, },
        ]
      }
      return operationList
    }
  },

  mounted() {
    this.handleQuery();
  },

  created() {
    // if (this.hasPermiVisible(['excellent:OrderRecords:platform'])) {
    //   Promise.all([this.getMainAccount()]);
    // }
  },

  components: {
    OrderAndSteam, TimeFrameVue, ChannelQuery, BatchDrawer, MchNumSelect, NumberInput
  },

  methods: {
    BatchSearch() {
      this.BatchList = [];
      this.BatchSearchOrdersShow = true;
    },
    //处理全部的筛选项，赋值为null
    DealOperationList(value) {

      if (value == 1 || value == 3 || value == 2) {
        this.queryParams.type = null;
      }

    },
    //输出utc时间
    parseTime(value, index) {
      let utcTime = value[0];
      let utcEndTime = value[1]
      if (index == 'create_time') {
        this.$set(this.queryParams, 'create_time', utcTime ? utcTime : null);
        this.$set(this.queryParams, 'create_end_time', utcEndTime ? utcEndTime : null);
      }
      if (index == 'update_time') {
        this.$set(this.queryParams, 'update_time', utcTime ? utcTime : null);
        this.$set(this.queryParams, 'update_end_time', utcEndTime ? utcEndTime : null);
      }

    },
    //参数处理
    ParamsDeal() {
      // utr, utr_list, platform_order_id, platform_order_id_list,
      const { merchant_order_id, merchant_order_id_list, ...obj } = this.queryParams;

      const queryParams = {
        ...obj,
        ...(merchant_order_id ? { merchant_order_id_list: [merchant_order_id] } : {}), // 仅在有值时添加
        ...(merchant_order_id_list ? { merchant_order_id_list } : {}), // 仅在有值时添加
      };

      return queryParams;

    },

    handleQuery() {
      this.queryParams.merchant_order_id_list = null
      this.$emit('ReturnSearch', this.ParamsDeal());
    },
    RequestingDataAgain() {
      this.queryParams.merchant_order_id_list = null
      this.$emit('RequestingDataAgain', this.ParamsDeal());
    },
    ConfirmBatchExport() {
      this.queryParams.merchant_order_id_list = this.BatchList;
      let { stream_type } = this.TypeParameter
      let type
      const params = { ...this.ParamsDeal(), stream_type };
      if (this.TypeParameter.stream_type == 'total') {
        params['order_type'] = this.queryParams.type
      } else {
        params['order_type'] = this.TypeParameter.type
      }

      this.BatchSearchOrdersShow = false;

      this.download.DownloadXlsx('/stream/download/commit', params, ('批量导出流水记录'));
    },
    ConfirmBatchSearch() {
      this.queryParams.merchant_order_id_list = this.BatchList;
      this.BatchSearchOrdersShow = false;
      this.$emit('ReturnSearch', this.ParamsDeal());
    },
    resetQuery() {
      this.timedata = { create_time: null, end_time: null };
      this.queryParams = {
        mch_number_list: null,
        merchant_order_id: null,
        order_id: null,
        chnl_id: null,
        create_time: null,
        end_time: null,
        msg: null,
        operation: null,
        type: null,//交易类型
        merchant_order_id_list: null,//商户订单号列表
      }
      this.queryParams.create_end_time = null
      this.queryParams.create_time = null
      this.queryParams.update_time = null
      this.queryParams.update_end_time = null
      this.handleQuery();
    },

    handleExport() {

      if ((this.queryParams.create_end_time && this.queryParams.create_time) || (this.queryParams.update_time && this.queryParams.update_end_time)) {
        let { stream_type } = this.TypeParameter
        let type
        const params = { ...this.ParamsDeal(), stream_type };
        if (this.TypeParameter.stream_type == 'total') {
          params['order_type'] = this.queryParams.type
        } else {
          params['order_type'] = this.TypeParameter.type
        }

        let TimeFrame = ''
        // if (params['mch_number']) {
        //   TimeFrame += params['mch_number'] + '_'
        // }
        if (this.queryParams.create_time && this.queryParams.create_end_time) {
          TimeFrame += this.Formatter.FormatTime(this.queryParams.create_time * 1000, 'YYYY-MM-DD') + '-' + this.Formatter.FormatTime(this.queryParams.create_end_time * 1000, 'YYYY-MM-DD') + "_"
        }
        if (this.queryParams.update_time && this.queryParams.update_end_time) {
          if (this.queryParams.create_time && this.queryParams.create_end_time) {
            TimeFrame += "创建时间_"
          } else {
            TimeFrame += this.Formatter.FormatTime(this.queryParams.update_time * 1000, 'YYYY-MM-DD') + '-' + this.Formatter.FormatTime(this.queryParams.update_end_time * 1000, 'YYYY-MM-DD') + "_"

          }
        }
        if (params['order_type'] == 1) {
          TimeFrame += '代付'
        }
        if (params['order_type'] == 0) {
          TimeFrame += '代收'
        }

        this.download.DownloadXlsx('/stream/download/commit', params, (TimeFrame + '流水记录'));
      } else {
        this.$message({
          message: '请选择创建时间/更新时间',
          type: 'warning'
        })
        return
      }
    },

    // //获取筛选项的列表数据
    // getChnl() {
    //   return listChnlSetting().then(response => {
    //     this.PaymentChannel = response.rows;
    //   });
    // },

    // getMainAccount() {
    //   return listMchSetting().then(response => {
    //     this.MainAccount = response.rows;
    //   });
    // },
  },
};
</script>
