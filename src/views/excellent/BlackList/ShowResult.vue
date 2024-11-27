<template>
  <el-dialog :visible.sync="dialogVisibleShow" width="800px" :show-close="false">
    <div slot="title" class="dialog-title">
      <i :class='SuccessCount != 0 ? "el-icon-success" : "el-icon-error"'></i>{{ SuccessCount }}条记录添加成功！
    </div>
    <div class="result_dialog">
      <div class="result_div" v-if="NonExistent.length != 0">
        <div class="result_title">以下记录不存在，请勿添加</div>
        <div class="tag_div">
          <el-tag v-for="tag in NonExistent" :key="tag" type="info" class="tag">{{ tag }}</el-tag>
        </div>
      </div>
      <div class="result_div" v-if="RepeatAdd.length != 0">
        <div class="result_title">以下记录重复添加，请重新确认</div>

        <div class="tag_div">

          <el-tag v-for="tag in RepeatAdd" :key="tag" type="warning" class="tag">{{ tag }}</el-tag>
        </div>
      </div>
      <div class="result_div" v-if="AddList.length != 0">
        <div class="result_title">以下记录添加失败</div>
        <div class="tag_div">
          <el-tag v-for="tag in AddList" :key="tag" type="danger" class="tag">{{ tag }}</el-tag>
        </div>
      </div>

    </div>
    <span slot="footer" class="dialog-footer">
      <el-button v-if="NonExistent.length > 0" type="info" @click="CopyError(1)">复制不存在的订单</el-button>
      <el-button v-if="RepeatAdd.length > 0" type="warning" @click="CopyError(2)">复制重复添加的订单</el-button>
      <el-button v-if="AddList.length > 0" type="error" @click="CopyError(3)">复制添加失败的订单</el-button>
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
      default: true
    },
    Result: {
      type: Object,
      default: () => {
        return {
          failed_orders: [

          ],
          success_orders: []
        }
      }
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
    //添加成功条数
    SuccessCount() {
      return this.Result.success_orders ? this.Result.success_orders.length : 0
    },

    //不存在
    NonExistent() {
      return this.Result.failed_orders
        .filter((item) => item.error === 1)
        .map((item) => {
          if (item.input.device_number) {
            return item.input.device_number;
          }
          if (item.input.ip) {
            return item.input.ip;
          }
          if (item.input.user_bank_acct) {
            return item.input.user_bank_acct;
          }

          return item.input;
        });
    },
    //重复添加
    RepeatAdd() {
      return this.Result.failed_orders
        .filter((item) => item.error == 2)
        .map((item) => {
          if (item.input.device_number) {
            return item.input.device_number;
          }
          if (item.input.ip) {
            return item.input.ip;
          }
          if (item.input.user_bank_acct) {
            return item.input.user_bank_acct;
          }

          return item.input;
        });
    },
    //添加
    AddList() {
      return this.Result.failed_orders
        .filter((item) => item.error === 3)
        .map((item) => {
          if (item.input.device_number) {
            return item.input.device_number;
          }
          if (item.input.ip) {
            return item.input.ip;
          }
          if (item.input.user_bank_acct) {
            return item.input.user_bank_acct;
          }

          return item.input;
        });
    }
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
      const list = this.Result.failed_orders
        .filter((item) => item.error === error)
        .map((item) => {
          if (item.input.device_number) {
            return item.input.device_number;
          }
          if (item.input.ip) {
            return item.input.ip;
          }
          if (item.input.user_bank_acct) {
            return item.input.user_bank_acct;
          }

          return item.input;
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
