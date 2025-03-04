<template>
  <el-dialog title="批量设置并发限制" :visible="value" width="600px" @close="closeDialog">
    <el-form :model="form" label-width="200px">
      <el-form-item label="商户">
        <el-tag v-for="item in ChangeListData" :key="item" style="margin: 3px;">{{ item }}</el-tag>
      </el-form-item>
      <el-form-item label="代收并发限制(笔/秒)">
        <template #label>
          代收并发限制(笔/秒) <el-tooltip class="item" effect="dark" content="代收并发限制为0时，默认代收并发不限制" placement="top">
            <i class="el-icon-view click"></i>
          </el-tooltip>
        </template>
        <el-input-number v-model="form.payin_speed_limit" :min="0" class="w100_input"></el-input-number>
      </el-form-item>
      <el-form-item label="代付并发限制(笔/秒)">
        <template #label>
          代付并发限制(笔/秒) <el-tooltip class="item" effect="dark" content=" 代付并发限制为0时，默认代付并发不限制" placement="top">
            <i class="el-icon-view click"></i>
          </el-tooltip>
        </template>
        <el-input-number v-model="form.payout_speed_limit" :min="0" class="w100_input"></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'WorkspaceJsonBatchChangeChannels',

  props: {
    visibleShow: {
      type: Boolean,
      default: false
    },
    ChangeList: {
      type: Array,
      default: () => []
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {

    ChangeListData() {
      return this.ChangeList
    },
  },
  data() {
    return {
      form: {
        payin_speed_limit: 0, //代收并发限制
        payout_speed_limit: 0, //代付并发限制
      },
    };
  },
  created() {
  },
  mounted() {

  },

  methods: {
    closeDialog() {
      this.Reset()
      this.$emit('input', false); // 触发 v-model 更新
    },
    Reset() {
      this.form = {
        payin_speed_limit: 0,
        payout_speed_limit: 0,
      }
    },
    //提交修改
    submit() {


      let confirmList = this.ChangeList.map(item => {
        return {
          mch_num: item,
        }
      })
      let message = ''
      confirmList = confirmList.map(item => {
        item.payin_speed_limit = this.form.payin_speed_limit
        item.payout_speed_limit = this.form.payout_speed_limit
        return item
      })
      this.$confirm(
        '确认批量将商户的代收并发限制为 ' + (this.form.payin_speed_limit == 0 ? '无限制' : this.form.payin_speed_limit + ' 单/秒') + ' ，代付并发限制为 ' + (this.form.payout_speed_limit == 0 ? '无限制' : this.form.payout_speed_limit + ' 单/秒') + ' 吗？', '提示',
        {
          type: 'warning',
          confirmButtonText: '确认',
          cancelButtonText: '取消',
        }).then(() => {
          this.Reset()
          this.$emit('submit', confirmList)
          return
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          }
          )
          return
        })
    },
    //取消
    handleCancel() {
      this.visible = false
    },
    //选择通道
    selectChannel() {
      this.visible = true
    },
    //选择通道
    handleSelectChannel(value) {
      this.$emit('submit', confirmList)
    },

  },
  components: {}
};
</script>

<style scoped></style>
