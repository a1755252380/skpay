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


      <el-button :type="allocationPoolTypeColor" plain @click="computedVisible = false">取消</el-button>
      <el-button :type="allocationPoolTypeColor" @click="confirmAllocationPool"
        :disabled="!allocationPoolList.length">确定</el-button>
    </template>

    <!-- 通道选择弹窗 -->
    <el-dialog title="通道选择" :visible.sync="channelQueryVisible" width="600px" center append-to-body
      :close-on-click-modal="false">
      <div class="SelectChnlDiv">
        <div class="SelectChnl">
          <div class="SelectChnlLabel"> 商户:</div>
          <div class="SelectChnlContent">
            <el-tag v-for="item in changeChnlItem" :key="item" style="margin: 3px;" :type="allocationPoolTypeColor">{{
              item
              }}</el-tag>
          </div>
        </div>
        <div class="SelectChnl">
          <div class="SelectChnlLabel"> 通道:</div>
          <div class="SelectChnlContent">
            <ChannelQuery v-model="changeChnl" placeholder="请选择通道池中的通道" style="width: 100%;"
              :showType="allocationPoolType">
            </ChannelQuery>
            <!-- <el-select v-model="changeChnl" placeholder="请选择通道池中的通道" style="width: 100%;">
              <el-option v-for="item in allocationPoolList" :key="item.id" :label="item.label"
                :value="item.id"></el-option>
            </el-select> -->
          </div>
        </div>
      </div>

      <template #footer>
        <el-button :type="allocationPoolTypeColor" plain @click="channelQueryVisible = false">取消</el-button>
        <el-button :type="allocationPoolTypeColor" @click="confirmChannelQuery">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script>
import ChannelQuery from '@/components/Excellent/Channel/ChannelQuery.vue';
import { listAllocationPool, addAllocationPool, delAllocationPool } from '@/api/excellent/chnlSetting';
import {
  listMchAccConfig,
  updateMchAccConfig,
} from "@/api/excellent/mchAccConfig";
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
        this.changeChnl = null;
        this.changeChnlItem = [];
        this.getList();
      }
    }
  },
  data() {
    return {
      changeChnl: null,
      SelectChnl: null,
      loading: false,
      allocationPoolList: [],//通道池
      // 通道选择弹窗
      channelQueryVisible: false,
      // 通道选择弹窗选中的通道
      changeChnlItem: [],
    };
  },

  mounted() {

  },

  methods: {
    //取消切换通道
    cancelChannelQuery() {
      this.changeChnl = null;
      this.channelQueryVisible = false;
    },
    //确认切换通道

    confirmChannelQuery() {

      const loading = this.$loading({
        lock: true,
        text: '切换中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      const chnl = this.ChannelQueryList.find(item => item.id == this.changeChnl)

      if (!chnl) {
        this.$message({
          type: 'error',
          message: '请选择通道!'
        });
        return;
      }
      // {"mch_num":8801,"payin_chnl_id":30,"payin_chnl_name":"1s_4"}
      const promiselist = this.changeChnlItem.map((mch_num, index) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            updateMchAccConfig({
              mch_num: Number(mch_num),
              [this.allocationPoolType === 'payin1' || this.allocationPoolType === 'payin2'
                ? 'payin_chnl_id'
                : 'payout_chnl_id']: Number(chnl.id),
              [this.allocationPoolType === 'payin1' || this.allocationPoolType === 'payin2'
                ? 'payin_chnl_name'
                : 'payout_chnl_name']: chnl.chnl_name,
            })
              .then(resolve)
              .catch(reject)
          }, index * 400)
        })
      })
      Promise.all(promiselist).then(res => {
        this.$message({
          type: 'success',
          message: '切换成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '切换失败!'
        });
      }).finally(() => {
        this.channelQueryVisible = false;
        this.changeChnl = null;
        loading.close();
      });
    },
    //检测是否有商户在使用该通道
    async checkMchAccConfig(type, item) {
      this.$confirm(`是否检测该通道是否有商户在使用?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'AllocationPoolConfirm'
      }).then(async () => {
        const loading = this.$loading({
          lock: true,
          text: '检测该通道是否有商户在使用...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        return await listMchAccConfig({
          page: 1,
          limit: 500,
          [type === 'payin1' || type === 'payin2' ? 'payin_chnl_id' : 'payout_chnl_id']: item.id,
        }).then(res => {
          if (res.rows.length) {
            //忽略列表
            const ignoreList = [888888, 999999, 1234567]
            this.changeChnlItem = res.rows.filter((item) => {
              const isIgnore = ignoreList.includes(item.mch_num)

              //是否打开
              let isOpen = false
              if (type === 'payin1' && item.payin_first_distribution == 0) {
                isOpen = true
              }
              if (type === 'payin2' && item.payin_second_distribution == 0) {
                isOpen = true
              }
              if (type === 'payout' && item.payout_distribution == 0) {
                isOpen = true
              }

              return !isIgnore && isOpen
              // return !isIgnore && item[type === 'payin1' || type === 'payin2' ? 'payin_chnl_id' : 'payout_chnl_id'] === 0
            }).map(item => item.mch_num);
            this.channelQueryVisible = true;
            return
          }
          this.$message({
            type: 'info',
            message: '该通道下没有商户在使用'
          });
        }).finally(() => {
          loading.close();
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });

      });

    },
    //删除通道分配池
    removeAllocationPool(item) {

      //删除通道前先查询是否有商户在使用该通道
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
        this.$message({
          message: '通道分配池已删除成功',
          type: 'success'
        });
        this.allocationPoolList.splice(this.allocationPoolList.indexOf(item), 1);
        this.$store.dispatch('fetchChannelPool', {
          type: this.allocationPoolType,
          isUpdate: true,
        });

        loading.close();
        if (this.allocationPoolList.length) {
          this.checkMchAccConfig(this.allocationPoolType, item)
        }
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
.SelectChnlDiv {}

.SelectChnl {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.SelectChnlLabel {
  width: 60px;
  font-size: 16px;
  font-weight: 600;
}

.SelectChnlContent {
  flex: 1;
}

.AllocationPoolConfirm {
  z-index: 9999;
}

.AllocationPoolLabel {
  width: 80px;
  font-size: 16px;
  font-weight: 600;
}
</style>