<template>
  <div v-loading="editloading" style="padding: 8px;position: relative;">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" label-position="top" style=" " class="editForm">
      <el-card class="form_card_first" :header="'商户信息'">
        <el-form-item label="商户号 " prop="mch_num">
          <el-select v-model="form.mch_num" placeholder="请选择商户号" :disabled="mchNumChange" class="w100_input">
            <el-option v-for="dict in ClientSearchList" :key="dict.mch_num" :label="dict.mch_num"
              :value="dict.mch_num" />
          </el-select>
        </el-form-item>
        <el-form-item label="货币代号" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入货币代号" disabled />
        </el-form-item>

        <el-form-item label="结算模式" prop="settle_mode">
          <el-select v-model="form.settle_mode" placeholder="请选择结算模式" class="w100_input">
            <el-option label="实时结算" :value="0"></el-option>
            <!-- <el-option label="延时结算" :value="1"></el-option> -->
            <el-option label="手动结算" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-card>
      <div style="display: flex;align-items: flex-start;width: 100%;">
        <el-card class="form_card" :header="'代收设置'">
          <el-form-item label="代收通道" prop="payin_chnl_id">
            <ChannelQueryVue v-model="form.payin_chnl_id"></ChannelQueryVue>
          </el-form-item><br>
          <el-form-item label="代收并发限制(笔/秒)" prop="payin_speed_limit">
            <template #label>
              代收并发限制(笔/秒) <el-tooltip class="item" effect="dark" content="代收并发限制为0时，默认代收并发不限制" placement="top">
                <i class="el-icon-view"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="form.payin_speed_limit" :min="0" class="w100_input"></el-input-number>
          </el-form-item>
          <el-form-item label="代理账户代收费率" prop="agent_payin_rate">
            <el-input-number v-model="form.agent_payin_rate" placeholder="请输入代理账户代收费率" :min="0.0" :precision="4"
              :step="0.0001" class="w100_input" />
          </el-form-item>
          <el-form-item label="单笔代收最高限额" prop="payin_max_limit">
            <el-input-number v-model="form.payin_max_limit" placeholder="请输入单笔代收最大限额" :min="form.payin_min_limit"
              class="w100_input" @change="payInLimitChange($event, 'max')" />
          </el-form-item>

          <el-form-item label="单笔代收最低限额" prop="payin_min_limit">
            <el-input-number v-model="form.payin_min_limit" placeholder="请输入单笔代收最低限额" :min="0"
              :max="form.payin_max_limit != 0 ? form.payin_max_limit : Infinity" class="w100_input"
              @change="payInLimitChange($event, 'min')" />
          </el-form-item>

          <el-form-item prop="payin_over_amount">
            <template #label>
              代收分流金额 <el-tooltip class="item" effect="dark" content="代收分流金额为0时，默认关闭代收分流功能" placement="top">
                <i class="el-icon-view"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="form.payin_over_amount" placeholder="请输入代收分流金额" :min="0" class="w100_input"
              :precision="0" />
          </el-form-item>
          <el-form-item label="代收分流通道" prop="payin_over_chnl_id">
            <ChannelQueryVue v-model="form.payin_over_chnl_id"
              :disabled="form.payin_over_amount == 0 || form.payin_over_amount == null"
              :placeholder="(form.payin_over_amount == 0 || form.payin_over_amount == null) ? '请先输入代收分流金额' : '请选择代收分流通道'">
            </ChannelQueryVue>
          </el-form-item>
          <el-form-item label="代收分流金额" prop="payin_over_amount" style="opacity: 0;">
            <el-input-number v-model="num" placeholder="请输入代收分流金额" :min="0" class="w100_input" :precision="0" />
          </el-form-item>
        </el-card>
        <el-card class="form_card" :header="'代付设置'">
          <el-form-item label="代付通道" prop="payout_chnl_id">
            <ChannelQueryVue v-model="form.payout_chnl_id"></ChannelQueryVue>
          </el-form-item><br>
          <el-form-item label="代付并发限制(笔/秒)" prop="payout_speed_limit">
            <template #label>
              代付并发限制(笔/秒) <el-tooltip class="item" effect="dark" content="代付并发限制为0时，默认代付并发不限制" placement="top">
                <i class="el-icon-view"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="form.payout_speed_limit" :min="0" class="w100_input"></el-input-number>
          </el-form-item>
          <el-form-item label="单笔代付手续费" prop="payout_fee_single">
            <el-input-number v-model="form.payout_fee_single" placeholder="请输入单笔代付手续费" :min="0" class="w100_input" />
          </el-form-item>
          <el-form-item label="单笔代付最高限额" prop="payout_max_limit">
            <el-input-number v-model="form.payout_max_limit" placeholder="请输入单笔代付最大限额" :min="form.payout_min_limit"
              class="w100_input" @change="payOutLimitChange($event, 'max')" />
          </el-form-item>
          <el-form-item label="单笔代付最低限额" prop="payout_min_limit">
            <el-input-number v-model="form.payout_min_limit" placeholder="请输入单笔代付最低限额" :min="0"
              :max="form.payout_max_limit != 0 ? form.payout_max_limit : Infinity" class="w100_input"
              @change="payOutLimitChange($event, 'min')" />
          </el-form-item>
          <el-form-item label="代理账户代付费率" prop="agent_payout_rate">
            <el-input-number v-model="form.agent_payout_rate" placeholder="请输入代理账户代付费率" :min="0.0" :precision="4"
              :step="0.0001" class="w100_input" />
          </el-form-item>
          <el-form-item label="代理账户单笔代付手续费" prop="agent_payout_fee">
            <el-input-number v-model="form.agent_payout_fee" placeholder="请输入代理账户单笔代付手续费" :min="0" class="w100_input" />
          </el-form-item>
          <el-form-item label="" prop="payout_over_amount">
            <template #label>
              代付分流金额 <el-tooltip class="item" effect="dark" content="代付分流金额为0时，默认关闭代付分流功能" placement="top">
                <i class="el-icon-view"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="form.payout_over_amount" placeholder="请输入代付分流金额" :min="0" class="w100_input" />
          </el-form-item>
          <el-form-item label="代付分流通道" prop="payout_over_chnl_id">
            <ChannelQueryVue v-model="form.payout_over_chnl_id"
              :disabled="form.payout_over_amount == 0 || form.payout_over_amount == null"
              :placeholder="(form.payout_over_amount == 0 || form.payout_over_amount == null) ? '请先输入代付分流金额' : '请选择代付分流通道'">
            </ChannelQueryVue>
          </el-form-item>
        </el-card>

      </div>
      <div style="display: flex;align-items: flex-start;width: 100%;">
        <el-card class="form_card" :header="'代收费率设置'">
          <div v-show="form.payin_max_limit == null || form.payin_max_limit == 0" class="form_card_tip center">
            请先输入单笔代收最高限额</div>
          <RateAdjust v-show="!(form.payin_max_limit == null || form.payin_max_limit == 0)" :max="form.payin_max_limit"
            :min="form.payin_min_limit" v-model="payinRange"></RateAdjust>
        </el-card>
        <el-card class="form_card" :header="'代付费率设置'">
          <div v-show="form.payout_max_limit == null || form.payout_max_limit == 0" class="form_card_tip center">
            请先输入单笔代付最高限额
          </div>
          <RateAdjust v-show="!(form.payout_max_limit == null || form.payout_max_limit == 0)"
            :max="form.payout_max_limit" :min="form.payout_min_limit" v-model="payoutRange">
          </RateAdjust>
        </el-card>

      </div>

    </el-form>
    <div class="edit_btn">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script>
