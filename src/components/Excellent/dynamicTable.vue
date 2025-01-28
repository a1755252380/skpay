<template>
  <!-- v-payouloading="loadingData" -->
  <div v-loading="loadingData" class="table-container" ref="DynamicTable_div">
    <el-table :data="tableData" border :key="tableId" @selection-change="handleSelectionChange" class="DynamicTable"
      :height="height" :resizable="false" :default-sort="defaultSort" :highlight-selection-row="false"
      :ref="'DynamicTable' + tableId" row-class-name="DynamicTable_row" :cell-class-name="cellClassNameFunction"
      v-table-move="['DynamicTable' + tableId]" @cell-dblclick="cellDblclick" @sort-change="handleSort"
      :show-summary="showSummary" :summary-method="getSummaries" :header-cell-class-name="headerCellClassName">
      <!-- <transition-group tag="tbody" name="fade" class="el-table__body"> -->

      <slot></slot>

      <!-- </transition-group> -->

    </el-table>
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
    },
    //是否显示合计行
    showSummary: {
      type: Boolean,
      default: false,
    },
    //合计方法
    getSummaries: {
      type: Function,
      default: () => { }
    },
    headerCellClassName: {
      type: Function,
      default: ({ row, column, rowIndex, columnIndex }) => {
        return 'DynamicTable_header'
      }
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
    // this.removeTooltipListeners()
  },
  methods: {
    handleSelectionChange(value) {
      this.$emit("handleSelectionChange", value);
    },
    Totop() {
      let attempt = 0;
      const TotopRef = () => {
        this.$nextTick(() => {
          if (this.$refs["DynamicTable" + this.tableId]) {
            this.$refs["DynamicTable" + this.tableId].scrollTop = 0;
            return;
          } else if (attempt < 10) {
            // 尝试 5 次
            attempt++;
            console.log("Ref 重新挂载:", attempt);
            setTimeout(TotopRef, 200); // 每 200ms 尝试一次
          }
        });
      };
      TotopRef();
    },
    //重新构建table

    rebuildTable() {

      let attempt = 0;
      const doLayoutRef = () => {
        this.$nextTick(() => {
          if (this.$refs["DynamicTable" + this.tableId]) {
            this.$refs["DynamicTable" + this.tableId].doLayout();
            return;
          } else if (attempt < 10) {
            // 尝试 5 次
            attempt++;
            console.log("Ref 重新挂载:", attempt);
            setTimeout(doLayoutRef, 200); // 每 200ms 尝试一次
          }
        });
      };
      doLayoutRef();

    },
    //重新渲染table
    renderTable() {
      this.tableId = new Date().getTime();

      this.$nextTick(() => {
        this.rebuildTable()
      });
    },
    TableClick() {
      this.$refs["DynamicTable" + this.tableId]
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
      if (column.type == "selection" || column.label == "操作" || column.label == "历史" ||
        column.label == "状态" || column.label == "验证状态" || column.label == "账户状态" || column.label == "代收开关" || column.label == "代付开关") {
        return
      }
      this.$emit("cellDblclick", row, column, cell, event);
    },
    handleSort({ column, prop, order }) {

      this.$emit("handleSortChange", { prop, order });
    },
    cellClassNameFunction({ row, column, rowIndex, columnIndex }) {
      // console.log(row, column, rowIndex, columnIndex);
      if (column.type == "selection" || column.label == "操作" || column.label == "历史" ||
        column.label == "状态" || column.label == "验证状态" || column.label == "账户状态" || column.label == "代收开关" || column.label == "代付开关") {
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
    },
    //鼠标悬浮窗
    // 为特定类名添加事件监听器
    addTooltipListeners() {
      console.log("表格数据加载完成");

      const tableCells = document.querySelectorAll('.HoverTooltipCopy');

      tableCells.forEach((cell) => {
        cell.addEventListener('mouseenter', this.showTooltip);
        cell.addEventListener('mouseleave', this.hideTooltip);
      });
    },
    removeTooltipListeners() {
      const tableCells = document.querySelectorAll('.HoverTooltipCopy');

      tableCells.forEach((cell) => {
        cell.removeEventListener('mouseenter', this.showTooltip);
        cell.removeEventListener('mouseleave', this.hideTooltip);
      });
    },

    // 创建并显示 Tooltip
    showTooltip(event) {
      const tooltip = document.createElement('div');
      tooltip.classList.add('TooltipCopy');  // 使用现有的类名
      tooltip.innerText = '双击复制文本'; // 使用提示内容
      document.body.appendChild(tooltip);

      const { top, left, width } = event.target.getBoundingClientRect();
      tooltip.style.position = 'absolute';
      tooltip.style.top = `${top + window.scrollY}px`; // 调整 tooltip 的位置
      tooltip.style.left = `${left + width / 2}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.opacity = '0.7';
      tooltip.style.visibility = 'visible';
      tooltip.style.zIndex = 9999;

      event.target._tooltip = tooltip; // 存储到元素上，方便后续删除
    },

    // 隐藏 Tooltip
    hideTooltip(event) {
      const tooltip = event.target._tooltip;
      if (tooltip) {
        tooltip.remove(); // 从 DOM 中移除 tooltip
        event.target._tooltip = null;
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
