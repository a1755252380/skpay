<template>
    <el-dialog title="批量补单结果" :visible.sync="ResultDialogVisible" width="500px" center :show-close="false"
        :close-on-click-modal="false">
        <div class="FlexCenter">
            <!-- status="success" -->
            <div style="text-align: center;">
                <el-progress type="circle" :percentage="progress" :width="200" :stroke-width="18" :color="customColors"
                    :status="status"></el-progress>
                <div class="ResultNum" v-if="progress < 100">已完成 <span class="blue">{{ successCount }}</span> / {{
                    batchList.length }}</div>
                <div class="ResultNum" v-else>共:<span class="blue"> {{ batchList.length }} </span>条 成功:<span
                        class="success">
                        {{
                            successCount }} </span> 失败:<span class="error"> {{ errorList.length }} </span> </div>
            </div>
        </div>
        <template #footer>

            <el-button type="danger" size="small" @click="startTasks">复制失败的订单号</el-button>
            <el-button type="primary" size="small" @click="() => {
                ResultDialogVisible = false; drawerData = false
            }">完成</el-button>
        </template>
    </el-dialog>
</template>

<script>
export default {
    name: 'WorkspaceJsonProgressDialog',
    props: {
        progressDialogVisible: {
            type: Boolean,
            default: false
        },
        batchList: {
            type: Array,
            default: () => []
        },
        sumbuitFunction: {
            type: Function,
            default: () => { }
        }



    },
    computed: {
        ResultDialogVisible: {
            get() {
                return this.progressDialogVisible
            },
            set(val) {
                this.$emit('update:progressDialogVisible', val)
            }
        }
    },
    data() {
        return {
            progress: 0, // 当前进度百分比
            status: null, // 进度条状态
            successCount: 0, // 成功数量
            errorList: [], // 失败数量
            customColors: [
                { color: '#f56c6c', percentage: 20 },
                { color: '#e6a23c', percentage: 40 },
                { color: '#6f7ad3', percentage: 60 },
                { color: '#1989fa', percentage: 80 },
                { color: '#5cb87a', percentage: 100 }
            ],
        };
    },

    mounted() {

    },

    methods: {
        // 模拟延时功能
        async delay(duration) {
            return new Promise(resolve => setTimeout(resolve, duration));
        },

        // 封装带延时的请求方法
        async delayedRequest(query, delayDuration) {
            await this.delay(delayDuration); // 延时
            this.ModifyOrderStatus(query).then(response => {
                console.log(response);

                this.successCount++; // 记录成功请求数量
                return response;
            }).catch(error => {
                this.errorList.push(query); // 记录出错请求数量
                throw error; // 确保 Promise 保持失败状态
            })

        },

        async startTasks() {
            this.progress = 0;
            this.successCount = 0; // 重置成功请求数
            this.errorList = []; // 重置出错请求数

            // 模拟请求参数
            let queries = [];
            for (let index = 0; index < 500; index++) {
                queries.push({ orderId: index + 1, status: "completed" });
            }
            // 包装请求并更新进度
            const withProgress = (promises, onProgress) => {
                const total = promises.length;
                let completed = 0;

                const updateProgress = () => {
                    completed++;
                    onProgress((completed / total) * 100);
                };

                return Promise.all(
                    promises.map(p =>
                        p.finally(updateProgress) // 无论成功还是失败都更新进度
                    )
                );
            };

            // 生成带延时的请求列表，每个请求延时 1 秒
            const tasks = queries.map((query, index) => this.delayedRequest(query, index * 100));

            // 开始任务并更新进度条
            await withProgress(tasks, progress => {
                this.progress = parseInt(progress);
            });

            // 所有任务完成后的提示
            this.$message.success("所有任务已处理完成！");
        },
        //模拟测试
        async ModifyOrderStatus(query) {
            return new Promise((resolve, reject) => {
                // 模拟延时
                // 随机决定请求成功或失败
                const isSuccess = Math.random() > 0.3; // 70% 的概率成功，30% 的概率失败
                if (isSuccess) {
                    resolve({ success: true, data: query });
                } else {
                    reject(new Error("Request failed"));
                }
            });
        }
    },
};
</script>

<style scoped></style>
