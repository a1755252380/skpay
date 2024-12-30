<template>
  <div>
    <el-form :model="queryParams" class="search-form" size="small" inline :show-message="false"
      style="margin: 16px 0;display: flex;align-items: center;">

      <el-form-item :label="'设备号'" prop="device_number">
        <el-input v-model="queryParams.device_number" :placeholder="'请输入设备号'" clearable class="w100_input"
          @clear="handleQuery" />
      </el-form-item>

      <el-form-item :label="'IP地址'" prop="ip">
        <el-input v-model="queryParams.ip" :placeholder="'请输入IP地址'" clearable @clear="handleQuery" class="w100_input" />
      </el-form-item>

      <el-form-item label="银行账户acc" prop="user_bank_acct">
        <el-input v-model="queryParams.user_bank_acct" :placeholder="'请输入银行账户acc'" clearable class="w100_input"
          @clear="handleQuery" />
      </el-form-item>
      <el-form-item label="UPI_ID" prop="upi_id">
        <el-input v-model="queryParams.upi_id" :placeholder="'请输入UPI_ID'" clearable class="w100_input"
          @clear="handleQuery" />
      </el-form-item>
      <div>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </div>
    </el-form>
    <div style="margin-bottom: 12px;">
      <slot name="search"></slot>
    </div>
  </div>

</template>

<script>
import OrderAndSteam from "@/components/Excellent/SearchLayout/OrderAndSteam.vue";
import TimeFrameVue from '@/components/Excellent/SearchOption/TimeFrame.vue';

export default {
  name: 'WorkspaceJsonOrderSearch',

  props: ['showSearch',],
  data() {
    return {
      queryParams: {
        device_number: null,
        ip: null,
        user_bank_acct: null,
        upi_id: null
      },
    };
  },

  mounted() {
    this.handleQuery();
  },

  created() {

  },

  components: {
    OrderAndSteam, TimeFrameVue
  },

  methods: {


    handleQuery() {
      this.$emit('ReturnSearch', this.queryParams);
    },
    RequestingDataAgain() {
      this.$emit('RequestingDataAgain', this.queryParams);
    },
    resetQuery() {
      this.queryParams = {
        device_number: null,
        ip: null,
        user_bank_acct: null,
      }
      this.handleQuery();
    },


  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-form-item.el-form-item--small {
  margin-bottom: 0px !important;
}
</style>
