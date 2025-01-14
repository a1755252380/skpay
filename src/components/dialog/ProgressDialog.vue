<template>
  <el-dialog :title="dialogTitle" :visible.sync="centerDialogVisible" width="400px" center :show-close="false"
    :close-on-click-modal="false" append-to-body @before-close="reset">
    <div class="FlexCenter">
      <!-- status="success" -->
      <div style="text-align: center;">
        <el-progress type="circle" :percentage="percentage" :width="200" :stroke-width="18" :color="customColors"
          :status="status"></el-progress>
        <div class="ResultNum" v-if="!isFinish" style="margin-bottom: 20px;">已完成 <span class="blue">{{ requestCount
            }}</span> / {{
              totalCount }}</div>
        <div class="ResultNum" v-else>总共:<span class="blue"> {{ totalCount }} </span> 成功:<span class="success">
            {{
              successCount }} </span> 失败:<span class="error"> {{ errorCount }} </span> </div>
      </div>
    </div>
    <template #footer v-if="isFinish && isClose">
      <!-- <el-button type="danger" size="small" @click="startTasks">复制失败的订单号</el-button> -->
      <el-button type="primary" size="small" @click="() => {
        reset()
        centerDialogVisible = false
      }">完成</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'WorkspaceJsonProgressDialog',
  props: {
    dialogShow: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: '正在批量处理，请稍后..'
    }
  },
  model: {
    prop: 'dialogShow',
    event: 'update:dialogShow'
  },
  computed: {
    centerDialogVisible: {
      get() {
        return this.dialogShow
      },
      set(val) {
        this.$emit('update:dialogShow', val)
      }

    },

    percentage() {

      if (this.totalCount > 0 && this.requestCount >= this.totalCount) {
        if (this.isFinish) {
          return 100
        }
        return 99
      }
      let result = parseInt(this.requestCount / this.totalCount * 100)

      if (isNaN(result)) {
        return 0
      }

      return Number(result)
    }

  },
  watch: {
    title: {
      handler(val) {
        this.dialogTitle = val
      },
      immediate: true
    }
  },

  data() {
    return {
      dialogTitle: '正在批量处理，请稍后..',
      totalCount: 0, // 总数量
      requestCount: 0, // 已请求数量
      status: null, // 进度条状态
      successCount: 0, // 成功数量
      errorCount: 0, // 失败数量
      errorList: [], // 失败列表
      successList: [], // 成功列表
      isClose: true, // 是否关闭
      //是否完成请求
      isFinish: false,
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
    delay(ms) {
      return new Promise((resolve) => {
        const time = setTimeout(() => {
          clearTimeout(time)
          resolve(true)
        }, ms)

      });
    },

    async batchRequest(submitList, requestFn, delayTime = 200) {
      if (!Array.isArray(submitList) || typeof requestFn !== "function") {
        throw new Error(
          "Invalid arguments: submitList should be an array and requestFn should be a function"
        );
      }
      this.centerDialogVisible = true
      console.log(submitList);
      this.isFinish = false
      this.totalCount = submitList.length;
      // 创建请求任务数组，每个任务在启动前按索引延时
      const tasks = submitList.map((item, index) =>
        (async () => {
          try {
            // 按索引延时
            if (delayTime > 0) {
              await this.delay(index * delayTime);
            }

            // 调用请求函数
            // const response = await this.ModifyOrderStatus()
            const response = await requestFn(item);
            this.successCount++;

            return { success: true, item, response };
          } catch (error) {
            this.errorCount++;

            return { success: false, item, error };
          } finally {
            this.requestCount++;

          }
        })()
      );

      // 并发执行所有请求任务
      const results = await Promise.all(tasks);

      // 分类整理成功和失败的结果
      if (results) {
        this.successList = results.filter((result) => result.success);
        this.errorList = results.filter((result) => !result.success);
        this.isFinish = true
        this.dialogTitle = '提交结果'
      }
      if (!this.isClose) {
        setTimeout(() => {
          this.centerDialogVisible = false
          this.isClose = true
          this.reset()
        }, 800);
      }

      return { successList: this.successList, errorList: this.errorList };
    },
    //重置进度条
    reset() {
      this.status = null, // 进度条状态
        this.successCount = 0, // 成功数量
        this.errorCount = 0, // 失败数量
        this.errorList = [], // 失败列表
        this.successList = [] // 成功列表
      this.isFinish = false
      this.requestCount = 0
      this.totalCount = 0
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

          reject({ success: false, data: query });
        }
      });
    },
    startTasks() {
      this.batchRequest(new Array(200).fill(1), this.ModifyOrderStatus)
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  border-radius: 12px;
}

::v-deep .el-dialog__body {
  padding: 10px 20px !important;
}

.ResultNum {
  font-size: 16px;
  font-weight: 500;
  padding: 10px 0 0 0;
}

.blue {
  color: #409eff;
}

.error {
  color: #f56c6c;
}

.success {
  color: #67c23a;

}
</style>
