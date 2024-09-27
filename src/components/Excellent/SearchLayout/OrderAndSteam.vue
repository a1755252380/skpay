<template>
  <div style="" class="OrderRecords_table_search">
    <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-position="top"
      label-width="140px">
      <div class="search_option_div"
        :style="{ 'grid-template-columns': 'repeat(auto-fill, minmax(245px,' + gridwidth + ')) ' }">
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
    gridwidth: {
      type: String,
      default: '19.5%'
    }

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
<style lang="scss" scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 8px;
}

::v-deep .el-form--label-top .el-form-item__label {
  padding: 0 0 6px 0;
}

.OrderRecords_table_search {
  padding: 0 16px 8px 16px;
  // margin-bottom: 20px;

  .search_option_div {
    display: grid;
    grid-auto-rows: 1fr;
    gap: 0 8px;
    /* 行高均等 */
    // grid-template-rows: repeat(2, 1fr);
    /* 强制分为两行 */


  }
}
</style>
