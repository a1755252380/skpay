<template>
  <el-select :value="modelValue" clearable ref="ClientSearch" :loading="ClientSearchLoading"
    :remote-method="mchNumSearch" @change="handleChange" placeholder="请选择商户号" @clear="handleClear">
    <el-option v-for="item in ClientSearchList" :key="item.id" :label="item.mch_num" loading
      :value="item.mch_num"></el-option>
  </el-select>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'ClientSearchList',
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
    configName: {
      type: [String,],  // 可以是 String, Number 或 null
      default: 'config'
    }
  },
  data() {
    return {
      //客户搜索列表
      mch_num: '',
      // ClientSearchList: [],
      // ClientSearchLoading: false,
      FirstSearched: true,
    };
  },
  computed: {
    ClientSearchList() {
      if (this.configName == 'setting') {
        return this.$store.state.Cache.MchList;
      } else {
        return this.$store.state.Cache.MchNameList
      }
    },
    ClientSearchLoading() {
      if (this.configName == 'setting') {
        return this.$store.state.Cache.MchListLoading;
      } else {
        return this.$store.state.Cache.MchNameLoading
      }
    },
    ...mapState({
      // ClientSearchList: state => state.Cache.MchList,
      PassageList: state => state.Cache.channelList,
      // ClientSearchLoading: state => state.Cache.MchListLoading,
    })
  },
  mounted() {

  },
  created() {
    this.mchNumSearch()
  },

  methods: {
    //抛出选择内容
    mchNumChange(value) {
      let index = this.ClientSearchList.findIndex(item => item.mch_num == value)
      this.$emit('ClientSearchListChange', this.ClientSearchList[index]);
    },
    handleChange(value) {
      // 触发自定义的 change 事件，将值传递给父组件

      this.$emit('change', value);
    },
    handleClear() {
      this.mchNumSearch()
    },
    mchSearchType(query) {
      if (this.configName == 'setting') {
        return this.$store.dispatch('fetchMchList');
      } else {
        return this.$store.dispatch('fetchMchNameList')
      }
    },
    //搜索商户号
    mchNumSearch(value) {
      this.mchSearchType()
      return
      if (this.ClientSearchLoading) {
        return;
      }
      if (!/^-?\d+(\.\d+)?$/.test(value) && !this.FirstSearched) {
        this.$refs.ClientSearch.blur();
        this.$modal.msgWarning("请输入数字");
        this.FirstSearched = false;
        return;
      }
      this.ClientSearchLoading = true;

      this.FirstSearched = false;
      let query = {
        page: null,
        limit: null,
        mch_number: value,
        mch_name: null,
      };
      this.mchSearchType(query).then((response) => {
        if (response.rows.length != 0) {
          this.ClientSearchList = response.rows;
        }

        setTimeout(() => {
          this.ClientSearchLoading = false;
        }, 500);
      });
    },
  },
};
</script>
