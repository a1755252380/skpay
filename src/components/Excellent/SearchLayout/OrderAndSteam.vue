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

.search_option_div {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

// @media (max-width: 900px) {
//   .search_option_div {
//     grid-template-columns: repeat(3, minmax(180px, 1fr));
//     /* 小屏幕时每行 3 个 */
//   }
// }

// @media (max-width: 600px) {
//   .search_option_div {
//     grid-template-columns: repeat(2, minmax(180px, 1fr));
//     /* 更小屏幕时每行 2 个 */
//   }
// }

// @media (max-width: 400px) {
//   .search_option_div {
//     grid-template-columns: 1fr;
//     /* 最小屏幕时每行 1 个 */
//   }
// }</style>
