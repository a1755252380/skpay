<template>
  <el-drawer title="订单号" :visible.sync="drawer">
    <div class="header_div">
      <el-input type="textarea" :rows="4" placeholder="请输入商户订单号/直接复制粘贴Excel表数据" v-model="drawerInput"
        size="small"></el-input>
      <el-button type="primary" size="small" @click="batchOrderList" style="margin-top: 6px;">确定</el-button>
    </div>
    <div class="tagShow_div">
      <template v-for="(item, index) in orderList">
        <el-tag :key="item" type="info" size="small" closable @close="TagClose(index)" style="margin: 3px;">{{
          item
          }}</el-tag>

      </template>

    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="drawer = false">确 定</el-button>
      <el-button @click="drawer = false">取 消</el-button>

    </div>
  </el-drawer>
</template>
<script>
export default {
  name: '',
  components: {

  },
  mixins: [],
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      drawerInput: "",
      orderList: [],//订单列表
    }
  },
  computed: {
    drawer: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('change:drawer', val);
      }
    }
  },
  watch: {

  },
  mounted() {

  },
  methods: {
    batchOrderList() {
      const input = this.drawerInput.trim();
      if (!input) return;

      // 使用正则表达式匹配中英文逗号，并根据匹配结果分割字符串
      const items = input
        .split(/\r\n|\r|\n/)
        .map(item => item.trim())
        .filter(Boolean);

      this.orderList = this.orderList.concat(items);

      // 清空输入框
      this.drawerInput = '';
    }
  }
};
</script>
<style lang='' scoped>
</style>