import {
  listMchAccConfig,
  getMchAccConfig,
  delMchAccConfig,
  addMchAccConfig,
  updateMchAccConfig,
} from "@/api/excellent/mchAccConfig";
import { mapState } from 'vuex';
import ChannelQueryVue from '@/components/Excellent/Channel/ChannelQuery.vue';
import RateAdjust from "./RateAdjust.vue";
export default {
  name: '',
  components: {
    RateAdjust,

    ChannelQueryVue,
  },
  mixins: [],
  data() {
    const validateNumber = function (rule, value, callback) {
      if (value === "") {
        callback(new Error("费率不能为空"));
      } else if (!/^\d+(\.\d+)?$/.test(value)) {
        callback(new Error("请输入非负数字"));
      } else if (parseFloat(value) < 0) {
        callback(new Error("费率不能小于0"));
      } else {
        callback();
      }
    };

    return {
      num: 0,
      editloading: false,
      mchNumChange: false,
      // 表单参数
      form: {},
      FormBackup: {}, //表单备份
      // 表单校验
      rules: {
        mch_num: [
          { required: true, message: "商户号不能为空", trigger: "blur" },
          {
            validator: this.validate.validateNumber,
            message: "商户号必须为数字值",
            trigger: "change",
          },
        ],
        state: [
          {
            required: true,
            message: "状态 0.启用 1.禁用不能为空",
            trigger: "change",
          },
        ],
        payin_chnl_id: [
          { required: true, message: "请选择代收通道", trigger: "change" },
        ],
        payout_chnl_id: [
          { required: true, message: "请选择代付通道", trigger: "change" },
        ],
        settle_mode: [
          { required: true, message: "请选择结算模式", trigger: "change" },
        ],
        // payout_rate: [
        //   { required: true, message: "请输入正确的代付费率", trigger: "change" },
        //   { validator: validateNumber, message: '请输入正确的代付费率', trigger: "change" }
        // ],
        // payin_rate: [
        //   { required: true, message: "请输入正确的代收费率", trigger: "change" },
        //   { validator: validateNumber, message: '请输入正确的代收费率', trigger: "change" }
        // ],
        payout_fee_single: [
          { required: true, message: "请输入正确的单笔代付手续费", trigger: "change" },
          { validator: validateNumber, message: '请输入正确的单笔代付手续费', trigger: "change" }
        ],
        payin_over_amount: [
          { required: true, message: "请输入代收分流金额", trigger: "change" },
        ],
        payout_over_amount: [
          { required: true, message: "请输入代付分流金额", trigger: "change" },
        ],
        payout_over_chnl_id: [
          {
            validator: (rule, value, callback) => {

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
      //代收费率区间
      payinRange: [],
      //代付费率区间
      payoutRange: [],

    }

  },
  computed: {
    ...mapState({
      ClientSearchList: state => state.Cache.MchList,
      PassageList: state => state.Cache.channelList,
    })
  },
  created() {
    this.$store.dispatch('fetchMchList');
    this.$store.dispatch('fetchOptions');
    this.reset();
  },
  watch: {

  },
  mounted() {

  },
  methods: {
    // 取消按钮
    cancel() {
      this.reset();
      this.$emit('cancel');
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        mch_id: null,
        mch_num: null,
        currency: "INR",
        payout_chnl_id: null,
        payin_chnl_id: null,
        settle_mode: null,
        state: null,
        paymentMode: null,
        // payout_rate: null,
        // payin_rate: null,
        payout_fee_single: null,
        payinFeeSingle: null,
        agent_payin_rate: null,
        agent_payout_rate: null,
        agent_payout_fee: null,
        payin_min_limit: 0,
        payout_min_limit: 0,
        payin_max_limit: 0,
        payout_max_limit: 0,
        delFlag: null,
        createBy: null,
        createTime: null,
        update_by: null,
        update_time: null,
        payin_over_amount: 0,
        payout_over_amount: 0,
        payin_over_chnl_id: null,
        payin_over_chnl_name: null,
        payout_over_chnl_id: null,
        payout_over_chnl_name: null,
        payout_rate_interval: null,
        payin_rate_interval: null,
        payin_speed_limit: 0,
        payout_speed_limit: 0
      };
      this.resetForm("form");
      this.payinRange = [],
        //代付费率区间
        this.payoutRange = []
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加商户账户配置";
      this.mchNumChange = false;
    },
    /** 修改按钮操作 */
    handleUpdate(value) {

      this.editloading = true;
      this.reset();
      if (value === null || value === "") {
        this.mchNumChange = false;
        setTimeout(() => {
          this.editloading = false;
        }, 500);
      } else {
        this.mchNumChange = true;
        const id = value
        getMchAccConfig(id).then((response) => {
          if (response.rows[0].payin_rate_interval != null) {
            //代收费率区间
            const payinRateInterval = JSON.parse(response.rows[0].payin_rate_interval);
            this.payinRange = Object.keys(payinRateInterval).map(key => {
              const [min, max] = key.split('-').map(Number); // 将key拆分为min和max
              return {
                min,
                max,
                label: key,
                value: payinRateInterval[key]
              };
            });
          }
          if (response.rows[0].payout_rate_interval !== null) {
            const payoutRateInterval = JSON.parse(response.rows[0].payout_rate_interval);
            this.payoutRange = Object.keys(payoutRateInterval).map(key => {
              const [min, max] = key.split('-').map(Number); // 将key拆分为min和max

              return {
                min,
                max,
                label: key,
                value: payoutRateInterval[key]
              };
            });
          }
          this.FormBackup = { ...response.rows[0] };
          this.form = response.rows[0];
          setTimeout(() => {
            this.editloading = false;
          }, 500);
        });
      }

    },


    /** 提交按钮 */
    submitForm() {


      this.$refs["form"].validate((valid) => {
        // payoutProductName代付通道名称
        // payinProductName代收通道名称
        let payoutProductIndex = this.PassageList.findIndex((res) => {
          return res.id === this.form.payout_chnl_id;
        });
        let payinProductIndex = this.PassageList.findIndex((res) => {
          return res.id === this.form.payin_chnl_id;
        });
        this.form["payout_chnl_name"] =
          this.PassageList[payoutProductIndex].chnl_name;
        this.form["payin_chnl_name"] =
          this.PassageList[payinProductIndex].chnl_name;
        let UserIndex = this.ClientSearchList.findIndex((res) => {
          return res.mch_num === this.form.mch_num;
        });
        //分流代收通道名称
        if (this.form['payin_over_amount'] != 0 && this.form['payin_over_chnl_id']) {
          let payInOverIndex = this.PassageList.findIndex((res) => {
            return res.id === this.form.payin_over_chnl_id;
          });
          this.form['payin_over_chnl_name'] = this.PassageList[payInOverIndex].chnl_name
        }
        //分流代付通道数据
        if (this.form['payout_over_amount'] != 0 && this.form['payout_over_chnl_id']) {
          let payOutOverIndex = this.PassageList.findIndex((res) => {
            return res.id === this.form.payout_over_chnl_id;
          });
          this.form['payout_over_chnl_name'] = this.PassageList[payOutOverIndex].chnl_name
        }
        function allValuesValid(data) {
          return data.every(item => item.value !== '' && item.value !== null && item.value !== undefined);
        }

        if (this.payinRange.length == 0 || this.payoutRange.length == 0) {
          return this.$message.error('请添加价格区间费率');
        }
        if (!allValuesValid(this.payoutRange) || !allValuesValid(this.payinRange)) {
          return this.$message.error('请填写完整区间费率');
        }
        //区间费率
        this.form.payout_rate_interval = this.payoutRange.reduce((acc, item) => {
          acc[item.label] = item.value;
          return acc;
        }, {})
        this.form.payout_rate_interval = JSON.stringify(this.form.payout_rate_interval)
        this.form.payin_rate_interval = this.payinRange.reduce((acc, item) => {
          acc[item.label] = item.value;
          return acc;
        }, {})
        this.form.payin_rate_interval = JSON.stringify(this.form.payin_rate_interval)
        //提交内容
        let form = this.form;
        if (valid) {
          if (this.form.id != null) {
            let submitForm = {}
            submitForm["mch_num"] = form.mch_num;
            for (const key in this.FormBackup) {
              if (form[key] != this.FormBackup[key]) {
                submitForm[key] = form[key]
              }
            }
            updateMchAccConfig(submitForm).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.$emit("submit");
            });
          } else {
            form["mch_id"] = this.ClientSearchList[UserIndex]["id"];
            form["mch_num"] = this.ClientSearchList[UserIndex]["mch_num"];
            addMchAccConfig(form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.$emit("submit");
            }).finally(() => {

            })
              ;
          }
        }
      });
    },

    //监听最低和最高额变化
    payOutLimitChange(value, index) {

      this.payoutRange = [];
    },
    payInLimitChange(value, index) {

      this.payinRange = [];

    }
  }
};
</script>
<style lang='scss' scoped>
.editForm {
  padding-bottom: 76px;
}

.el-select input {
  width: 100% !important;
}

.form_card {
  box-shadow: none !important;
  border-radius: 8px;
  margin: 0.5rem;
  flex: 1;

  ::v-deep .el-card__body {
    display: grid;
    gap: 0px 16px;
    grid-template-columns: repeat(auto-fit, minmax(47%, 1fr));
  }
}

.form_card_first {
  box-shadow: none !important;
  border-radius: 8px;
  margin: 0.5rem;
  flex: 1;

  ::v-deep .el-card__body {
    display: grid;
    gap: 0px 16px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

::v-deep .el-dialog {
  border-radius: 16px;
}

::v-deep .el-dialog__body {
  padding: 30px 60px;
}

.edit_btn {
  background: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 2;
  text-align: right;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
}

.el-icon-view {
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}
</style>
<style lang="scss">
.form_card_tip {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #b6b4b4;
  font-weight: 500
}
</style>
