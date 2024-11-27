<template>
  <div>
    <el-drawer :visible.sync="drawerData" :before-close="updateDialogVisible">
      <div slot="title" class="drawer_title">批量添加黑名单</div>
      <div style="" class="drawer_div">
        <div class="header_div">
          <el-input type="textarea" :rows="4" placeholder="请输入黑名单信息/直接复制粘贴Excel表数据" v-model="batchInput"
            size="small"></el-input>
          <el-button type="primary" size="small" @click="batchAddBlacklist" style="margin-top: 6px;">确定</el-button>
          <!-- <el-divider class="divider"></el-divider> -->
        </div>
        <div class="tagShow_div">
          <template v-for="(item, index) in batchList">
            <el-tag :key="item" type="info" size="small" closable @close="TagClose(index)" style="margin: 3px;">{{
              item
              }}</el-tag>

          </template>

        </div>
        <div class="footer_div">
          <!-- <el-divider class="divider"></el-divider> -->
          <div class="footer_div_text">

            <el-select class="w100_input" size="small" placeholder="请选择录入方式" v-model="BlackType">
              <el-option :label="item.label" :value="item.value" v-for="item in buttonOption"
                :key="item.value"></el-option>

            </el-select>
            <el-button type="warning" size="small" @click="ConfirmBatch" style="margin: 0 6px;"
              icon="el-icon-plus">添加</el-button>
          </div>
        </div>
      </div>

    </el-drawer>
    <ShowResult @updateDialogVisible="updateDialogVisible" :dialogVisible="ResultDialogVisible" :Result="Result">
    </ShowResult>

  </div>

</template>
<script>

import { BatchAddBlacklist, addBlacklistUser } from '@/api/excellent/Personnel'
import ShowResult from './ShowResult.vue';
export default {
  name: 'BatchAddBlack',
  components: {
    ShowResult
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      ResultDialogVisible: false,
      Result: {
        failed_orders: [],
        success_orders: []
      },
      buttonOption: [{
        label: '设备号',
        value: 0
      },
      {
        label: 'IP地址段',
        value: 1
      },
      {
        label: '银行账户acc',
        value: 2
      },
      {
        label: '商户订单号',
        value: 3
      }],//选择类型
      BlackType: null,//选择类型
      batchInput: '',
      batchList: [],
    }
  },
  model: {
    prop: 'drawer',
    event: 'update:drawer'
  },
  computed: {
    drawerData: {
      get() {
        return this.drawer
      },
      set(val) {
        this.$emit('update:drawer', val)
      }
    }
  },
  watch: {

  },
  mounted() {

  },
  methods: {
    updateDialogVisible(val) {
      this.ResultDialogVisible = false
      this.batchList.splice(0)
      this.batchInput = ''
      this.BlackType = null
      this.drawerData = false
    },
    batchAddBlacklist() {
      const input = this.batchInput.trim();
      if (!input) return;

      // 使用正则表达式匹配中英文逗号，并根据匹配结果分割字符串
      const items = input
        .split(/\r\n|\r|\n/)
        .map(item => item.trim())
        .filter(Boolean);

      // 将分割的项添加到 batchList 中
      this.batchList = this.batchList.concat(items);

      // 清空输入框
      this.batchInput = '';
    },
    TagClose(index) {
      this.batchList.splice(index, 1);
    },
    //确认提交
    ConfirmBatch() {
      if (this.batchList.length == 0) {
        return this.$message.error('请输入要添加的内容');
      }
      if (this.BlackType == null) {
        return this.$message.error('请选择录入类型');
      }
      this.$confirm('确认批量以' + this.buttonOption[this.BlackType].label + '方式添加黑名单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        let ConfirmList = []
        if (this.BlackType == 3) {
          ConfirmList = this.batchList
          BatchAddBlacklist(ConfirmList).then(res => {
            this.Result = res
            setTimeout(() => {
              this.ResultDialogVisible = true
              loading.close();

            }, 300);
          })
        } else {
          this.batchList.forEach(item => {
            if (this.BlackType === 0) {
              ConfirmList.push({
                user_bank_acct: '',
                device_number: item,
                ip: ''
              });
            }
            if (this.BlackType === 1) {
              ConfirmList.push({
                user_bank_acct: '',
                device_number: '',
                ip: item
              });
            }
            if (this.BlackType === 2) {
              ConfirmList.push({
                user_bank_acct: item,
                device_number: '',
                ip: ''
              });
            }
          });
          addBlacklistUser(ConfirmList).then(res => {
            this.Result = res
            setTimeout(() => {
              this.ResultDialogVisible = true
              loading.close();
            }, 300);
          })
        }


      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消批量添加'
        })
      })

    }
  }
};
</script>
<style lang='scss' scoped>
.drawer_title {
  font-size: 20px;
  font-weight: 500;
  color: #000;
}

::v-deep .el-drawer__header {
  margin-bottom: 12px;
}

.drawer_div {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .divider {
    margin: 6px 0;
  }

  .header_div {}

  .tagShow_div {
    flex: 1;
    overflow-y: auto;
    margin: 16px 0;
  }

  .footer_div {

    .footer_div_text {
      display: flex;
      justify-content: space-between;

    }
  }
}
</style>
