<template>
  <el-select v-model="SelectData" clearable filterable :filter-method="ChannelAccNumSearch" ref="ChannelAccNum"
    placeholder="请选择主体账户" :loading="Loading" @change="ChannelAccNumChange">
    <el-option v-for="item in ChannelAccNumList" :key="item.id" :label="item.accountName" :value="item.id"></el-option>
  </el-select>
</template>

<script>
import { listChnlAccConfig } from "@/api/excellent/chnlAccConfig"
export default {
  name: 'ChannelAccNum',

  data() {
    return {
      SelectData: '',
      Loading: false,
      ChannelAccNumList: []
    };
  },

  mounted() {

  },
  created() {
    this.ChannelAccNumSearch()
  },

  methods: {
    //抛出选择内容
    ChannelAccNumChange(value) {
      let index = this.ChannelAccNumList.findIndex(item => item.id == value)
      this.$emit('ChannelAccNumChange', this.ChannelAccNumList[index]);
    },


    //查询通道列表
    ChannelAccNumSearch(value) {
      if (this.Loading) {
        return
      }

      this.Loading = true
      let query = {
        pageNum: null,
        pageSize: null,
        accountName: value,
        terraceSymbol: null,
        state: null,
      }
      listChnlAccConfig(query).then(response => {
        this.ChannelAccNumList = response.rows.sort((a, b) => b.id - a.id);
        this.Loading = false;
      });

    }
  },
};
</script>
