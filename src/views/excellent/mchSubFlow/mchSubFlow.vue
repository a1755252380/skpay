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
      <el-form-item label="查询起始时间" prop="create_time">
        <el-date-picker v-model="timedata.create_time" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
          placeholder="请选择查询起始时间" class="w100_input" @change="parseTime($event, 'create_time')"
          @clear="clearTime('create_time')" />
      </el-form-item>

      <el-form-item label="查询截止时间" prop="end_time">
        <el-date-picker v-model="timedata.end_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择查询截止时间" class="w100_input" @change="parseTime($event, 'end_time')"
          @clear="clearTime('end_time')" />
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
        create_time: null,
        end_time: null
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
        { name: '待结算余额调整记录', value: 1, show: '1' },
        { name: '代付余额调整记录', value: 2, show: '1' },
        { name: '可用余额调整记录', value: 3, show: '1' },
      ],
    };
  },

  computed: {
    currentOrderLabel() {
      return this.TabsChangeStatus == 1 ? '代付' : '代收';
    }
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
    OrderAndSteam
  },

  methods: {
    parseTime(value, index) {
      let utcTime = this.$util.getUtcTime(value) / 1000;
      this.$set(this.timedata, index, value);
      this.$set(this.queryParams, index, utcTime ? utcTime : null);
    },
    clearTime(index) {

      this.$set(this.timedata, index, null);
      this.$set(this.queryParams, index, null);
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
      if (this.timedata.create_time && this.timedata.end_time) {
        const params = { ...this.queryParams, type: this.TabsChangeStatus };
        this.download.mchAccFlowDownload('/stream/download/commit', params);
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
