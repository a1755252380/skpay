<template>
  <el-drawer :visible.sync="drawerData" :size="500">
    <div slot="title" class="drawer_title">{{ title }}</div>
    <div style="" class="drawer_div">
      <div class="header_div">
        <textarea ref="safePasteInput" :rows="6" :value="displayText" class="safePasteInput"
          placeholder="请输入商户订单号信息/直接复制粘贴Excel表数据" @paste="handlePaste" @input="handleInput"></textarea>
        <div class="" style="display: flex;align-items: center;">
          <el-button type="primary" size="small" @click="batchAddBlacklist"
            style="margin-top: 6px;width: 100%;">确定</el-button>
          <el-button type="info" size="small" @click="clearList" style="margin-top: 6px;width: 100%;">清空</el-button>
        </div>
      </div>
      <div class="tagShow_div">
        <!-- <RecycleScroller :items="List" :item-size="12" class="scroller" v-if="List.length > 0" v-slot="{ item }">
          <template v-for="(item, index) in List">
          <el-tag :key="index" type="info" size="small" closable @close="TagClose(index)" style="margin: 3px;">{{
            item
          }}</el-tag>
          </template>
</RecycleScroller> -->
        <template v-for="(item, index) in displayList">
          <el-tag :key="index" type="info" size="small" closable @close="TagClose(index)" style="margin: 3px;">{{
            item
          }}</el-tag>
        </template>
        <!-- 提示：还有多少条未显示 -->
        <!-- 提示 + 加载更多 -->
        <div v-if="hasMore" style="margin-top: 10px; color: #409EFF; cursor: pointer; font-size: 13px;"
          @click="loadMore">
          🔽 点击加载更多（已展示 {{ visibleCount }} 条，还有 {{ List.length - visibleCount }} 条未显示）
        </div>
      </div>
      <div class="footer_div">
        <div class="footer_div_text">
          <slot></slot>

        </div>
      </div>
    </div>

  </el-drawer>


