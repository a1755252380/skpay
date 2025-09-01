<template>
  <!-- v-payouloading="loadingData" -->
  <el-table v-bind="$attrs" v-on="$listeners" v-loading="$attrs.loading" :cell-class-name="cellClassNameFunction"
    @cell-dblclick="cellDblclick" :header-cell-class-name="headerCellClassName">
    <slot></slot>
  </el-table>
</template>

<script>
export default {
  name: "WorkspaceJsonDynamicTable",
  props: {
    cellClassName: {
      type: String,
      default: ''
    },
    headerCellClassName: {
      type: Function,
      default: ({ row, column, rowIndex, columnIndex }) => {
        return 'DynamicTable_header'
      }
    },

  },

  data() {
    return {
      height: 200,
      tableId: new Date().getTime(),
    };
  },


  methods: {

    cellDblclick(row, column, cell, event) {
      if (column.type == "selection" || column.label == "操作" || column.label == "历史" ||
        column.label == "状态" || column.label == "验证状态" || column.label == "账户状态" || column.label == "代收开关" || column.label == "代付开关") {
        return
      }
      this.$emit("cellDblclick", row, column, cell, event);
    },

    cellClassNameFunction({ row, column, rowIndex, columnIndex }) {
      console.log(this.$attrs);
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
