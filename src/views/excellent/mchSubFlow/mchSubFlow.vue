<template>
  <OrderAndSteam :queryParams="queryParams" :showSearch="showSearch" :gridwidth="'24.5%'">
    <template #search_option>
      <el-form-item v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" label="商户" prop="mch_number">
        <el-select v-model="queryParams.mch_number" placeholder="请选择商户" clearable class="w100_input">
          <el-option v-for="dict in MainAccount" :key="dict.id" :label="dict.mch_num" :value="dict.mch_num" />
        </el-select>
      </el-form-item>



      <!-- <el-form-item label="资金变动原因" prop="msg">
        <el-select v-model="queryParams.msg" placeholder="请选择资金变动原因" clearable class="w100_input">
          <template v-for="dict in msgList">
            <el-option :key="dict.value" :label="dict.name" :value="dict.value" />

          </template>

</el-select>
</el-form-item> -->
      <el-form-item label="交易类型" prop="msg">
        <el-select v-model="queryParams.operation" placeholder="请选择操作类型" class="w100_input">
          <template v-for="dict in operationList">
            <el-option :key="dict.value" :label="dict.name" :value="dict.value" />

          </template>

        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="create_time" class="large">
        <TimeFrameVue v-model="timedata.create_time" @parseTime="parseTime" :ParameterIndex="'create_time'">
        </TimeFrameVue>

      </el-form-item>

    </template>

    <template #search_btn>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      <slot name="btn"></slot>
    </template>
  </OrderAndSteam>
</template>

<script>
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting";
import OrderAndSteam from "@/components/Excellent/SearchLayout/OrderAndSteam.vue";
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';

export default {
  name: 'WorkspaceJsonOrderSearch',
  props: ['showSearch', 'TabsChangeStatus'],
  data() {
    return {
      queryParams: {
        mch_number: null,
        merchant_order_id: null,
        order_id: null,
        chnl_id: null,
        create_time: null,
        end_time: null,
        msg: null,
        operation: null,
        stream_type: 'amount'
      },
      timedata: {
        create_time: [],
        // end_time: null
      },
      PaymentChannel: [],
      MainAccount: [],
      msgList: [
        { name: 'Refund', value: 'Refund', show: '1' },
        { name: 'Reduce', value: 'Reduce', show: '1' },
        { name: 'Frozen', value: 'Frozen', show: '1' },
        { name: 'Increase', value: 'Increase', show: '0' },
      ],
      operationList: [
        // 0-代收代付记录，1-待结算余额调整记录，2-代付余额调整记录，3-可用余额调整记录
        { name: '全部', value: null, show: 'all' },

        //无代收代付选项
        { name: '账户待结算余额调整记录', value: 1, show: '1' },
        { name: '账户代付可用余额调整记录', value: 2, show: '1' },
        { name: '账户可用余额调整记录', value: 3, show: '1' },
      ],
    };
  },

  computed: {

  },

  mounted() {
    this.resetQuery();
  },

  created() {
    if (this.hasPermiVisible(['excellent:OrderRecords:platform'])) {
      Promise.all([this.getChnl(), this.getMainAccount()]);
    }
  },

  components: {
    OrderAndSteam, TimeFrameVue
  },

  methods: {
    parseTime(value, index) {
      let utcTimebegin = value[0];
      let utcTimeEnd = value[1];
      if (index == 'create_time') {
        this.$set(this.queryParams, 'create_time', utcTimebegin);
        this.$set(this.queryParams, 'end_time', utcTimeEnd);
      }

    },
    clearTime(index) {

      this.$set(this.timedata, index, []);
      if (index == 'create_time') {
        this.$set(this.queryParams, 'create_time', null);
        this.$set(this.queryParams, 'end_time', null);
      }
    },
    handleQuery() {
      this.$emit('ReturnSearch', this.queryParams);
    },
    RequestingData() {

      this.$emit('RequestingDataAgain', this.queryParams);
    },
    resetQuery() {
      this.queryParams = {
        mch_number: null,
        merchant_order_id: null,
        order_id: null,
        chnl_id: null,
        create_time: null,
        end_time: null,
        msg: null,
        operation: null,
        stream_type: 'amount'
      }
      this.timedata = {
        create_time: null,
        end_time: null
      },
        this.queryParams.end_time = null
      this.queryParams.create_time = null
      this.handleQuery();
    },

    handleExport() {
      if (this.queryParams.create_time && this.queryParams.end_time) {
        let TimeFrame = '';
        const params = { ...this.queryParams };
        if (params['mch_number']) {
          TimeFrame += params['mch_number'] + '_'
        }
        if (this.queryParams.create_time && this.queryParams.create_end_time) {
          TimeFrame += this.Formatter.FormatTime(this.queryParams.create_time * 1000, 'YYYY-MM-DD') + '-' + this.Formatter.FormatTime(this.queryParams.create_end_time * 1000, 'YYYY-MM-DD') + "_"
        }
        this.download.DownloadXlsx('/stream/download/commit', params, (TimeFrame + '资金调整记录'));
      } else {
        this.$message({ message: '请选择时间', type: 'warning' });
      }
    },

    getChnl() {
      return listChnlSetting().then(response => {
        this.PaymentChannel = response.rows;
      });
    },

    getMainAccount() {
      return listMchSetting().then(response => {
        this.MainAccount = response.rows;
      });
    },
  },
};
</script>
