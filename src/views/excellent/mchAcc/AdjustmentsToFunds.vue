<template>
  <el-dialog :title="'金额调整'" :visible.sync="showData" width="400px" append-to-body :before-close="() => {
    showData = false
  }">
    <el-form ref="form" :model="form" label-width="80px" class="Breakdown-el-form" :rules="rules">
      <!--        <el-form-item label="商户id" prop="mchId">-->
      <!--          <el-input v-model="form.mchId" placeholder="请输入商户id" />-->
      <!--        </el-form-item>-->
      <el-form-item label="商户号" prop="mch_number">
        <el-input v-model="form.mch_number" placeholder="请输入商户号" disabled />
      </el-form-item>
      <el-form-item label="调整金额" prop="big_amount">
        <el-input-number v-model="form.big_amount" placeholder="请输入金额" class="w100_input " />
      </el-form-item>
      <el-form-item label="调整方式" prop="operation">
        <el-select v-model="form.operation" placeholder="请选择调整方式" class="w100_input">
          <el-option v-for="item in selectList" :key="item.fund_state" :label="item.name"
            :value="item.operation"></el-option>
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
</template>

<script>
export default {
  name: 'AdjustmentsToFunds',
  props: ['Change', 'show'],
  computed: {

    showData: {
      set(value) {
        this.form = {
          mch_number: '',
          big_amount: 0,
          operation: 4,
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

    }
  },
  data() {
    return {
      form: {
        mch_number: '',
        big_amount: 0,
        operation: 4,
        msg: ''
      },
      rules: {
        msg: [{ required: true, message: '请输入备注', trigger: 'change' }],
        big_amount: [{ required: true, message: '请输入调整金额', trigger: 'change' }],
      },

      //调整选项
      selectList: [
        {
          name: '待结算余额到可用余额调整',
          operation: 4
        },
        {
          name: '待结算余额调整',
          operation: 1
        },
        {
          name: '代付余额调整',
          operation: 2
        },
        {
          name: '可用余额调整',
          operation: 3
        },

        {
          name: '可用余额到代付余额调整',
          operation: 5
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
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const mergedObj = { ...this.form };
          mergedObj['big_amount'] = mergedObj['big_amount'] * 100
          if (String(mergedObj['big_amount']).includes('.')) {
            let num = String(mergedObj['big_amount']).split('.')
            mergedObj['big_amount'] = Number(num[0] + num[1].slice(0, 2))
          } else {
            mergedObj['big_amount'] = parseInt(mergedObj['big_amount'])
          }
          // mergedObj['big_amount'] = parseInt(mergedObj['big_amount'].toFixed(2) * 100)
          console.log(mergedObj['big_amount']);

          if (mergedObj.operation == 4 || mergedObj.operation == 5) {
            mergedObj['big_amount'] = mergedObj['big_amount'] * -1
          }
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
