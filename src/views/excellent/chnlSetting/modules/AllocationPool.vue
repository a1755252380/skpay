<template>
  <el-dialog :title="allocationPoolTypeLabel" :visible="computedVisible" width="600px" center
    @close="computedVisible = false" :close-on-click-modal="false">
    <div v-loading="loading">
      <div class="FlexCenter">
        <div class="AllocationPoolLabel">通道名:</div>
        <ChannelQuery style="padding: 0 8px;" v-model="SelectChnl" :showType="allocationPoolType"></ChannelQuery>
        <el-button :type="allocationPoolTypeColor" @click="addAllocationPool" icon="el-icon-plus">添加</el-button>
      </div>
      <div class="FlexCenter" style="margin-top: 12px;width: 100%;">
        <div class="AllocationPoolLabel"> 通道池:</div>
        <div style="flex: 1;">
          <el-tag :type="allocationPoolTypeColor" v-for="item in allocationPoolList" :key="item.label" closable
            style="margin: 3px;" @close="removeAllocationPool(item)">{{ item.label
            }}</el-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button :type="allocationPoolTypeColor" @click="confirmAllocationPool"
        :disabled="!allocationPoolList.length">确定</el-button>

      <el-button :type="allocationPoolTypeColor" plain @click="computedVisible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import ChannelQuery from '@/components/Excellent/Channel/ChannelQuery.vue';
import { listAllocationPool, addAllocationPool, delAllocationPool } from '@/api/excellent/chnlSetting';
import { mapState } from "vuex";
export default {
  components: {
    ChannelQuery
  },
  name: 'AllocationPool',
  props: {
    value: Boolean, // 父组件 v-model
    AllocationPoolType: String, // 分配池类型 payin/payout
  },
  computed: {
    computedVisible: {
      set(val) {

        this.$emit('input', val);
      },
      get() {
        return this.value;
      }
    },
    // 分配池类型 payin/payout
    allocationPoolType() {
      return this.AllocationPoolType;
    },
    allocationPoolTypeLabel() {
      //判断是什么类型的分配池
      //判断是什么类型的分配池 30/100
      if (this.allocationPoolType === 'payin1') {
        return '代收分配池1';
      } else if (this.allocationPoolType === 'payin2') {
        return '代收分配池2';
      }
      return '代付分配池';
      // return this.allocationPoolType === 'payin' ? '代收分配池' : '代付分配池';
    },
    allocationPoolTypeColor() {
      return this.allocationPoolType === 'payin1' || this.allocationPoolType === 'payin2' ? 'primary' : 'warning';
    },
    ...mapState({
      ChannelQueryList: state => state.Cache.channelList,
    }),
  },
  watch: {
    computedVisible(val) {
      if (val) {
        this.loading = true;
        this.SelectChnl = null;
        this.getList();
      }
    }
  },
  data() {
    return {
      SelectChnl: null,
      loading: false,
      allocationPoolList: []
    };
  },

  mounted() {

  },

  methods: {
    //删除通道分配池
    removeAllocationPool(item) {
      const loading = this.$loading({
        lock: true,
        text: '删除中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      delAllocationPool({
        type: this.allocationPoolType,
        chnl_ids: [String(item.id)]
      }).then(res => {
        this.allocationPoolList.splice(this.allocationPoolList.indexOf(item), 1);
        this.$store.dispatch('fetchChannelPool', {
          type: this.allocationPoolType,
          isUpdate: true,
        });
        this.$message({
          message: '通道分配池已删除成功',
          type: 'success'
        });
        loading.close();
      }).finally(() => {
        loading.close();
      });

    },
    //添加通道分配池
    confirmAllocationPool() {
      const confirmList = {}
      for (const key in this.allocationPoolList) {
        confirmList[this.allocationPoolList[key].id] = this.allocationPoolList[key].chnl_name
      }


      const loading = this.$loading({
        lock: true,
        text: '提交中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      addAllocationPool({
        type: this.allocationPoolType,
        chnl_names: confirmList
      }).then(res => {
        this.$message({
          message: this.allocationPoolTypeLabel + '列表已更新成功',
          type: 'success'
        });
        loading.close();
        this.$store.dispatch('fetchChannelPool', {
          type: this.allocationPoolType,
          isUpdate: true,
        });

        this.computedVisible = false;
      }).finally(() => {
        loading.close();
      });
    },


    //新增通道分配池
    addAllocationPool() {
      if (!this.SelectChnl) {
        this.$message({
          message: '请选择通道',
          type: 'warning'
        });
        return;
      }
      if (this.allocationPoolList.some(item => item.id == this.SelectChnl)) {
        this.$message({
          message: '通道已存在',
          type: 'warning'
        });
        return;
      }
      const chnl = this.ChannelQueryList.find(item => item.id == this.SelectChnl)
      this.allocationPoolList.push({
        id: chnl.id,
        chnl_name: chnl.chnl_name,
        label: chnl.chnl_name[0] + chnl.id
      });

    },
    //获取通道分配池
    getList() {
      this.allocationPoolList.splice(0);
      listAllocationPool({ type: this.allocationPoolType }).then(res => {
        if (res.chnl_names) {

          for (const key in res.chnl_names) {
            this.allocationPoolList.push({
              id: key,
              chnl_name: res.chnl_names[key],
              label: res.chnl_names[key][0] + key
            })
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false;

        }, 300);
      });
    },

  },
};
</script>

<style lang="scss" scoped>
.AllocationPoolLabel {
  width: 80px;
  font-size: 16px;
  font-weight: 600;
}
</style>