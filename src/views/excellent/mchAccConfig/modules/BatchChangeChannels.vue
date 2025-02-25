<template>
  <el-dialog title="批量修改通道" :visible.sync="visible" width="600px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="商户">
        <el-tag v-for="item in ChangeListData" :key="item" style="margin: 3px;">{{ item }}</el-tag>
      </el-form-item>
      <el-form-item label="代收通道">
        <el-select v-model="form.payin_chnl_id" placeholder="请选择代收通道" class="w100_input">
          <el-option v-for="item in ChnlOptions" :key="'payin_' + item.id"
            :label="(item.chnl_name == '默认' ? '' : (item.chnl_name == '' ? '' : item.chnl_name[0])) + item.id"
            :value="item.id"></el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="代付通道">
        <el-select v-model="form.payout_chnl_id" placeholder="请选择代付通道" class="w100_input">
          <el-option v-for="item in ChnlOptions" :key="'payin_' + item.id"
            :label="(item.chnl_name == '默认' ? '' : (item.chnl_name == '' ? '' : item.chnl_name[0])) + item.id"
            :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import ChannelQuery from '@/components/Excellent/Channel/ChannelQuery.vue';
import { listChnlSetting } from "@/api/excellent/chnlSetting"
import { mapState } from 'vuex';
export default {
  name: 'WorkspaceJsonBatchChangeChannels',

  props: {
    visibleShow: {
      type: Boolean,
      default: false
    },
    ChangeList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    visible: {
      set(val) {
        this.form = {
          payin_chnl_id: null,
          payout_chnl_id: null,
        }
        this.$emit('updateVisible', val);
      },
      get() {
        return this.visibleShow;
      }
    },
    ChangeListData() {
      return this.ChangeList
    },

    ChnlOptions() {
      return [{
        id: '默认',
        chnl_name: '默认'
      }].concat(this.$store.state.Cache.channelList)
    }
  },
  data() {
    return {
      form: {
        payin_chnl_id: '默认',
        payout_chnl_id: '默认',
      },
      // ChnlOptions: [],
    };
  },
  created() {
    this.$store.dispatch('fetchOptions');
  },
  mounted() {

  },

  methods: {
    SeekChnlOptions() {
      if (this.ChnlOptions.length > 0) {
        return
      }
      listChnlSetting().then(res => {
        this.ChnlOptions = [{
          id: '默认',
          chnl_name: '默认'
        }].concat(res.rows.sort((a, b) => a.id - b.id))
      })

    },
    //提交修改
    submit() {
      if (this.form.payin_chnl_id == '默认' && this.form.payout_chnl_id == '默认') {
        this.$message({
          type: 'info',
          message: '未选择通道，已取消'
        }
        )
        this.visible = false
        return
      }

      let confirmList = this.ChangeList.map(item => {
        return {
          mch_num: item,
        }
      })
      let message = ''
      //选择了代收通道
      if (this.form.payin_chnl_id != '默认') {
        let index = this.ChnlOptions.findIndex(item => item.id == this.form.payin_chnl_id)
        confirmList = confirmList.map(item => {
          item.payin_chnl_id = this.ChnlOptions[index].id
          item.payin_chnl_name = this.ChnlOptions[index].chnl_name
          return item
        })
        message = message + '代收通道切换为 ' + this.ChnlOptions[index].chnl_name[0] + this.ChnlOptions[index].id
      }

      //选择了代付通道
      if (this.form.payout_chnl_id != '默认') {
        let index = this.ChnlOptions.findIndex(item => item.id == this.form.payout_chnl_id)
        confirmList = confirmList.map(item => {
          item.payout_chnl_id = this.ChnlOptions[index].id
          item.payout_chnl_name = this.ChnlOptions[index].chnl_name
          return item
        })
        message = message + '，代付通道切换为 ' + this.ChnlOptions[index].chnl_name[0] + this.ChnlOptions[index].id

      }
      const h = this.$createElement;
      this.$confirm(
        '确认批量将商户' + message + ' 吗？', '提示',
        {
          type: 'warning',
          confirmButtonText: '确认',
          cancelButtonText: '取消',
        }).then(() => {
          this.form = {
            payin_chnl_id: '默认',
            payout_chnl_id: '默认',
          }
          this.$emit('submit', confirmList)
          return
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          }
          )
          return
        })
    },
    //取消
    handleCancel() {
      this.visible = false
    },
    //选择通道
    selectChannel() {
      this.visible = true
    },
    //选择通道
    handleSelectChannel(value) {
      this.$emit('submit', confirmList)
    },

  },
  components: { ChannelQuery }
};
</script>

<style scoped></style>
