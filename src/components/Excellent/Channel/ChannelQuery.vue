<template>
  <el-select :value="modelValue" clearable ref="ChannelQuery" placeholder="请选择通道" :loading="Loading"
    @change="handleChange" class="w100_input">
    <el-option v-for="item in ChannelQueryList" :key="item.id" :label="item.id" :value="item[emitKey]"></el-option>
  </el-select>
  <!-- filterable :filter-method="ChannelQuerySearch" -->
</template>

<script>
import { listChnlSetting } from "@/api/excellent/chnlSetting"
export default {
  name: 'ChannelQuery',
  // 自定义 v-model 的 prop 和事件
  model: {
    prop: 'modelValue',  // 自定义 v-model 的 prop 名
    event: 'change'      // 自定义 v-model 的事件
  },
  props: {
    modelValue: {
      type: [String, Number, null],  // 可以是 String, Number 或 null
      default: null
    },
    emitKey: {
      type: [String],  // 可以是 String, Number 或 null
      default: 'id'
    }
  },
  data() {
    return {
      SelectData: '',
      Loading: false,
      ChannelQueryList: []
    };
  },


  mounted() {

  },
  created() {
    this.ChannelQuerySearch()
  },

  methods: {
    //抛出选择内容
    ChannelQueryChange(value) {
      let index = this.ChannelQueryList.findIndex(item => item[this.emitKey] == value)
      this.$emit('ChannelQueryChange', this.ChannelQueryList[index]);
    },
    handleChange(value) {

      // 触发自定义的 change 事件，将值传递给父组件
      this.$emit('change', value);
    },

    //查询通道列表
    ChannelQuerySearch(value) {
      if (this.Loading) {
        return
      }

      this.Loading = true
      let query = {
        pageNum: null,
        pageSize: null,
        channelName: value,
        terraceSymbol: null,
        state: null,
      }
      listChnlSetting(query).then(response => {
        this.ChannelQueryList = response.rows;
        setTimeout(() => {
          this.Loading = false;

        }, 500);
      });

    }
  },
};
</script>
