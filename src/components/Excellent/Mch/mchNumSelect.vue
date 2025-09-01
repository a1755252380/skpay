<template>
  <el-select v-model="modelValue" clearable ref="ClientSearch" :loading="ClientSearchLoading"
    :remote-method="mchNumSearch" placeholder="请选择商户号" @change="handleChange" @clear="handleClear" v-bind="$attrs"
    :filterable="!('multiple' in $attrs)" v-on="$listeners">
    <el-option v-for="item in ClientSearchList" :key="item.id" :label="item.mch_num" :value="item.mch_num" />
  </el-select>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ClientSearchList',
  inheritAttrs: false,

  props: {
    value: {
      type: [String, Number, Array],
      default: null
    },
    configName: {
      type: String,
      default: 'config'
    }
  },

  data() {
    return {
      mch_num: '',
      FirstSearched: true
    };
  },
  mounted() {
    console.log(!this.$attrs.multiple);

  },
  computed: {
    modelValue: {
      get() {
        return this.value;
      },
      set(val) {

        this.$emit('update:value', val);
      }
    },

    ClientSearchList() {
      return this.configName === 'setting'
        ? this.$store.state.Cache.MchList
        : this.$store.state.Cache.MchNameList;
    },

    ClientSearchLoading() {
      return this.configName === 'setting'
        ? this.$store.state.Cache.MchListLoading
        : this.$store.state.Cache.MchNameLoading;
    },

    ...mapState({
      PassageList: state => state.Cache.channelList
    })
  },

  created() {
    this.mchNumSearch();
  },

  methods: {
    handleChange(value) {
      this.$emit('change', value);

    },

    handleClear() {
      this.mchNumSearch();
    },

    mchSearchType(query) {
      return this.configName === 'setting'
        ? this.$store.dispatch('fetchMchList')
        : this.$store.dispatch('fetchMchNameList');
    },

    mchNumSearch(value) {
      // 原样保留你的逻辑
      this.mchSearchType();
      return;


    }
  }
};
</script>
