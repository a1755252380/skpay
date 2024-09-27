<template>
  <div v-loading="loadingData" class="table-container">
    <transition name="name">
      <!-- :height="height + 'px'" -->
      <!-- :style="{ height: height + 'px' }" -->
      <el-table :data="tableData" border :key="tableId" @selection-change="handleSelectionChange" class="DynamicTable"
        :resizable="false" :default-sort="sorttable" :highlight-selection-row="false" ref="DynamicTable"
        row-class-name="DynamicTable_row" cell-class-name="DynamicTable_cell">
        <slot></slot>
      </el-table>
    </transition>

  </div>
</template>

<script>
import { getClientHeight } from '@/utils/util';
export default {
  name: 'WorkspaceJsonDynamicTable',
  props: {
    'loading': {
      type: Boolean,
      default: false
    }, 'DomList': {
      type: Array,
      default: () => []
    },
    'tableData': {
      type: Array,
      default: () => []
    },
    sorttable: {
      type: Object,
      default: () => { }

    }
  },
  computed: {
    loadingData() {
      return this.loading;
    },

    DomListData() {
      return this.DomList;
    }
  },
  data() {
    return {
      height: 600,
      tableId: new Date().getTime(),
    };
  },

  mounted() {
    let attempt = 0;
    const tryGetRef = () => {
      this.$nextTick(() => {
        if (this.DomListData.every(ref => ref !== undefined)) {

          console.log('Ref 已经挂载:');

          setTimeout(() => {
            this.height = getClientHeight(...this.DomListData)
            this.tableId = new Date().getTime();
            this.$forceUpdate();
          }, 50);
        } else if (attempt < 5) { // 尝试 5 次
          attempt++;

          console.log('Ref 重新挂载:', attempt);
          setTimeout(tryGetRef, 400); // 每 200ms 尝试一次
        }
      });
    };
    tryGetRef();



  },

  methods: {
    handleSelectionChange() {
      this.$emit('handleSelectionChange',);
    },
    Totop() {
      this.$refs.DynamicTable.bodyWrapper.scrollTop = 0
    }
  },
};
</script>
<style lang="scss" scoped>
.table-container {
  flex: 1;
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
  transition: all 0.3s;
}

.DynamicTable_row {
  background: #fff;

}



.DynamicTable_cell {
  // background: #000;
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
