<template>
  <el-select v-model="SelectData" clearable filterable :filter-method="ChannelQuerySearch" ref="ChannelQuery"
    placeholder="请选择/搜索通道" :loading="Loading" @change="ChannelQueryChange">
    <el-option v-for="item in ChannelQueryList" :key="item.id" :label="item.channelName" :value="item.id"></el-option>
  </el-select>
</template>

<script>
import { listChnlSetting } from "@/api/excellent/chnlSetting"
export default {
  name: 'ChannelQuery',

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
      let index = this.ChannelQueryList.findIndex(item => item.id == value)
      this.$emit('ChannelQueryChange', this.ChannelQueryList[index]);
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
