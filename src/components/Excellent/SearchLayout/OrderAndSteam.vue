<template>
  <div style="" class="OrderRecords_table_search">
    <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-position="top"
      label-width="140px">
      <div class="search_option_div">
        <slot name="search_option"></slot>
        <div class="btn ">
          <slot name="search_btn"></slot>

        </div>
      </div>

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




  .search_option_div {
    display: grid;
    grid-auto-flow: dense; // 尽量回填空位
    gap: 6px 8px; // 行间距 6px，列间距 8px
    grid-auto-rows: minmax(20px, auto); // 高度自适应
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); // 默认大屏

    // 大格子跨两列
    .large {
      grid-column: span 2;

      @media (max-width: 767px) {
        grid-column: span 1; // 小屏不要跨列
      }
    }

    // 按钮跨三列，并底部对齐
    .btn {
      grid-column: span 4;
      margin-bottom: 6px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    // 响应式断点
    @media (max-width: 1199px) {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

      .btn {
        grid-column: span 4 !important;
      }
    }

    @media (max-width: 991px) {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));

      .btn {
        grid-column: span 5 !important;
      }
    }

    @media (max-width: 767px) {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));

      .btn {
        grid-column: span 5 !important;
      }
    }
  }


  /* 大输入框跨列 */
  .search_option_div .large {
    grid-column: span 2;

    @media (max-width: 767px) {
      grid-column: span 1; // 小屏不要跨列
    }
  }

}
</style>
<style lang="scss" scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 6px !important;
}

::v-deep .el-form--label-top .el-form-item__label {
  padding: 0 0 3px 0 !important;
}
</style>