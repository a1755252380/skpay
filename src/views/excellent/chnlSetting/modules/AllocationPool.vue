<template>
  <el-dialog title="通道分配池" :visible="computedVisible" width="600px" center @close="computedVisible = false"
    :close-on-click-modal="false">
    <div v-loading="loading">
      <div class="FlexCenter">
        <div class="AllocationPoolLabel">通道名:</div>
        <ChannelQuery style="padding: 0 8px;" v-model="SelectChnl"></ChannelQuery><el-button type="primary"
          @click="addAllocationPool" icon="el-icon-plus">添加</el-button>
      </div>
      <div class="FlexCenter" style="margin-top: 12px;width: 100%;">
        <div class="AllocationPoolLabel"> 通道池:</div>
        <div style="flex: 1;">
          <el-tag type="primary" v-for="item in allocationPoolList" :key="item.label" closable style="margin: 3px;"
            @close="removeAllocationPool(item)">{{ item.label
            }}</el-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="confirmAllocationPool" :disabled="!allocationPoolList.length">确定</el-button>

      <el-button type="primary" plain @click="computedVisible = false">取消</el-button>
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
    value: Boolean // 父组件 v-model
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
    // 请求数据，若已有数据或正在加载中，则不会重复请求
    this.$store.dispatch('fetchOptions');
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
      delAllocationPool(item.id).then(res => {
        this.allocationPoolList.splice(this.allocationPoolList.indexOf(item), 1);
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
      addAllocationPool({ chnl_names: confirmList }).then(res => {
        this.$message({
          message: '通道分配池列表已更新成功',
          type: 'success'
        });
        loading.close();
        this.$store.dispatch('fetchChannelPool');

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
      listAllocationPool().then(res => {
        if (res.chnl_names) {

          for (const key in res.chnl_names) {
            this.allocationPoolList.push({
              id: key,
              chnl_name: res.chnl_names[key],
              label: res.chnl_names[key][0] + key
            })
          }
        }
        this.loading = false;
      }).finally(() => {
        this.loading = false;
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