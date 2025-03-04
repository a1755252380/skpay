<template>
  <el-select :value="modelValue" clearable filterable :filter-method="mchNumSearch" ref="ClientSearch"
    :loading="ClientSearchLoading" :remote-method="mchNumSearch" @change="handleChange" placeholder="请选择商户名称"
    @clear="handleClear">
    <el-option v-for="item in ClientSearchList" :key="item.id" :label="item.mch_name" loading
      :value="item.mch_name"></el-option>
  </el-select>
</template>

<script>
import { listMchSetting } from "@/api/excellent/MchSetting";
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

  mounted() {

  },
  created() {
    this.mchNumSearch()
  },
  computed: {
    ...mapState({
      ClientSearchList: state => state.Cache.MchNameList,
      ClientSearchLoading: state => state.Cache.MchNameLoading,
    })
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
      this.FirstSearched = true
      this.mchNumSearch()
    },
    //搜索商户号
    mchNumSearch(value) {
      this.$store.dispatch('fetchMchNameList')
      return
      if (this.ClientSearchLoading) {
        return;
      }

      this.ClientSearchLoading = true;

      this.FirstSearched = false;
      let query = {
        page: null,
        limit: null,
        mch_number: null,
        mch_name: value,
      };
      listMchSetting(query).then((response) => {
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
