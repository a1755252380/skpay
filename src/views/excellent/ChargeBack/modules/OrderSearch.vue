<template>
  <div class="OrderRecords_table_search">
    <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-position="top"
      class="search_option_div">
      <el-form-item label="商户" prop="mch_number_list" v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
        <el-select v-model="queryParams.mch_number_list" placeholder="请选择商户" clearable class="w100_input" multiple
          collapse-tags>
          <el-option v-for="dict in MainAccount" :key="dict.id" :label="dict.mch_num" :value="dict.mch_num" />
        </el-select>
      </el-form-item>
      <el-form-item label="商户订单号" prop="merchant_order_id">
        <el-input v-model="queryParams.merchant_order_id" placeholder="请输入商户订单号" clearable @clear="handleQuery"
          @change="clearBatchList" />
      </el-form-item>
      <el-form-item label="系统订单号" prop="order_id">
        <el-input v-model="queryParams.order_id" placeholder="请输入系统订单号" clearable @clear="handleQuery" />
      </el-form-item>
      <el-form-item label="三方平台订单号" prop="platform_order_id"
        v-if="hasPermiVisible(['excellent:OrderRecords:platform'])">
        <el-input v-model="queryParams.platform_order_id" placeholder="请输入三方平台订单号" clearable @clear="handleQuery"
          @change="clearBatchList" />
      </el-form-item>
    </el-form>
    <div>
      <el-tooltip :content="BathSearchTips + '搜索'" placement="top" effect="light" v-if="BatchList.length > 0">
        <el-button type="warning" icon="el-icon-search" size="mini" @click="handleQuery">批量搜索</el-button>
      </el-tooltip>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" v-else>搜索</el-button>
      <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      <el-tooltip :content="BathSearchTips + '导出'" placement="top" effect="light" v-if="BatchList.length > 0">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="ConfirmBatchExport">批量导出</el-button>
      </el-tooltip>
      <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-else>导出</el-button>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="BatchSearchOrdersShow = true"
        v-hasPermi="['excellent:OrderRecords:edit']">批量查单</el-button>
      <slot name="btn"></slot>
    </div>
    <BatchDrawer :BatchList.sync="BatchList" :drawer.sync="BatchSearchOrdersShow" @change="clearSingleInputs">
      <div class="batch_div">
        <el-select v-model="BatchSelect" size="mini" style="width: 100%;">
          <el-option v-for="item in BatchSelectOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="batch_div_btn_div">
          <el-button type="info" class="batch_div_btn" size="small" @click="ConfirmBatchExport"
            icon="el-icon-download">批量导出</el-button>
          <el-button type="warning" class="batch_div_btn" size="small" @click="ConfirmBatchSearch"
            icon="el-icon-search">批量查询</el-button>
        </div>
      </div>
    </BatchDrawer>
  </div>
</template>

<script>
import BatchDrawer from "@/components/dialog/BatchDrawer.vue";
import { listMchSetting } from "@/api/excellent/MchSetting";

export default {
  name: 'WorkspaceJsonOrderSearch',
  props: {
    showSearch: { type: Boolean, default: true }
  },
  data() {
    return {
      queryParams: {
        mch_number_list: null,
        merchant_order_id: null,
        order_id: null,
        platform_order_id: null,
        merchant_order_id_list: null,
        platform_order_id_list: null,
      },
      BatchList: [],
      BatchSelect: 'mch',
      BatchSelectOptions: [
        { label: '商户订单号', value: 'mch' },
        { label: '三方订单号', value: 'plat' }
      ],
      BatchSearchOrdersShow: false,
      MainAccount: []
    };
  },
  computed: {
    BathSearchTips() {
      const item = this.BatchSelectOptions.find(i => i.value === this.BatchSelect);
      return `正在使用${item.label}批量`;
    }
  },
  mounted() {
    this.getMainAccount();
    this.handleQuery();
  },
  methods: {
    handleQuery() {
      this.$emit('ReturnSearch', this.getCleanParams());
    },
    resetQuery() {
      this.queryParams = {
        mch_number_list: null,
        merchant_order_id: null,
        order_id: null,
        platform_order_id: null,
        merchant_order_id_list: null,
        platform_order_id_list: null
      };
      this.BatchList = [];
      this.handleQuery();
    },
    getCleanParams() {
      const { merchant_order_id, platform_order_id, merchant_order_id_list, platform_order_id_list, ...rest } = this.queryParams;
      const params = {
        charge_back: 1, time_type: "history",
        ...rest,
        ...(merchant_order_id ? { merchant_order_id_list: [merchant_order_id] } : {}),
        ...(merchant_order_id_list?.length ? { merchant_order_id_list } : {}),
        ...(platform_order_id ? { platform_order_id_list: [platform_order_id] } : {}),
        ...(platform_order_id_list?.length ? { platform_order_id_list } : {})
      };
      Object.keys(params).forEach(k => {
        if (params[k] === null || (Array.isArray(params[k]) && !params[k].length)) delete params[k];
      });
      return params;
    },
    handleExport() {
      const query = { ...this.getCleanParams() };
      this.download.DownloadOrderXlsx('/order/download/commit', query, 'ChargeBack');
    },
    ConfirmBatchSearch() {
      if (!this.BatchList.length) return this.$message.warning('请先输入订单号');
      this.BatchSearchOrdersShow = false;
      this.assignBatchToParams();
      this.handleQuery();
    },
    ConfirmBatchExport() {
      if (!this.BatchList.length) return this.$message.warning('请先输入订单号');
      this.BatchSearchOrdersShow = false;
      this.assignBatchToParams();
      const query = { ...this.getCleanParams() };
      this.download.DownloadOrderXlsx('/order/download/commit', query, '批量导出ChargeBack');
    },
    assignBatchToParams() {
      // 清空已有的批量参数，避免旧值残留
      this.queryParams.merchant_order_id_list = null;
      this.queryParams.platform_order_id_list = null;
      if (this.BatchSelect === 'mch') {
        this.queryParams.merchant_order_id_list = [...this.BatchList];
      } else if (this.BatchSelect === 'plat') {
        this.queryParams.platform_order_id_list = [...this.BatchList];
      }
    },
    clearBatchList() {
      this.BatchList = [];
    },
    clearSingleInputs() {
      this.queryParams.merchant_order_id = null;
      this.queryParams.platform_order_id = null;
    },
    getMainAccount() {
      listMchSetting().then(res => {
        this.MainAccount = res.rows;
      });
    }
  },
  components: {
    BatchDrawer
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

.OrderRecords_table_search {
  padding: 0 16px 8px 16px;
}

.search_option_div {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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