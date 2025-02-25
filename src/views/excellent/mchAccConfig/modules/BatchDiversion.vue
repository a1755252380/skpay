<template>
  <el-dialog title="批量修改分流数据" :visible.sync="visible" width="600px">
    <el-form :model="form" label-width="120px" :rules="rules" ref="DiversionForm">
      <el-form-item label="商户">
        <el-tag v-for="item in ChangeListData" :key="item" style="margin: 3px;">{{ item }}</el-tag>
      </el-form-item>
      <el-form-item label="代收分流金额" prop="payin_over_amount">
        <el-input-number v-model="form.payin_over_amount" :min="0" :step="1" class="w100_input"></el-input-number>

      </el-form-item>
      <el-form-item label="代收分流通道" v-if="form.payin_over_amount > 0" prop="payin_over_chnl_id">
        <el-select v-model="form.payin_over_chnl_id" placeholder="请选择代收通道" class="w100_input">
          <el-option v-for="item in ChnlOptions" :key="'payin_' + item.id"
            :label="(item.chnl_name == '' ? '' : item.chnl_name[0]) + item.id" :value="item.id"></el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="代付分流金额" prop="payout_over_amount">
        <el-input-number v-model="form.payout_over_amount" :min="0" :step="1" class="w100_input"></el-input-number>
      </el-form-item>
      <el-form-item label="代付分流通道" v-if="form.payout_over_amount > 0" prop="payout_over_chnl_id">
        <el-select v-model="form.payout_over_chnl_id" placeholder="请选择代付分流通道" class="w100_input">
          <el-option v-for="item in ChnlOptions" :key="'payin_' + item.id"
            :label="(item.chnl_name == '' ? '' : item.chnl_name[0]) + item.id" :value="item.id"></el-option>
        </el-select>

      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import ChannelQuery from '@/components/Excellent/Channel/ChannelQuery.vue';
import { listChnlSetting } from "@/api/excellent/chnlSetting"
import { mapState } from 'vuex';
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
    }
  },
  computed: {
    visible: {
      set(val) {
        this.form = {
          payin_over_amount: 0,
          payout_over_amount: 0,
          payin_over_chnl_id: null,
          payout_over_chnl_id: null,
        }
        this.$emit('updateVisible', val);
      },
      get() {
        return this.visibleShow;
      }
    },
    ChangeListData() {
      return this.ChangeList
    },
    ...mapState({
      ChnlOptions: state => state.Cache.channelList,
    }),
  },
  data() {
    return {
      rules: {

        payin_over_amount: [
          { required: true, message: "请输入代收分流金额", trigger: "change" },
        ],
        payout_over_amount: [
          { required: true, message: "请输入代付分流金额", trigger: "change" },
        ],
        payout_over_chnl_id: [
          {
            validator: (rule, value, callback) => {
              console.log(this.form.payout_over_amount);
              console.log(value);

              if (this.form.payout_over_amount == 0) {
                callback();
              } else {
                if (value == null) {
                  callback(new Error('请选择代付分流通道'));
                }
                callback();
              }
            }, message: '请选择代付分流通道', trigger: "change"
          }
        ],
        payin_over_chnl_id: [
          {
            validator: (rule, value, callback) => {
              if (this.form.payin_over_amount == 0) {
                callback();
              } else {
                if (value == null) {
                  callback(new Error('请选择代收分流通道'));
                }
                callback();
              }
            }, message: '请选择代收分流通道', trigger: "change"
          }
        ]
      },
      form: {
        payin_over_amount: 0,
        payout_over_amount: 0,
        payin_over_chnl_id: null,
        payout_over_chnl_id: null,
      },
      // ChnlOptions: [],
    };
  },
  created() {
    this.$store.dispatch('fetchOptions');
    // this.SeekChnlOptions()
  },
  mounted() {

  },

  methods: {
    SeekChnlOptions() {
      if (this.ChnlOptions.length > 0) {
        return
      }
      listChnlSetting().then(res => {
        this.ChnlOptions = res.rows.sort((a, b) => {
          return a.id - b.id
        })
      })

    },
    //提交修改
    submit() {

      let message = ''
      this.$refs["DiversionForm"].validate((valid) => {
        if (valid) {
          let confirmList = this.ChangeList.map(item => {
            return {
              mch_num: item,
              payin_over_amount: this.form.payin_over_amount,
              payout_over_amount: this.form.payout_over_amount,
            }
          })
          //代收分流金额不为0，需要选择代收分流通道
          if (this.form.payin_over_amount > 0) {

            let payinIndex = this.ChnlOptions.findIndex(item => item.id == this.form.payin_over_chnl_id)
            confirmList = confirmList.map(item => {
              item.payin_over_chnl_id = this.ChnlOptions[payinIndex].id
              item.payin_over_chnl_name = this.ChnlOptions[payinIndex].chnl_name
              return item
            })
            message = message + '代收分流金额为 ' + this.form.payin_over_amount + ' 代收分流通道切换为 ' + this.ChnlOptions[payinIndex].chnl_name[0] + this.ChnlOptions[payinIndex].id
          }

          //代付分流金额不为0，需要选择代付分流通道
          if (this.form.payout_over_amount > 0) {
            let payoutIndex = this.ChnlOptions.findIndex(item => item.id == this.form.payout_over_chnl_id)
            confirmList = confirmList.map(item => {
              item.payout_over_chnl_id = this.ChnlOptions[payoutIndex].id
              item.payout_over_chnl_name = this.ChnlOptions[payoutIndex].chnl_name
              return item
            })
            message = message + '代付分流金额为 ' + this.form.payout_over_amount + ' 代付分流通道切换为 ' + this.ChnlOptions[payoutIndex].chnl_name[0] + this.ChnlOptions[payoutIndex].id

          }

          this.$confirm(
            '确认批量将商户' + message + ' 吗？', '提示',
            {
              type: 'warning',
              confirmButtonText: '确认',
              cancelButtonText: '取消',
            }).then(() => {
              this.form = {
                payin_over_amount: 0,
                payout_over_amount: 0,
                payin_over_chnl_id: null,
                payout_over_chnl_id: null,
              }
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
          return
        }
        this.$message.warning("请检查设置数据")
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
  components: { ChannelQuery }
};
</script>

<style scoped></style>
