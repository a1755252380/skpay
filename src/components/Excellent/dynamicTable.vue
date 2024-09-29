<template>
  <!-- v-payouloading="loadingData" -->
  <div v-loading="loadingData" class="table-container" ref="DynamicTable_div">
    <transition name="name">
      <el-table :data="tableData" border :key="tableId" @selection-change="handleSelectionChange" class="DynamicTable"
        header-cell-class-name="DynamicTable_header" :height="height" :resizable="false" :default-sort="defaultSort"
        :highlight-selection-row="false" :ref="'DynamicTable' + tableId" row-class-name="DynamicTable_row"
        :cell-class-name="cellClassNameFunction" v-table-move="['DynamicTable' + tableId]" @cell-dblclick="cellDblclick"
        @sort-change="handleSort">
        <slot></slot>
      </el-table>
    </transition>
  </div>
</template>

<script>
import { throttle } from "@/utils/util.js";
export default {
  name: "WorkspaceJsonDynamicTable",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    defaultSort: {
      type: [Object, String],
      default: () => { },
    },
    cellClassName: {
      type: String,
      default: ''
    }

  },

  computed: {
    loadingData() {
      return this.loading;
    },

    DomListData() {
      return this.DomList;
    },
  },
  data() {
    return {
      height: 200,
      tableId: new Date().getTime(),
    };
  },

  mounted() {
    let attempt = 0;
    const tryGetRef = () => {
      this.$nextTick(() => {
        if (this.$refs.DynamicTable_div) {
          this.handleResize();
          window.addEventListener(
            "resize",
            throttle(() => {
              this.handleResize();
            }, 150)
          ); // 监听窗口变化
        } else if (attempt < 5) {
          // 尝试 5 次
          attempt++;

          setTimeout(tryGetRef, 400); // 每 200ms 尝试一次
        }
      });
    };
    tryGetRef();
  },
  beforeDestroy() {
    window.removeEventListener(
      "resize",
      throttle(() => {
        this.handleResize();
      }, 150)
    ); // 在组件销毁时移除监听器
  },
  methods: {
    handleSelectionChange(value) {
      this.$emit("handleSelectionChange", value);
    },
    Totop() {
      let attempt = 0;
      const tryGetRef = () => {
        this.$nextTick(() => {
          if (this.$refs["DynamicTable" + this.tableId]) {
            this.$refs["DynamicTable" + this.tableId].scrollTop = 0;
            return;
          } else if (attempt < 10) {
            // 尝试 5 次
            attempt++;

            console.log("Ref 重新挂载:", attempt);
            setTimeout(tryGetRef, 200); // 每 200ms 尝试一次
          }
        });
      };
      tryGetRef();
    },
    //重置table高度
    handleResize() {
      this.height = 200;

      this.height = this.$refs.DynamicTable_div.offsetHeight - 10;
      this.tableId = new Date().getTime();
      this.$nextTick(() => {
        this.$refs["DynamicTable" + this.tableId].doLayout();
      });

      this.$forceUpdate();
    },
    clearSelection() {
      this.$refs["DynamicTable" + this.tableId].clearSelection();
    },
    cellDblclick(row, column, cell, event) {
      this.$emit("cellDblclick", row, column, cell, event);
    },
    handleSort({ column, prop, order }) {
      console.log(column, prop, order);

      this.$emit("handleSortChange", { prop, order });
    },
    cellClassNameFunction({ row, column, rowIndex, columnIndex }) {
      console.log(row, column, rowIndex, columnIndex);
      if (column.type == "selection" || column.label == "操作") {
        return 'DynamicTable_cell'
      } else {
        if (typeof this.cellClassName == "string") {
          return this.cellClassName
        } else {
          let classname = 'DynamicTable_cell '
          for (let index = 0; index < this.cellClassName.length; index++) {
            classname += this.cellClassName[index] + ' '

          }
          return classname
        }

      }
    }
  },
};
</script>
<style lang="scss" scoped>
.table-container {
  flex: 1;
  margin: 0 4px;
}

// #f7f7f7
::v-deep .el-table td.el-table__cell {
  border-bottom: 1px solid #e9e6e6;
}

::v-deep .el-table--border .el-table__cell {
  border-right: 1px solid #e9e6e6;
}

/* 禁用表格列的拖动调整功能 */
::v-deep .el-table .cell {
  position: relative;
}

::v-deep .el-table .el-table__header-wrapper .el-table__header {
  cursor: default;
  /* 禁用拖动光标 */
}

::v-deep .el-table .el-table__header-wrapper .el-table__header th {
  position: relative;
}
</style>
<style lang="scss">
.DynamicTable * {
  transition: height 0.3s;
}

.DynamicTable_row {
  background: #fff;
}

.DynamicTable_cell {
  // background: #000;
}

.DynamicTable_header {
  // background: #000;
  font-weight: 700 !important;
  font-size: 14px !important;
}

.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell {
  background-color: #f7f6f6fa;
}

// .DynamicTable_row:nth-child(2n) {
//   background: #f7f7f7;
// }

// .DynamicTable_row:nth-child(2n):hover {
//   background: #fff;
// }</style>
