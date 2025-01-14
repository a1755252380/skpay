<template>
  <el-dialog title="代付结算" :visible.sync="showData" width="400px" append-to-body :before-close="() => {
    showData = false
  }">
    <el-form ref="form" :model="form" label-width="90px" class="Breakdown-el-form" :rules="rules">
      <el-form-item label="商户号" prop="mch_number">
        <el-input v-model="form.mch_number" placeholder="请输入商户号" disabled />
      </el-form-item>
      <el-form-item label='已结算金额'>
        <el-input :value="showMsg.Balance" placeholder="请输入金额" class="w100_input " disabled />
      </el-form-item>
      <el-form-item label="备注" prop="msg">
        <el-input v-model="form.msg" type="textarea" placeholder="请备注调整原因" rows="3" />
      </el-form-item>


    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="showData = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ProxyChangeDialog',
  props: ['Change', 'show',],
  computed: {

    showData: {
      set(value) {
        this.resetForm()
        this.$emit('CloseProxyChangeDialog', value);
      },
      get() {
        return this.show;
      }
    }
  },
  watch: {
    Change(newval, oldval) {
      this.form['mch_number'] = newval['mch_number'];
      this.form['big_amount'] = newval['payin_success_amount_count'];
      this.form['end_time'] = newval['end_time'];
      this.form['chnl_id'] = newval['chnl_id']
      this.showMsg.Balance = this.Formatter.FormatAmount(newval['payin_success_amount_count']);
    }
  },
  data() {
    return {
      form: {
        mch_number: '',
        msg: '',
        operation: 5,
        big_amount: '',
        end_time: '',
        payout_settle_status: 1,
        chnl_id: 1
      },
      showMsg: {
        Balance: ''
      },
      rules: {
        msg: [{ required: true, message: '请输入备注', trigger: 'change' }],
      },


    };
  },

  mounted() {

  },

  methods: {
    //输入的数值变化
    bigAmountChange(currentValue, oldValue) {
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const mergedObj = { ...this.form };
          mergedObj['big_amount'] = mergedObj['big_amount'] * -1
          mergedObj['msg'] += '（通道：' + this.Change['chnl_id'] + ',' + '，结算时间：' + this.Formatter.FormatTime(
            this.Change['start_time'] * 1000, 'YYYY-MM-DD HH:mm:ss') + '-' + this.Formatter.FormatTime(this.Change['end_time'] * 1000, 'YYYY-MM-DD HH:mm:ss') + '）'

          this.resetForm()
          this.$emit('UpdateProxyChangeDialog', mergedObj, this.Change)
        } else {
          console.log('error submit!!');
          return false;
        }
      });


    },
    //重置数据
    resetForm() {
      this.form = {
        mch_number: '',
        msg: '',
        operation: 5,
        big_amount: '',
        end_time: '',
        payout_settle_status: 1,
        chnl_id: 0
      }
      this.$refs['form'].clearValidate()
    },
  },
};
</script>
