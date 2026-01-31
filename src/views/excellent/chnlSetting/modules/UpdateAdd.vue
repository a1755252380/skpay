<template>
    <div v-loading="loading" style="margin: 8px;position: relative;">
        <el-form ref="form" :model="UpdateForm" :rules="rules" label-width="80px" label-position="top" style=" "
            class="editForm">
            <el-card class="form_card_first" :header="'通道信息'">
                <!-- <el-form-item label="通道ID" prop="id" v-if="UpdateForm.id">
                    <el-input v-model="UpdateForm.id" placeholder="请输入通道名称" disabled />
                </el-form-item> -->
                <el-form-item label="通道名称" v-if="UpdateForm.id">
                    <el-input :value="ChannelNameFormatter(UpdateForm)" placeholder="请输入通道名称" disabled />
                </el-form-item>
                <el-form-item label="货币代号" prop="currency">
                    <el-input v-model="UpdateForm.currency" placeholder="请输入货币代号" disabled />
                </el-form-item>
                <el-form-item label="结算模式" prop="settle_mode">
                    <el-select v-model="UpdateForm.settle_mode" placeholder="请选择通道结算模式" class="w100_input">
                        <el-option v-for="item in settleModeList" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="通道备注" prop="chnl_symbol">
                    <el-input type="textarea" :rows="3" v-model="UpdateForm.chnl_symbol" placeholder="请输入通道备注"
                        class="w100_input" />
                </el-form-item>
            </el-card>
            <div style="display: flex;align-items: flex-start;width: 100%;">
                <el-card class="form_card" :header="'代收设置'">
                    <el-form-item label="代收费率" prop="payin_rate">
                        <el-input-number v-model="UpdateForm.payin_rate" placeholder="请输入代收费率" :min="0.0000"
                            :precision="4" :step="0.0001" class="w100_input" />
                    </el-form-item>
                    <el-form-item label="单笔代收最低限额" prop="payin_min_limit">
                        <el-input-number v-model="UpdateForm.payin_min_limit" placeholder="请输入单笔代收最低限额" :min="0"
                            class="w100_input" @change="payInLimitChange" />
                    </el-form-item>

                    <el-form-item label="单笔代收最高限额" prop="payin_max_limit">
                        <el-input-number v-model="UpdateForm.payin_max_limit" placeholder="请输入单笔代收最大限额" :min="0"
                            class="w100_input" @change="payInLimitChange" />
                        <!-- <el-input v-model="UpdateForm.payin_max_limit" placeholder="请输入单笔代收最大限额" /> -->
                    </el-form-item>
                    <el-form-item label="代收单笔手续费" prop="payin_fee_single">
                        <el-input-number v-model="UpdateForm.payin_fee_single" placeholder="请输入代收单笔手续费" :min="0"
                            class="w100_input" />
                    </el-form-item>
                </el-card>
                <el-card class="form_card" :header="'代付设置'">

                    <el-form-item label="代付费率" prop="payout_rate">
                        <el-input-number v-model="UpdateForm.payout_rate" placeholder="请输入代收费率" :min="0.0000"
                            :precision="4" :step="0.0001" class="w100_input" />

                    </el-form-item>
                    <el-form-item label="代付单笔手续费" prop="payout_fee_single">
                        <el-input-number v-model="UpdateForm.payout_fee_single" placeholder="请输入单笔代付手续费" :min="0"
                            class="w100_input" />

                    </el-form-item>

                    <el-form-item label="单笔代付最低限额" prop="payout_min_limit">
                        <el-input-number v-model="UpdateForm.payout_min_limit" placeholder="请输入单笔代付最低限额" :min="0"
                            class="w100_input" @change="payOutLimitChange" />
                    </el-form-item>
                    <el-form-item label="单笔代付最高限额" prop="payout_max_limit">
                        <el-input-number v-model="UpdateForm.payout_max_limit" placeholder="请输入单笔代付最大限额" :min="0"
                            class="w100_input" @change="payOutLimitChange" />
                    </el-form-item>
                </el-card>
            </div>
            <div style="display: flex;align-items: flex-start;width: 100%;">
                <el-card class="form_card" :header="'代收手续费设置'">
                    <div v-show="UpdateForm.payin_max_limit == null || UpdateForm.payin_max_limit == 0"
                        class="form_card_tip center">
                        请先输入单笔代收最高限额</div>
                    <RateAdjust v-show="!(UpdateForm.payin_max_limit == null || UpdateForm.payin_max_limit == 0)"
                        :max="UpdateForm.payin_max_limit" :min="UpdateForm.payin_min_limit" v-model="payinRange"
                        :inputConfig="{
                            min: 0,
                            max: 1000,
                            step: 1,
                        }" :label="'手续费'">
                    </RateAdjust>
                </el-card>
                <el-card class="form_card" :header="'代付手续费设置'">
                    敬请期待
                    <!-- <div v-show="UpdateForm.payout_max_limit == null || UpdateForm.payout_max_limit == 0"
                        class="form_card_tip center">
                        请先输入单笔代付最高限额
                    </div>
                    <RateAdjust v-show="!(UpdateForm.payout_max_limit == null || UpdateForm.payout_max_limit == 0)"
                        :max="UpdateForm.payout_max_limit" :min="UpdateForm.payout_min_limit" v-model="payoutRange">
                    </RateAdjust> -->
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
import { cloneDeep } from 'lodash-es'
import moment from "moment";
import RateAdjust from '../../mchAccConfig/modules/RateAdjust.vue';
import { addChnlSetting, getChnlSetting, updateChnlSetting } from "@/api/excellent/chnlSetting";
export default {
    name: 'WorkspaceJsonUpdateAdd',
    components: {
        RateAdjust
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        id: {
            type: [Number, String, null],
            default: null
        },
    },

    data() {
        return {
            loading: true,
            UpdateForm: {
                id: null,
                chnl_name: null,
                terraceSymbol: null,
                state: null,
                payout_state: null,
                payin_state: null,
                currency: "INR",
                chargeback: null,
                payinMode: null,
                payin_rate: null,
                payout_rate: null,
                payout_fee_single: null,
                payinFeeSingle: null,
                payin_min_limit: null,
                payout_min_limit: null,
                payin_max_limit: null,
                payout_max_limit: null,
                delFlag: null,
                createBy: null,
                createTime: null,
                updateBy: null,
                updateTime: null,
                chnl_symbol: null,
                settle_mode: null
            },
            settleModeList: [
                {
                    label: '实时结算',
                    value: 0
                },
                {
                    label: '延时结算',
                    value: 1
                },
            ],
            rules: {
                settle_mode: [{ required: true, message: '请选择结算模式', trigger: 'change' }],
                payin_rate: [{ required: true, message: '请输入代收费率', trigger: 'blur' }],
                payout_rate: [{ required: true, message: '请输入代付费率', trigger: 'blur' }],
                payout_max_limit: [{ required: true, message: '请输入单笔代付最高限额', trigger: 'blur' }],
                payin_max_limit: [{ required: true, message: '请输入单笔代收最高限额', trigger: 'blur' }],
                payin_min_limit: [{ required: true, message: '请输入单笔代收最低限额', trigger: 'blur' }],
                payout_min_limit: [{ required: true, message: '请输入单笔代付最低限额', trigger: 'blur' }],
                payout_fee_single: [{ required: true, message: '请输入单笔代付手续费', trigger: 'blur' }],
                payin_fee_single: [{ required: true, message: '请输入单笔代收手续费', trigger: 'blur' }],
            },
            //代付费率区间
            payinRange: [],
            //代收付费率区间
            payoutRange: []
        };
    },

    mounted() {

    },
    watch: {
        id: {
            handler(newVal, oldVal) {
                if (newVal) {
                    this.getChnlInfo()
                    return
                }
            },
            immediate: true
        },
        show: {
            handler(newVal, oldVal) {
                this.loading = true
                if (!newVal) {
                    this.defaultForm()
                }
            },
            immediate: true
        }
    },
    methods: {
        // 取消按钮
        cancel() {
            this.$emit('cancel', false);
            this.defaultForm()

        },
        // 表单重置
        defaultForm() {
            this.payinRange = [],
                //代付费率区间
                this.payoutRange = []
            this.UpdateForm = cloneDeep({
                id: null,
                chnl_name: null,
                terraceSymbol: null,
                state: null,
                payout_state: null,
                payin_state: null,
                currency: "INR",
                chargeback: null,
                payinMode: null,
                payin_rate: null,
                payout_rate: null,
                payout_fee_single: null,
                payinFeeSingle: null,
                payin_min_limit: null,
                payout_min_limit: null,
                payin_max_limit: null,
                payout_max_limit: null,
                delFlag: null,
                createBy: null,
                createTime: null,
                updateBy: null,
                updateTime: null,
                chnl_symbol: null,
                settle_mode: null,
                payin_fee_single: null,
                payin_fee_single_interval: null,
            });
        },

        /** 提交按钮 */
        submitForm() {
            function allValuesValid(data) {
                return data.every(item => item.value !== '' && item.value !== null && item.value !== undefined);
            }
            if (this.payinRange.length == 0) {
                return this.$message.error('请添加价格区间手续费');
            }
            if (!allValuesValid(this.payinRange)) {
                return this.$message.error('请填写完整区间手续费');
            }
            //区间费率
            this.UpdateForm.payin_fee_single_interval = this.payinRange.reduce((acc, item) => {
                acc[item.label] = item.value;
                return acc;
            }, {})
            this.UpdateForm.payin_fee_single_interval = JSON.stringify(this.UpdateForm.payin_fee_single_interval)

            this.$refs["form"].validate(valid => {
                if (valid) {
                    this.loading = true;

                    if (this.UpdateForm.id != null) {
                        const form = cloneDeep(this.UpdateForm)
                        for (let key in form) {
                            if (form[key] === null || form[key] === undefined) {
                                delete form[key];
                            }
                        }
                        form.chnl_symbol = String(form.chnl_symbol)
                        updateChnlSetting(form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.$emit('refresh');
                        }).finally(() => {
                            this.loading = false;
                        });
                    } else {
                        this.UpdateForm['chnl_name'] = String(moment().format('YYYY-MM-DD/HH:mm:ss'));
                        addChnlSetting(this.UpdateForm).then(response => {
                            this.$modal.msgSuccess("新增成功");
                            this.$emit('refresh');
                        }).finally(() => {
                            this.loading = false;
                        });
                    }
                }
            });
        },
        //获取通道数据
        getChnlInfo() {


            if (this.id != null && this.UpdateForm.id == null) {
                this.loading = true
                getChnlSetting(this.id).then(response => {
                    if (response.rows[0].payin_fee_single_interval != null) {
                        //代收费率区间
                        const payinRateInterval = JSON.parse(response.rows[0].payin_fee_single_interval);
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
                    // if (response.rows[0].payout_rate_interval !== null) {
                    //     const payoutRateInterval = JSON.parse(response.rows[0].payout_rate_interval);
                    //     this.payoutRange = Object.keys(payoutRateInterval).map(key => {
                    //         const [min, max] = key.split('-').map(Number); // 将key拆分为min和max
                    //         return {
                    //             min,
                    //             max,
                    //             label: key,
                    //             value: payoutRateInterval[key]
                    //         };
                    //     });
                    // }
                    for (const key in this.UpdateForm) {
                        this.UpdateForm[key] = response.rows[0][key] != null ? response.rows[0][key] : this.UpdateForm[key]
                    }
                    this.loading = false

                });
            } else {
                this.defaultForm()
                this.loading = false
            }
        },
        ChannelNameFormatter(UpdateForm) {
            return this.Formatter.SettingChannelNameFormatter(UpdateForm)
        },
        //监听最低和最高额变化
        payOutLimitChange(value, index) {
            this.payoutRange = [];
        },
        payInLimitChange(value, index) {
            this.payinRange = [];
        }
    },
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