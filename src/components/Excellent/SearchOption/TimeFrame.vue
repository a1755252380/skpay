<template>
  <el-date-picker v-model="internalValue" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-"
    :picker-options="pickerOptions" start-placeholder="开始时间" end-placeholder="结束时间" class="w100_input"
    @change="TimeChange"></el-date-picker>
</template>

<script>
import moment from 'moment';
export default {
  name: 'timeFrame',
  model: {
    prop: 'modelValue',  // 自定义 v-model 的 prop 名
    event: 'change'      // 自定义 v-model 的事件
  },
  props: {
    modelValue: {
      type: [Array, null],  // 可以是 String, Number 或 null
      default: []
    },
    ParameterIndex: {
      type: String,
      default: 'create_time'
    }
  },
  data() {
    return {
      internalValue: this.modelValue,  // 绑定的内部值
      pickerOptions: {
        shortcuts: [
          {
            text: '今天一天',
            onClick(picker) {
              const start = moment().startOf('day').format("YYYY-MM-DD HH:mm:ss");
              const end = moment().endOf('day').format("YYYY-MM-DD HH:mm:ss");
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '昨天一天',
            onClick(picker) {
              const start = moment().subtract(1, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
              const end = moment().subtract(1, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '前天一天',
            onClick(picker) {
              const start = moment().subtract(2, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
              const end = moment().subtract(2, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '近三天',
            onClick(picker) {
              const end = moment().endOf('day').format("YYYY-MM-DD HH:mm:ss");
              const start = moment().subtract(3, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      }
    };
  },
  watch: {
    // 监听 modelValue 的变化，并更新内部的值
    modelValue(newVal) {
      this.internalValue = newVal;
    }
  },
  methods: {
    parseTime(value) {
      let utcTime, utcEndTime = null;
      if (value) {
        utcTime = this.$util.getUtcTime(value[0]) / 1000;
        utcEndTime = this.$util.getUtcTime(value[1]) / 1000;
      }
      this.$emit('parseTime', [utcTime, utcEndTime], this.ParameterIndex);
    },
    TimeChange(value) {
      this.parseTime(value);
      this.$emit('change', value); // 通知父组件更新 v-model
    }
  }
};
</script>

<style scoped>
.w100_input {
  width: 100%;
}
</style>
