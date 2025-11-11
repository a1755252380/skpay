<template>
  <el-select v-model="modelValue" clearable ref="ClientSearch" :loading="ClientSearchLoading"
    :remote-method="mchNumSearch" :placeholder="('placeholder' in $attrs) ? $attrs.placeholder : '请选择商户号'"
    @change="handleChange" @clear="handleClear" v-bind="$attrs" :filterable="!('multiple' in $attrs)" v-on="$listeners">
    <el-option v-for="item in ClientSearchList" :key="item.id" :label="item[valueKey]" :value="item[valueKey]" />
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
    },
    valueKey: {
      type: String,
      default: 'mch_num'
    }
  },

  data() {
    return {
      mch_num: '',
      FirstSearched: true
    };
  },
  mounted() {

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
        : this.$store.state.Cache.MchConfigList;
    },

    ClientSearchLoading() {
      return this.configName === 'setting'
        ? this.$store.state.Cache.MchListLoading
        : this.$store.state.Cache.MchConfigLoading;
    },


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
        : this.$store.dispatch('fetchMchConfigList');
    },

    mchNumSearch(value) {
      // 原样保留你的逻辑
      this.mchSearchType();
      return;


    }
  }
};
</script>
