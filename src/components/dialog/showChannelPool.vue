<template>
  <el-popover v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" placement="bottom" trigger="hover">
    <el-button slot="reference" type="primary" size="mini">通道池</el-button>
    <template>
      <div>
        <span style="margin-right: 6px;" class="PayChannelPoolTitle">代收通道池1:</span>
        <el-tag v-for="item in payInChannelPool" :key="item.id" type="primary" style="margin: 3px;">{{
          item.label
          }}</el-tag>
      </div>
      <div>
        <span style="margin-right: 6px;" class="PayChannelPoolTitle">代收通道池2:</span>
        <el-tag v-for="item in PayInChannelPool2" :key="item.id" type="primary" style="margin: 3px;">{{
          item.label
          }}</el-tag>
      </div>
      <div>
        <span style="margin-right: 6px;" class="PayChannelPoolTitle">代付通道池:</span>
        <el-tag v-for="item in payOutChannelPool" :key="item.id" type="warning" style="margin: 3px;">{{
          item.label
          }}</el-tag>
      </div>
    </template>

  </el-popover>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: '',
  components: {

  },

  data() {
    return {

    }
  },
  computed: {
    ...mapState({
      payInChannelPool: state => state.Cache.PayInChannelPool,
      payOutChannelPool: state => state.Cache.PayOutChannelPool,
      PayInChannelPool2: state => state.Cache.PayInChannelPool2,
    }),

  },
  created() {
    this.$store.dispatch('fetchChannelPool', { type: 'payin1' });
    this.$store.dispatch('fetchChannelPool', { type: 'payin2' });
    this.$store.dispatch('fetchChannelPool', { type: 'payout' });

  },
  watch: {

  },
  mounted() {

  },
  methods: {

  }
};
</script>
<style lang='scss' scoped>
.PayChannelPoolTitle {
  font-weight: bold;
}
</style>