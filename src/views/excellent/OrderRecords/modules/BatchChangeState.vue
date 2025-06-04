<template>
  <!-- 批量输入弹窗 -->
  <BatchDrawer :BatchList.sync="BatchInputList" :drawer.sync="BatchInputShow" :title="'批量修改订单状态'">
    <div class="batch_div">
      <el-radio-group v-model="operation" class="radio-item">
        <el-radio v-for="item in radioList" :key="item.value" :label="item.value" class="radio-item-options" border>{{
          item.name }}</el-radio>
      </el-radio-group>
      <div class="batch_div_btn_div">
        <el-button type="warning" style="" class=" batch_div_btn " size="small" @click="ConfirmBatchSearch"
          icon="el-icon-circle-check">提交</el-button>
      </div>

    </div>
  </BatchDrawer>
</template>
<script>
import BatchDrawer from "@/components/dialog/BatchDrawer.vue";
export default {
  name: '',
  components: {

  },
  mixins: [],
  props: {
    BatchShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      BatchInputList: [],
      operation: 2,
      //状态
      radioList: [
        {
          name: "标记成功",
          value: 0,
        },
        {
          name: "标记失败",
          value: 1,
        },
        {
          name: "同步状态",
          value: 2,
        },
        {
          name: "回调状态",
          value: 3,
        },
      ],
    }
  },
  computed: {
    BatchInputShow: {
      get() {
        return this.BatchShow
      },
      set(val) {
        this.$emit('update:BatchShow', val)
      }

    }
  },
  watch: {

  },
  mounted() {

  },
  methods: {
    ConfirmBatchSearch() {
      if (this.BatchInputList.length == 0) {
        this.$message.error("请输入订单号")
        return
      }
      if (this.operation == 0) {
        return this.$confirm('批量将订单标记成功，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.confirmBatchClose()
        }).catch(() => {
          return
        })
      }
      this.confirmBatchClose()
    },
    confirmBatchClose() {
      const arr = [...this.BatchInputList]
      this.BatchInputList.splice(0, this.BatchInputList.length)
      this.$emit('submit', {
        merchant_order_id_list: arr, operation: this.operation
      })
      this.BatchInputShow = false
    }
  },
  components: {
    BatchDrawer
  }
};
</script>
<style lang='scss' scoped>
.radio-item {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
}
</style>
