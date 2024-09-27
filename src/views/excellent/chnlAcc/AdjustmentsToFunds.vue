<template>
    <el-dialog :title="'金额调整'" :visible.sync="showData" width="400px" append-to-body :before-close="() => {
        showData = false
    }">
        <el-form ref="form" :model="form" label-width="80px" class="Breakdown-el-form">
            <!--        <el-form-item label="商户id" prop="mchId">-->
            <!--          <el-input v-model="form.mchId" placeholder="请输入商户id" />-->
            <!--        </el-form-item>-->
            <el-form-item label="通道名称">
                <el-input v-model="form.channelName" placeholder="请输入通道名称" disabled />
            </el-form-item>
            <el-form-item label="调整金额">
                <el-input-number v-model="form.fundAdjust" placeholder="请输入金额" class="w100_input" />
            </el-form-item>
            <!-- <el-form-item label="调整方式">
                <el-select v-model="form.fundState" placeholder="请选择调整方式" class="w100_input">
                    <el-option v-for="item in selectList" :key="item.fund_state" :label="item.name"
                        :value="item.fundState"></el-option>
                </el-select>
            </el-form-item> -->
            <el-form-item label="备注">
                <el-input v-model="form.changeReason" type="textarea" placeholder="请备注调整原因" rows="3" />
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
                    channelName: '',
                    fundAdjust: 0,
                    fundState: 0,
                    changeReason: ''

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
            for (const key in this.form) {
                this.form[key] = newval[key] ? newval[key] : this.form[key];
            }
        }
    },
    data() {
        return {
            form: {
                channelName: '',
                fundAdjust: 0,
                fundState: 0,
                changeReason: ''
            },


            //调整选项
            selectList: [{
                name: '资金调整',
                fundState: 0
            },
            {
                name: '资金冻结',
                fundState: 1
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
            const mergedObj = { ...this.Change, ...this.form };
            this.showData = false
            this.$emit('UpdateAdjustmentsToFunds', mergedObj)
        },

    },
};
</script>