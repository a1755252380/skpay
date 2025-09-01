<template>
  <div style="" class="OrderRecords_table_search">
    <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-position="top"
      label-width="140px">
      <div class="search_option_div">
        <slot name="search_option"></slot>
      </div>
      <slot class="FlexStart">
        <slot name="search_btn"></slot>

      </slot>
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'WorkspaceJsonOrderAndSteam',
  props: {
    'queryParams': {

      type: Object,
      default: () => { return {} }

    }, 'showSearch': {
      type: Boolean,
      default: true
    },


  },
  data() {
    return {

    };
  },

  mounted() {

  },

  methods: {

  },
};
</script>
<style lang="scss">
.OrderRecords_table_search {
  padding: 0 16px 8px 16px;
  // margin-bottom: 20px;

  .search_option_div {
    display: grid;
    gap: 0 8px;
    /* 行高均等 */
    /* 强制分为两行 */


  }
}

.search_option_div {
  display: grid;
  // grid-auto-flow: column;
  /* 按列填充，确保两行 */
  // grid-template-columns: minmax(160px, 1fr);
  grid-template-columns: repeat(auto-fill, minmax(150px, 16.1%));
  // gap: 16px;
}

/* 特殊处理需要更大宽度的输入框 */
.search_option_div .large {
  grid-column: span 2;
  /* 跨两列 */
}
</style>
<style lang="scss" scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 8px;
}

::v-deep .el-form--label-top .el-form-item__label {
  padding: 0 0 3px 0 !important;
}
</style>