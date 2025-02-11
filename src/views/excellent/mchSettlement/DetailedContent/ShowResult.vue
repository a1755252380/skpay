<template>
  <el-dialog :visible.sync="dialogVisibleShow" width="800px" :show-close="false" append-to-body>
    <div slot="title" class="dialog-title">
      <i class="el-icon-error">部分记录结算成功</i>
    </div>
    <div class="result_dialog">
      <div class="result_div">
        <div class="result_title">以下记录结算失败</div>
        <div class="tag_div">
          <el-tag v-for="(tag, index) in Result" :key="index" type="info" class="tag">{{ tag.mch_number }}：{{ tag.msg
            }}，{{
              tag.error }}</el-tag>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="error" @click="CopyError">复制结算失败的数据</el-button>
      <el-button type="primary" @click="dialogVisibleShow = false">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'ShowResult',
  components: {

  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    Result: {
      type: Array,
      default:
        []

    }
  },
  data() {
    return {

    }
  },

  computed: {
    dialogVisibleShow: {
      get() {
        return this.dialogVisible
      },
      set(val) {
        this.$emit('updateDialogVisible', val)
      }
    },



  },
  created() {

  },
  updated() {

  },
  destroyed() {

  },
  beforeDestroy() {

  },

  watch: {

  },
  mounted() {

  },
  methods: {
    CopyError(error) {
      const list = this.Result.map((item) => {
        return item.mch_number + '：' + item.msg + '，' + item.error;
      })
        .join('\n');
      // 复制到剪贴板
      this.$util.copyToClipboard(list);
    }
  }
};
</script>
<style lang='scss' scoped>
.tag {
  margin: 3px;
}

.result_dialog {
  .result_div {}

  .result_title {
    margin: 6px 0;
  }

  .tag_div {
    max-height: 160px;
    overflow-y: auto;
  }
}

.dialog-title {
  font-size: 20px;

  .el-icon-success {
    color: #67C23A;
    font-size: 24px;
  }

  .el-icon-error {
    color: #F56C6C;
    font-size: 24px;

  }
}

::v-deep .el-dialog__body {
  padding: 10px 20px;
}
</style>
