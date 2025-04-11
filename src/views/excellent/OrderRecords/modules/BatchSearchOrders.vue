<template>
  <div>
    <el-drawer :visible.sync="drawerData">
      <div slot="title" class="drawer_title">批量商户订单号查单/导出</div>
      <div style="" class="drawer_div">
        <div class="header_div">
          <el-input type="textarea" :rows="4" placeholder="请输入商户订单号信息/直接复制粘贴Excel表数据" v-model="batchInput"
            size="small"></el-input>
          <el-button type="primary" size="small" @click="batchAddBlacklist"
            style="margin-top: 6px;width: 100%;">确定</el-button>
        </div>
        <div class="tagShow_div">
          <template v-for="(item, index) in batchList">
            <el-tag :key="index" type="info" size="small" closable @close="TagClose(index)" style="margin: 3px;">{{
              item
            }}</el-tag>
          </template>
        </div>
        <div class="footer_div">
          <div class="footer_div_text">
            <el-button type="info" style="" class=" footer_div_btn " size="small" @click="ConfirmBatchExport"
              icon="el-icon-download">批量导出</el-button>
            <el-button type="warning" style="" class=" footer_div_btn " size="small" @click="ConfirmBatch"
              icon="el-icon-search">批量查询</el-button>
          </div>
        </div>
      </div>

    </el-drawer>

  </div>

</template>
<script>

export default {
  name: 'BatchReplenishment',

  props: {
    drawer: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      ResultDialogVisible: false,
      progress: 0, // 当前进度百分比
      status: null, // 进度条状态
      successCount: 0, // 成功数量
      errorList: [], // 失败数量

      batchInput: '',
      batchList: [],
    }
  },
  model: {
    prop: 'drawer',
    event: 'update:drawer'
  },
  computed: {
    drawerData: {
      get() {
        return this.drawer
      },
      set(val) {
        this.$emit('update:drawer', val)
      }
    }
  },
  watch: {

  },
  mounted() {
  },
  methods: {
    updateDialogVisible() {
      this.batchList.splice(0)
      this.batchInput = ''
    },
    batchAddBlacklist() {
      const input = this.batchInput.trim();
      if (!input) return;

      // 使用正则表达式匹配中英文逗号，并根据匹配结果分割字符串
      const items = input
        .split(/\r\n|\r|\n/)
        .map(item => item.trim())
        .filter(Boolean);

      // 将分割的项添加到 batchList 中
      this.batchList = this.batchList.concat(items);

      // 清空输入框
      this.batchInput = '';
    },
    TagClose(index) {
      this.batchList.splice(index, 1);
    },
    //确认提交
    ConfirmBatch() {

      this.$emit('ConfirmBatchSearch', this.batchList);
      this.updateDialogVisible()
    },
    ConfirmBatchExport() {
      this.$emit('ConfirmBatchExport', this.batchList);
      this.updateDialogVisible()
    }


  }

};
</script>
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

.drawer_div {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .divider {
    margin: 6px 0;
  }

  .header_div {}

  .tagShow_div {
    flex: 1;
    overflow-y: auto;
    margin: 16px 0;
  }

  .footer_div {

    .footer_div_text {
      width: 100%;
      display: flex;
      align-items: center;

      .footer_div_btn {
        flex: 1;
      }
    }
  }
}
</style>
