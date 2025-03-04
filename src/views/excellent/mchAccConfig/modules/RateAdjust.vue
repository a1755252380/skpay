<template>
  <div class="form_range">
    <!-- <p class="form_range_title">请输入价格费率区间</p> -->
    <div class="form_range_input">

      <div>
        <div class="form_range_input_label">最低价格</div>
        <el-input-number v-model="Range.min" placeholder="请输入最低价格" :min="Range.min" :max="maxValue" :step="1"
          :disabled="Range.min == Range.max" />
      </div>
      <div>
        <div class="form_range_input_label"></div>
        <div class="form_range_input_split"></div>

      </div>
      <div>
        <div class="form_range_input_label">最高价格</div>
        <el-input-number v-model="Range.max" placeholder="请输入最高价格" :min="Range.min" :max="maxValue" :step="1"
          :disabled="Range.min == Range.max && Range.max == maxValue" />
      </div>
      <div>
        <div class="form_range_input_label"></div>
        <el-button type="primary" style="margin-left: 12px;" :disabled="Range.min == Range.max"
          @click="handleRange('in')">添加</el-button>


      </div>
    </div>
    <div class="form_range_input_label " style="margin: 6px 0 0 0;"
      v-show="!(Range.min == Range.max && Range.max == maxValue)">
      价格范围：[{{ Range.min }},{{ Range.max }})
    </div>
    <div>
      <div class="form_range_input_label" style="margin: 12px 0;" v-show="value.length > 0">区间费率设置 <el-button
          type="danger" @click="handleRange('clear')" size="mini">清空</el-button></div>
    </div>
    <div class="Rate_input_list" v-show="value.length > 0">
      <div v-for="(item, index) in value" :key="index"
        :class="item.value ? 'Rate_input' : ' Rate_input Rate_input_error'">
        <div class="form_range_input_label" style="margin-right: 12px;">{{ item.label }} 元</div>
        <div>
          <span class="form_range_input_label">费率：</span>
          <el-input-number v-model="item.value" placeholder="请输入费率" :min="0.00" :max="1" :step="0.01" />

        </div>
      </div>

    </div>
    <div v-show="value.length <= 0" class="form_card_tip center" style="min-height: 140px;">
      请添加区间费率
    </div>
  </div>


</template>
<script>
export default {
  name: '',
  components: {

  },

  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    value: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      Range: {
        min: 0,
        max: 0
      },
    }
  },
  computed: {
    minValue() {
      return this.min
    },
    maxValue() {
      return this.max
    },
  },
  watch: {

    min(newVal, oldVal) {
      this.Range.min = newVal
    },
    max(newVal, oldVal) {
      this.Range.max = newVal
    },
    value(newVal, oldVal) {
      if (newVal.length > 0) {
        this.Range.min = Math.max(...newVal.map(item => item.max))
      } else {
        this.Range.min = this.min
      }
    }
  },
  created() {

  },
  beforeMount() {

  },
  beforeDestroy() {

  },
  activated() {
  },
  mounted() {

  },
  methods: {
    // 触发自定义事件，通知父组件更新
    handleChange() {
      this.$emit('change', [...this.value]); // 使用新的数组引用以确保更新
    },
    //添加区间
    handleRange(index) {
      if (index == 'clear') {
        return this.$confirm('确定要清空吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.value.splice(0, this.value.length);
          this.Range.min = this.minValue;
          this.Range.max = this.maxValue;
          return
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        })

      }

      if (this.Range.min >= this.Range.max) {
        this.$message.error("请输入正确的区间");
        this.Range.min = this.minValue;
        this.Range.max = this.maxValue;
        return;
      }
      this.value.push({
        min: this.Range.min,
        max: this.Range.max,
        label: this.Range.min + "-" + this.Range.max,
        value: 0,
      });
      this.handleChange();
      this.Range.min = this.Range.max;
      this.Range.max = this.maxValue;
      console.log("*****", this.Range.min, this.Range.max);

    },
  }
};
</script>
<style lang='scss' scoped>
.form_range_input_label {
  height: 28px;
  font-size: 14px;
  color: #606266;
  vertical-align: middle;
  // line-height: 36px;
  font-weight: 700;
  // padding: 0 0 0 10px;
}

.form_range {
  min-height: 200px;

  .form_range_title {}

  .form_range_input {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }



  .form_range_input_split {
    width: 16px;
    height: 2px;
    background: #bebfc0;
    margin: 0 8px;
  }

  .Rate_input_list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    /* 自动填充每列最小200px，最大1fr */
    gap: 10px;
    /* 每个项目之间的间隔 */
  }

  .Rate_input {
    padding: 12px;
    border: 1px solid;
    border-radius: 12px;
    background-color: rgb(244, 244, 245);
    border-color: rgb(233, 233, 235);
  }

  .Rate_input_error {
    border-color: #fa8888 !important
  }
}
</style>
