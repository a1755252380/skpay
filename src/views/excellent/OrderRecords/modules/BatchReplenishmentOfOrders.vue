<template>
  <div>
    <el-drawer :visible.sync="drawerData" :before-close="updateDialogVisible">
      <div slot="title" class="drawer_title">批量进行补单</div>
      <div style="" class="drawer_div">
        <div class="header_div">
          <el-input type="textarea" :rows="4" placeholder="请输入订单号信息/直接复制粘贴Excel表数据" v-model="batchInput"
            size="small"></el-input>
          <el-button type="primary" size="small" @click="batchAddBlacklist" style="margin-top: 6px;">确定</el-button>
        </div>
        <div class="tagShow_div">
          <template v-for="(item, index) in batchList">
            <el-tag :key="index" type="info" size="small" closable @close="TagClose(index)" style="margin: 3px;">{{
              item
            }}</el-tag>
          </template>
        </div>
        <div class="footer_div">
          <div class="footer_div_text">

            <el-select class="w100_input" size="small" placeholder="请选择状态" v-model="BlackType">
              <el-option :label="item.label" :value="item.value" v-for="item in buttonOption"
                :key="item.value"></el-option>

            </el-select>
            <el-button type="warning" size="small" @click="ConfirmBatch" style="margin: 0 6px;"
              icon="el-icon-plus">添加</el-button>
          </div>
        </div>
      </div>

    </el-drawer>
    <el-dialog title="批量补单结果" :visible.sync="ResultDialogVisible" width="500px" center :show-close="false"
      :close-on-click-modal="false">
      <div class="FlexCenter">
        <!-- status="success" -->
        <div style="text-align: center;">
          <el-progress type="circle" :percentage="progress" :width="200" :stroke-width="18" :color="customColors"
            :status="status"></el-progress>
          <div class="ResultNum" v-if="progress < 100">已完成 <span class="blue">{{ successCount }}</span> / {{
            batchList.length }}</div>
          <div class="ResultNum" v-else>共:<span class="blue"> {{ batchList.length }} </span>条 成功:<span class="success">
              {{
                successCount }} </span> 失败:<span class="error"> {{ errorList.length }} </span> </div>
        </div>
      </div>
      <!-- v-if="progress >= 100" -->
      <template #footer>

        <el-button type="danger" size="small" @click="startTasks">复制失败的订单号</el-button>
        <el-button type="primary" size="small" @click="() => {
          ResultDialogVisible = false; drawerData = false
        }">完成</el-button>
      </template>
    </el-dialog>
  </div>

</template>
<script>

export default {
  name: 'BatchReplenishment',

  props: {
    drawer: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      ResultDialogVisible: false,
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
      buttonOption: [{
        label: '回调状态',
        value: 3
      },
      {
        label: '成功状态',
        value: 0
      },
      {
        label: '失败状态',
        value: 1
      },
      ],//选择类型
      BlackType: null,//选择类型
      batchInput: '',
      batchList: [],
    }
  },
  model: {
    prop: 'drawer',
    event: 'update:drawer'
  },
  computed: {
    drawerData: {
      get() {
        return this.drawer
      },
      set(val) {
        this.$emit('update:drawer', val)
      }
    }
  },
  watch: {

  },
  mounted() {
  },
  methods: {
    updateDialogVisible(val) {
      this.ResultDialogVisible = false
      this.batchList.splice(0)
      this.batchInput = ''
      this.BlackType = null
      this.drawerData = false
    },
    batchAddBlacklist() {
      const input = this.batchInput.trim();
      if (!input) return;

      // 使用正则表达式匹配中英文逗号，并根据匹配结果分割字符串
      const items = input
        .split(/\r\n|\r|\n/)
        .map(item => item.trim())
        .filter(Boolean);

      // 将分割的项添加到 batchList 中
      this.batchList = this.batchList.concat(items);

      // 清空输入框
      this.batchInput = '';
    },
    TagClose(index) {
      this.batchList.splice(index, 1);
    },
    //确认提交
    ConfirmBatch() {
      if (this.batchList.length == 0) {
        return this.$message.error('请输入要添加的订单信息');
      }
      if (this.BlackType == null) {
        return this.$message.error('请选择补单的状态');
      }
      this.$confirm('确认批量以' + this.buttonOption[this.BlackType].label + '进行补单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        let ConfirmList = []
        //   let query = {
        //   _id: value._id,
        //   mch_number: value.mch_number,
        //   order_type: parseInt(this.$route.query.type),
        //   operation: value.operation,
        // };



      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消批量补单'
        })
      })

    },
    //复制请求失败的订单
    copyerrorOrder() {
      const result = this.errorList.map(item => {
        return {
          _id: item._id,
          mch_number: item.mch_number,
          order_type: parseInt(this.$route.query.type),
          operation: item.operation,
        }
      })
    },
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
  }

};
</script>
<style lang='scss' scoped>
.ResultNum {
  margin: 6px 0 3px 0;
  font-size: 16px;
  font-weight: 500;
  color: #000;

  .blue {
    color: #4c6ee6
  }

  .success {
    color: #67c23a
  }

  .error {
    color: #f56c6c
  }
}




.drawer_title {
  font-size: 20px;
  font-weight: 500;
  color: #000;
}

::v-deep .el-drawer__header {
  margin-bottom: 12px;
}

::v-deep .el-progress.is-success .el-progress__text {
  font-size: 50px;
}

.drawer_div {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .divider {
    margin: 6px 0;
  }

  .header_div {}

  .tagShow_div {
    flex: 1;
    overflow-y: auto;
    margin: 16px 0;
  }

  .footer_div {

    .footer_div_text {
      display: flex;
      justify-content: space-between;

    }
  }
}
</style>