</template>
<script>
import { RecycleScroller } from 'vue-virtual-scroller'
export default {
  name: 'BatchReplenishment',
  // model: {
  //   prop: "BatchList",
  //   event: "change",
  // },
  // model: {
  //   prop: 'drawer',
  //   event: 'update:drawer'
  // },
  components: {
    RecycleScroller
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    BatchList: {
      type: Array,
      default: () => []

    },
    title: {
      type: String,
      default: '批量商户订单号查单/导出'
    },

  },

  computed: {
    List: {
      set(value) {
        this.$emit('update:BatchList', value)
        this.$emit('change')
      },
      get() {
        if (this.BatchList.length == 0) {
          this.displayText = ''
          this.batchInput = ''
        }
        return this.BatchList
      }
    },
    drawerData: {
      set(value) {
        this.$emit('update:drawer', value)
      },
      get() {
        return this.drawer
      }
    },
    displayList() {
      return this.List.slice(0, this.visibleCount);
    },
    hasMore() {
      return this.visibleCount < this.List.length;
    }
  },
  data() {
    return {
      ResultDialogVisible: false,
      progress: 0, // 当前进度百分比
      status: null, // 进度条状态
      successCount: 0, // 成功数量
      errorList: [], // 失败数量
      displayText: '',    // 显示在 textarea 中的内容（仅做预览）
      batchInput: '',     // 实际处理用的数据，完整保留
      batchlimit: 40000, // 每次处理的数量
      visibleCount: 500 // 初始展示条数 // 显示的数量限制
      // batchList: [],
    }
  },


  watch: {

  },
  mounted() {
  },
  methods: {
    clearList() {
      this.displayText = ''
      this.batchInput = ''
      this.List.splice(0)
    },

    batchAddBlacklist() {
      const that = this
      function renderInBatches(dataArray) {
        const batchSize = 100;
        const total = dataArray.length;
        let index = 0;

        const loadNextBatch = () => {
          const nextBatch = dataArray.slice(index, index + batchSize);
          that.List.push(...nextBatch);
          index += batchSize;

          if (index < total) {
            requestAnimationFrame(loadNextBatch);
          }
        };

        loadNextBatch();
      }
      const input = this.batchInput.trim();
      if (!input) return;

      const items = input
        .split(/\r\n|\r|\n/)
        .map(item => item.trim())
        .filter(Boolean);

      const maxLimit = this.batchlimit;
      const totalLength = this.List.length + items.length;

      if (totalLength > maxLimit) {
        const allowedCount = maxLimit - this.List.length;
        if (allowedCount > 0) {
          // renderInBatches(items.slice(0, allowedCount))
          this.List = this.List.concat(items.slice(0, allowedCount));
          this.$message.warning(`最多只能添加 ${maxLimit} 条，已截取前 ${allowedCount} 条。`);
        } else {
          this.$message.warning(`已达到最大限制 ${maxLimit} 条，无法继续添加。`);
        }
      } else {
        this.List = this.List.concat(items);
        // renderInBatches(items)
      }
      this.displayText = ''
      this.batchInput = ''
    },

    TagClose(index) {
      this.List.splice(index, 1);
    },
    // 粘贴时处理
    handlePaste(e) {
      e.preventDefault();

      const clipboardData = e.clipboardData || window.clipboardData;
      const text = clipboardData.getData('text/plain');

      const lineCount = text.split('\n').length;
      if (lineCount > this.batchlimit) {
        this.displayText = `❌ 粘贴数据过多，最多支持 ${this.batchlimit} 行`;
        this.batchInput = '';
        return;
      }

      this.displayText = '正在处理粘贴数据，请稍候...';

      // 延迟设置值，避免主线程阻塞
      setTimeout(() => {
        this.batchInput = text;
        if (lineCount > 50) {
          const preview = text
            .split('\n')
            .slice(0, 50)
            .join('\n');

          this.displayText = preview + '\n...\n（仅预览前50行）';
        } else {
          this.displayText = text;
        }

      }, 10);
    },

    // 用户输入时处理（不阻止）
    handleInput(e) {
      const val = e.target.value
      this.displayText = val;
      this.batchInput = val;
    },

    // 处理数据，生成数组
    getBatchList() {
      return this.batchInput
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
    },

    loadMore() {
      // 每次增加 1000 条，最多不超过 List 长度
      const nextCount = this.visibleCount + 1000;
      this.visibleCount = Math.min(nextCount, this.List.length);
    },
    //确认提交
    // ConfirmBatch() {

    //   this.$emit('ConfirmBatchSearch', this.batchList);
    //   this.updateDialogVisible()
    // },
    // ConfirmBatchExport() {
    //   this.$emit('ConfirmBatchExport', this.batchList);
    //   this.updateDialogVisible()
    // }


  },


};
</script>
<style lang="scss">
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
<style lang='scss' scoped>
.ResultNum {
  margin: 6px 0 3px 0;
  font-size: 16px;
  font-weight: 500;
  color: #000;

  .blue {
    color: #4c6ee6
  }

  .success {
    color: #67c23a
  }

  .error {
    color: #f56c6c
  }
}




.drawer_title {
  font-size: 20px;
  font-weight: 500;
  color: #000;
}

::v-deep .el-drawer__header {
  margin-bottom: 12px;
}

::v-deep .el-progress.is-success .el-progress__text {
  font-size: 50px;
}

.scroller {
  overflow-y: auto;
  height: 100%;
}

.drawer_div {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .divider {
    margin: 6px 0;
  }

  .safePasteInput {
    width: 100%;
    resize: none;
  }

  .header_div {}

  .tagShow_div {
    flex: 1;
    margin: 16px 0;
    // height: calc(100% - 320px)
    overflow-y: auto;
  }

  .footer_div {

    .footer_div_text {
      width: 100%;
      display: flex;
      align-items: center;

      // * {
      //   flex: 1;
      // }
    }
  }
}
</style>
