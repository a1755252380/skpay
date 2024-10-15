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
