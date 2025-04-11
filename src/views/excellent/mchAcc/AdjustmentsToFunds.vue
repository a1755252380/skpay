<template>
  <div>
    <el-dialog
      :title="fundStateData == 'PositiveAdjustment' ? '金额调整' : (fundStateData == 'CollectionAndSettlement' ? '代收结算' : '代付结算')"
      :visible.sync="showData" width="400px" append-to-body :before-close="() => {
        showData = false
      }">
      <el-form ref="form" :model="form" label-width="90px" class="Breakdown-el-form" :rules="rules">

        <el-form-item label="商户号" prop="mch_number">
          <el-input v-model="form.mch_number" placeholder="请输入商户号" disabled />
        </el-form-item>
        <el-form-item :label="fundStateData == 'CollectionAndSettlement' ? '待结算余额' : '可用余额'"
          v-if="fundStateData == 'CollectionAndSettlement' || fundStateData == 'ProxyPaymentSettlement'">
          <el-input :value="showMsg.Balance" placeholder="请输入金额" class="w100_input " disabled />
        </el-form-item>
        <el-form-item label="调整金额" prop="big_amount">
          <el-input-number v-model="form.big_amount" placeholder="请输入金额" class="w100_input " :precision="2"
            @change="bigAmountChange" />
        </el-form-item>
        <el-form-item label="调整方式" prop="operation">
          <el-select v-model="form.operation" placeholder="请选择调整方式" class="w100_input">
            <template v-for="item in selectList">
              <el-option :key="item.operation" :label="item.name" v-if="item.fund_state == fundStateData"
                :value="item.operation"></el-option>
            </template>

          </el-select>
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

  </div>

</template>

<script>
export default {
  name: 'AdjustmentsToFunds',
  props: ['Change', 'show', 'fundState'],
  computed: {
    fundStateData() {
      return this.fundState
    },
    showData: {
      set(value) {
        this.form = {
          mch_number: '',
          big_amount: 0,
          operation: null,
          msg: ''

        },
          this.$emit('CloseAdjustmentsToFunds', value);
      },
      get() {
        return this.show;
      }
    }
  },
  watch: {
    Change(newval, oldval) {
      this.form['mch_number'] = newval['mch_num'];
      this.showMsg.Balance = this.Formatter.FormatAmount(this.fundStateData == 'CollectionAndSettlement' ? newval['account_pending_settlement_balance'] : newval['account_payout_balance'])
      this.form.operation = this.fundStateData == 'PositiveAdjustment' ? null : (this.fundStateData == 'CollectionAndSettlement' ? 4 : 5)
    }
  },
  data() {
    return {


      form: {
        mch_number: '',
        big_amount: 0,
        operation: null,
        msg: ''
      },
      showMsg: {
        Balance: ''
      },
      rules: {
        msg: [{ required: true, message: '请输入备注', trigger: 'change' }],
        big_amount: [{ required: true, message: '请输入调整金额', trigger: 'change' }],
      },

      //调整选项
      selectList: [
        {
          name: '待结算余额到可用余额调整',
          operation: 4,
          fund_state: 'CollectionAndSettlement'

        },
        {
          name: '待结算余额调整',
          operation: 1,
          fund_state: 'PositiveAdjustment'
        },
        {
          name: '代付余额调整',
          operation: 2,
          fund_state: 'PositiveAdjustment'
        },
        {
          name: '可用余额调整',
          operation: 3,
          fund_state: 'PositiveAdjustment'
        },

        {
          name: '可用余额到代付余额调整',
          operation: 5,
          fund_state: 'ProxyPaymentSettlement'
        },
        {
          name: '冻结金额调整',
          operation: 6,
          fund_state: 'PositiveAdjustment'
        },
        //     {
        //     name: '资金调整',
        //     fund_state:0
        // },

      ]
    };
  },

  mounted() {

  },

  methods: {
    //输入的数值变化
    bigAmountChange(currentValue, oldValue) {
      console.log(currentValue, oldValue);
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const mergedObj = { ...this.form };

          mergedObj['big_amount'] = Math.floor(mergedObj['big_amount'] * 100)
          // mergedObj['big_amount'] = mergedObj['big_amount'] * 100
          // if (String(mergedObj['big_amount']).includes('.')) {
          //   let num = String(mergedObj['big_amount']).split('.')
          //   mergedObj['big_amount'] = Number(num[0] + num[1].slice(0, 2))
          // } else {
          //   mergedObj['big_amount'] = parseInt(mergedObj['big_amount'])
          // }
          // mergedObj['big_amount'] = parseInt(mergedObj['big_amount'].toFixed(2) * 100)


          if (mergedObj.operation == 4 || mergedObj.operation == 5) {
            mergedObj['big_amount'] = mergedObj['big_amount'] * -1
          }
          console.log(mergedObj);
          // return
          this.showData = false
          this.$emit('UpdateAdjustmentsToFunds', mergedObj)
        } else {
          console.log('error submit!!');
          return false;
        }
      });


    },

  },
};
</script>
