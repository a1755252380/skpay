<template>
  <el-select :value="modelValue" clearable ref="ChannelQuery" :loading="Loading" v-bind="$attrs" v-on="$listeners"
    @change="handleChange" class="w100_input" :placeholder="$attrs.placeholder || '请选择通道'">
    <el-option v-for="item in ChannelQueryList" :key="item.id"
      :label="(item.chnl_name == '' ? '' : item.chnl_name[0]) + item.id" :value="item[emitKey]"></el-option>
  </el-select>
</template>

<script>
import { mapState } from 'vuex';
export default {
  inheritAttrs: false, // 禁止自动绑定父组件的属性到根元素
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
      // Loading: false,
      // ChannelQueryList: []
    };
  },
  computed: {
    ...mapState({
      ChannelQueryList: state => state.Cache.channelList,
      Loading: state => state.Cache.loading, // 获取加载状态
    }),
  },

  mounted() {

  },
  created() {
    // 请求数据，若已有数据或正在加载中，则不会重复请求
    this.$store.dispatch('fetchOptions');

    // if (this.ChannelQueryList.length == 0) {
    //   this.ChannelQuerySearch()

    // }
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
      // if (this.Loading) {
      //   return
      // }

      // this.Loading = true
      // let query = {
      //   pageNum: null,
      //   pageSize: null,
      //   channelName: value,
      //   terraceSymbol: null,
      //   state: null,
      // }
      // listChnlSetting(query).then(response => {
      //   this.ChannelQueryList = response.rows.sort((a, b) => a.id - b.id);
      //   this.Loading = false;

      // });

    }
  },
};
</script>
