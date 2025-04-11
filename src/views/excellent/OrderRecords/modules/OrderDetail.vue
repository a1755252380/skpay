<template>
  <el-dialog :visible.sync="showData" width="900px" :before-close="() => {
    showData = false;
  }
    ">
    <template #title>
      <span class="el-dialog__title">{{ labelShow('dialogTitle') }} </span> <el-button type="text"
        style="margin-left: 10px;" size="small" icon="el-icon-sort" v-hasPermi="['excellent:OrderRecords:platform']"
        @click="changeLanguage">{{ English ? '中文' : 'English'
        }}</el-button>
    </template>
    <el-descriptions :title="labelShow('userTitle')" :column="2" border class="descriptions" :labelStyle="{
      width: '150px',
    }" :contentStyle="{
      width: '280px',
    }">
      <el-descriptions-item :label="labelShow('user_name')">{{
        detail.user_name
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('user_phone')">{{
        detail.user_phone
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('user_address')">{{
        detail.user_address
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('user_email')">{{
        detail.user_email
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('user_bank_acct')" :span="2">{{
        detail.user_bank_acct
      }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="labelShow('ChnnlTitle')" :column="2" border
      v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" class="descriptions" :labelStyle="{
        width: '150px',
      }" :contentStyle="{
        width: '280px',
      }">
      <!-- detail.chnl_id  -->
      <el-descriptions-item :label="labelShow('channel_name')">{{
        Formatter.ChannelNameFormatter(detail)
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('channel_Rate')">{{
        detail.chnl_fee_ratio
      }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions :title="labelShow('deviceTitle')" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])"
      :column="2" border class="descriptions" :labelStyle="{
        width: '150px',
      }" :contentStyle="{
        width: '280px',
      }">
      <el-descriptions-item :label="labelShow('device_number')">{{
        detail.device_number
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('ip')" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">{{
        detail.ip
        }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions :title="labelShow('OrderInfoTitle')" :column="2" border class="descriptions" :labelStyle="{
      width: '150px',
    }" :contentStyle="{
      width: '280px',
    }">
      <el-descriptions-item :label="labelShow('order_id')">{{
        detail._id
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('order_amount')">{{
        Formatter.TableAmount(0, 0, detail.amount)
        }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('order_status')">
        <el-tag :type="formatStatus('status', detail.status).type">{{
          formatStatus('status', detail.status).name
        }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions :title="labelShow('TransactionTitle')" :column="2" border class="descriptions" :labelStyle="{
      width: '150px',
    }" :contentStyle="{
      width: '280px',
    }">
      <el-descriptions-item :label="labelShow('mch_number')">{{
        detail.mch_number
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('mch_fee_ratio')">{{
        detail.mch_fee_ratio
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('merchant_order_id')">{{
        detail.merchant_order_id
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('platform_order_id')"
        v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">{{
          detail.platform_order_id }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('fee_single')">{{
        Formatter.TableAmount(0, 0, detail.fee_single)
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('callback_status')">
        <el-tag :type="formatStatus('callback_status', detail.callback_status).type">{{
          formatStatus('callback_status', detail.callback_status).name
        }}</el-tag>

      </el-descriptions-item>
      <el-descriptions-item :label="labelShow('bank_ifsc')">{{
        detail.bank_ifsc
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('upi_link')"
        :span="hasPermiVisible(['excellent:OrderRecords:platform']) ? 1 : 2">{{
          detail.upi_link
        }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('create_time')">{{
        Formatter.TableTimeSecond(0, 0, detail.create_time)
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('update_time')">{{
        Formatter.TableTimeSecond(0, 0, detail.update_time)
        }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('utr')" :span="2">{{
        detail.utr
      }}</el-descriptions-item>
      <el-descriptions-item :label="labelShow('resp_msg')" :span="2"
        v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">{{
          detail.resp_msg }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script>
import { hasPermiVisible } from "@/utils/hasPermiVisible";
import moment from "moment-timezone";
export default {
  name: "WorkspaceJsonDetailedContent",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    detail: {
      type: Object,
      default: {},
    },

    width: {
      type: String,
      default: "800px",
    },
  },
  computed: {
    showData: {
      get() {
        return this.show;
      },
      set(val) {
        this.$emit("updateShow", val);
      },
    },
    detailData: {
      get() {
        return this.detail;
      },
      set(val) { },
    },
    detailList: {
      get() {
        return this.detailkey;
      },
    },
    contextWidth: {
      get() {
        return 400 - this.labelWidth;
      },
    },
  },

  data() {
    return {
      English: false,
      labelName: {
        dialogTitle: "详细信息",
        userTitle: '用户信息',
        user_name: '用户名',
        user_phone: '用户手机号',
        user_address: '用户地址',
        user_email: '用户邮箱',
        user_bank_acct: '用户银行卡号',
        ChnnlTitle: '通道信息',
        channel_name: '通道名称',
        channel_Rate: '通道费率',
        deviceTitle: '设备信息',
        device_number: '设备编号',
        ip: 'IP地址',
        OrderInfoTitle: '订单信息',
        order_id: '订单编号',
        order_amount: '订单金额',
        order_status: '订单状态',
        TransactionTitle: '交易信息',
        transaction_id: '交易编号',
        mch_number: '商户号',
        mch_fee_ratio: '商户费率',
        merchant_order_id: '商户订单号',
        platform_order_id: '三方订单号',
        fee_single: '单笔手续费',
        callback_status: '回调状态',
        bank_ifsc: '银行ifsc',
        upi_link: 'UPI链接',
        create_time: '创建时间',
        update_time: '更新时间',
        utr: '用户支付凭证',
        resp_msg: '三方回复信息',
      },
      EnglishLabelName: {
        dialogTitle: "Details",
        userTitle: 'User Information',
        user_name: 'Name',
        user_phone: 'Phone',
        user_address: 'Address',
        user_email: 'Email',
        user_bank_acct: 'Bank Account',
        ChnnlTitle: 'Channel Information',
        channel_name: 'Channel Name',
        channel_Rate: 'Channel Fee Rate',
        deviceTitle: 'Device Information',
        device_number: 'Device ID',
        ip: 'IP Address',
        OrderInfoTitle: 'Order Information',
        order_id: 'Order ID',
        order_amount: 'Order Amount',
        order_status: 'Order Status',
        TransactionTitle: 'Transaction Information',
        mch_number: 'Merchant ID',
        mch_fee_ratio: 'Merchant Fee Rate',
        merchant_order_id: 'Merchant Trxn Id',
        platform_order_id: 'Trxn Id',
        fee_single: 'Charges ',
        callback_status: 'Status',
        bank_ifsc: 'IFSC Code',
        upi_link: 'UPI Link',
        create_time: 'Creation Time',
        update_time: 'Update Time',
        utr: 'UTR',
        resp_msg: 'Response',
      }
    };
  },

  mounted() { },

  methods: {
    // 中英文切换
    changeLanguage() {
      this.English = !this.English;
    },
    labelShow(key) {

      return this.English ? this.EnglishLabelName[key] : this.labelName[key];

    },
    //状态调整
    formatStatus(key, value) {
      if (key == "status") {
        // 0-成功，1-失败，2-超时，5-已处理，6-已提交

        if (value == 0) {
          return { name: this.English ? "Success" : "成功", type: "success" };
        } else if (value == 1) {
          return { name: this.English ? "Failed" : "失败", type: "danger" };
        } else if (value == 2) {
          return { name: this.English ? "padding" : "超时", type: "warning" };
        } else if (value == 5) {
          return { name: this.English ? "Processed" : "已处理", type: "success" };
        } else if (value == 6) {
          return { name: this.English ? "Submitted" : "已提交", type: "" };
        } else if (value == -1) {
          return { name: this.English ? "Modification Failed" : "修改失败", type: "danger" };
        } else {
          return { name: this.English ? "Unknown" : "未知", type: "danger" };
        }
      } else {
        if (value == 0) {
          return { name: this.English ? "UnCallback" : "未回调", type: "warning" };
        } else if (value == 1) {
          return { name: this.English ? "Callback" : "已回调", type: "success" };
        } else {
          return { name: this.English ? "Unknown" : "未知", type: "danger" };
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.descriptions {
  margin-top: 8px;

  .el-descriptions__header {
    margin-bottom: 8px;
  }
}

::v-deep .el-dialog__body {
  padding-top: 0;
}

::v-deep .el-descriptions__header {
  margin-bottom: 10px;
}
</style>
