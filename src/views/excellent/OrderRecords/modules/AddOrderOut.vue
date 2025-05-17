<template>
  <el-dialog title="创建订单" :visible.sync="visible" width="750px" @close="beforeClose" :close-on-click-modal="false">
    <el-form ref="form" :model="form" label-width="120px" label-position="top" :rules="rules">
      <div class="form-item">
        <el-form-item label="商户号" prop="mch_number">
          <el-select v-model="form.mch_number" placeholder="请选择商户">
            <el-option label="888888" :value="888888"></el-option>
            <el-option label="999999" :value="999999"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="bene_name">
          <el-input v-model="form.bene_name" placeholder="请输入受益人姓名"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="bene_address">
          <el-input v-model="form.bene_address" placeholder="请输入受益人地址"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号" prop="bene_bank_acct">
          <el-input v-model="form.bene_bank_acct" placeholder="请输入受益人银行卡号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="bene_email">
          <el-input v-model="form.bene_email" placeholder="请输入受益人邮箱"></el-input>
        </el-form-item>
        <el-form-item label="IFSC" prop="bene_ifsc">
          <el-input v-model="form.bene_ifsc" placeholder="请输入IFSC"></el-input>
        </el-form-item>

        <el-form-item label="手机号（印度10位数）" prop="bene_phone">
          <el-input v-model="form.bene_phone" placeholder="请输入受益人手机号"></el-input>
        </el-form-item>
        <el-form-item label="pan码" prop="pan">
          <el-input v-model="form.pan" placeholder="请输入pan码(非必填)"></el-input>
        </el-form-item>
        <el-form-item label="订单号" prop="merchant_order_id">
          <div class="flex-item">
            <el-input v-model="form.merchant_order_id" placeholder="请输入订单号"></el-input>
            <el-button type="primary" @click="generateOrderId" style="margin-left: 6px">生成</el-button>
          </div>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" placeholder="请输入金额" :precision="2" :min="0"
            class="w100_input"></el-input-number>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="uploadDialogVisible = true">上传xlsx</el-button>
      <el-button type="primary" @click="handleConfirm">提交新订单</el-button>
    </template>


    <filesubmitPayoutVue v-model="uploadDialogVisible" @CancelUpload="CancelFileSubmit"> </filesubmitPayoutVue>
  </el-dialog>
</template>
<script>
import { AddPayOutOrder, } from '@/api/excellent/OrderRecords'
import NumberInput from '@/components/element/NumberInput.vue';
import filesubmitPayoutVue from './filesubmitPayout.vue';

export default {
  name: 'AddOrder',
  components: {
    NumberInput
  },
  mixins: [],
  props: {
    show: {
      type: Boolean,
      default: false
    },

  },
  mounted() {

    if (!(this.$route.query.type == 1 || this.$route.query.type == 0)) {
      this.$router.push({ path: '/404' });
    }

  },
  data() {
    return {
      //是否进行上传文件批量上传
      uploadDialogVisible: false,

      //提交数据
      form: {
        mch_number: 888888, //商户号
        amount: 0, //金额 单位（分）
        bene_address: 'India', //受益人地址
        bene_bank_acct: null, //受益人银行卡号
        bene_email: "123@gmail.com",//受益人邮箱
        bene_ifsc: null,//受益人银行代号
        bene_name: null, //受益人名字
        bene_phone: '9876543210',//受益人手机号（印度10位数）
        merchant_order_id: null, //商户自己的订单号
        pan: null, //商户的pan卡号
      },
      rules: {
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value <= 0) {
                callback(new Error('金额不能为0'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        bene_name: [


          { required: true, message: '请输入受益人姓名', trigger: ['blur', 'change'] },

        ],
        bene_address: [
          { required: true, message: '请输入受益人地址', trigger: 'blur' },
        ],
        bene_bank_acct: [
          { required: true, message: '请输入受益人银行卡号', trigger: 'blur' },
        ],
        bene_email: [
          { required: true, message: '请输入受益人邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
        ],
        bene_ifsc:
          [
            { required: true, message: '请输入受益人银行代号', trigger: 'blur' },
          ],

        bene_phone: [
          { required: true, message: '请输入受益人手机号', trigger: 'blur' },
          { pattern: /^\d{1,10}$/, message: '请输入最多10位的数字', trigger: 'blur' },
        ],
        merchant_order_id: [
          { required: true, message: '请输入商户自己的订单号', trigger: ['blur', 'change'] },

        ]

      }
    }
  },
  computed: {
    visible: {
      get() {
        return this.show;
      },
      set(val) {
        this.beforeClose();
        this.$emit('update:show', val);
      }
    }
  },
  watch: {

  },

  methods: {


    handleConfirm() {


      this.$refs.form.validate((valid) => {
        if (valid) {
          const loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          const submitForm = this.form
          submitForm.amount = submitForm.amount * 100

          AddPayOutOrder(submitForm).then(res => {
            this.visible = false
            const error = res.results.filter(item => item.code === 1)
            if (error.length > 0) {

              return this.$message.error(error[0].msg)
            }
            this.$message.success('新增代付订单成功')
          }).catch(err => {
            this.visible = false
          }
          ).finally(() => {
            loading.close()

          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });

    },
    generateOrderId() {
      this.form.merchant_order_id = this.$store.state.user.name + Math.floor(10000000 + Math.random() * 90000000)
    },
    beforeClose() {
      this.$refs.form.resetFields();

      this.form = {
        mch_number: 888888, //商户号
        amount: 0, //金额 单位（分）
        bene_address: 'India', //受益人地址
        bene_bank_acct: null, //受益人银行卡号
        bene_email: "123@gmail.com",//受益人邮箱
        bene_ifsc: null,//受益人银行代号
        bene_name: null, //受益人名字
        bene_phone: '9876543210',//受益人手机号（印度10位数）
        merchant_order_id: null, //商户自己的订单号
        pan: null, //商户的pan卡号
      }
    },
    CancelFileSubmit() {
      this.uploadDialogVisible = false
    }
  },
  components: {
    filesubmitPayoutVue
  }

};
</script>
<style lang='scss' scoped>
.form-item {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.flex-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
