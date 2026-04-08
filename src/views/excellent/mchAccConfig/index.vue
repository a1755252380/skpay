<template>
  <div class="app-container" style="min-height: inherit; padding: 0 0 0;position: relative;">
    <transition-group name="el-fade-in-linear" style="min-height: inherit; padding: 0 0 0" tag="div">
      <div v-show="!open" class="fulltable_div" style="padding: 20px" key="show">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" size="mini" label-width="68px">
          <el-form-item label="商户号 " prop="mch_num">
            <!-- <el-input v-model="queryParams.mch_num" placeholder="请输入商户号 " clearable @keyup.enter.native="handleQuery" /> -->
            <MchNumSelect v-model="queryParams.mch_num" @change="handleQuery"></MchNumSelect>
          </el-form-item>
          <!-- <el-form-item label="货币代号" prop="currency">
            <el-input v-model="queryParams.currency" placeholder="请输入货币代号" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item> -->
          <el-form-item label="代收通道" prop="payin_chnl_id">
            <ChannelQueryVue v-model="queryParams.payin_chnl_id"></ChannelQueryVue>


          </el-form-item>
          <el-form-item label="代付通道" prop="payout_chnl_id">
            <ChannelQueryVue v-model="queryParams.payout_chnl_id"></ChannelQueryVue>


          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"></right-toolbar>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8" v-hasPermi="['excellent:mchAccConfig:add']">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">商户开户</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="mini"
              @click="BatchSwitchingChannels">批量切换通道</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="mini"
              @click="BatchDiversionChannels">批量设置分流</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="mini"
              @click="BatchSpeedLimitShow">批量设置并发</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-setting" size="mini"
              @click="BatchDistributionChannelsShow">批量设置分配</el-button>
          </el-col>
          <el-col :span="1.5">
            <ShowChannelPoolVue></ShowChannelPoolVue>


          </el-col>
          <el-col :span="1.5" class="FlexCenter">
            <el-input v-model="selectMchList" size="mini" placeholder="请输入商户,相隔" style="width: 8.5rem;" clearable />
            <el-button type="primary" icon="el-icon-finished" size="mini" style="margin-left: 5px;"
              @click="SelectMch"></el-button>
          </el-col>
          <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['excellent:mchAccConfig:edit']">修改（启用/禁用）</el-button>
      </el-col> -->
          <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
        </el-row>

        <el-table v-AutoHeight="{
          Ref: 'myTable', Height: 35
        }" v-table-move="['myTable']" :data="mchAccConfigList" @selection-change="handleSelectionChange"
          v-loading="loading" ref="myTable" border :height="200" row-key="mch_num">
          <el-table-column type="selection" width="55" align="center" fixed />
          <el-table-column label="商户号 " align="center" prop="mch_num" fixed />
          <el-table-column label="货币代号" align="center" prop="currency" />
          <el-table-column label="代收通道" align="center" prop="payin_chnl_id" width="100"
            :formatter="Formatter.MerchantChannelInNameFormatter" />

          <el-table-column label="代付通道" align="center" prop="payout_chnl_id" width="100"
            :formatter="Formatter.MerchantChannelOutNameFormatter" />
          <el-table-column label="结算模式" align="center" prop="settle_mode" width="180">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.settle_mode === 0" type="primary">账户可用余额实时结算</el-tag>
              <el-tag v-else-if="scope.row.settle_mode === 1" type="primary">代付可用余额实时结算</el-tag>
              <el-tag v-else-if="scope.row.settle_mode === 2" type="info">手动结算</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="账户状态" align="center" prop="state">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.state" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
                :inactive-value="1" @change="ChangeState($event, scope.row, 0)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="代收开关" align="center" prop="payin_state">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.payin_state" active-color="#409EFF" inactive-color="#DCDFE6"
                :active-value="0" :inactive-value="1" @change="ChangeState($event, scope.row, 1)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="代付开关" align="center" prop="payout_rate">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.payout_state" active-color="#409EFF" inactive-color="#DCDFE6"
                :active-value="0" :inactive-value="1" @change="ChangeState($event, scope.row, 2)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="代收分配1" align="center" prop="payin_first_distribution" width="100">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.payin_first_distribution" inactive-color="#DCDFE6" :active-value="0"
                :inactive-value="1" @change="ChangeState($event, scope.row, 3)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="代收分配2" align="center" prop="payin_second_distribution" width="100">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.payin_second_distribution" inactive-color="#DCDFE6" :active-value="0"
                :inactive-value="1" @change="ChangeState($event, scope.row, 5)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="代付分配" align="center" prop="payout_distribution">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.payout_distribution" active-color="#409EFF" inactive-color="#DCDFE6"
                :active-value="0" :inactive-value="1" @change="ChangeState($event, scope.row, 4)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="代收费率" align="center" prop="payin_rate" width="320">
            <template slot-scope="scope">
              <div style="">
                <span v-for="(item, index) in JSON.parse(scope.row.payin_rate_interval)" :key="index"
                  class="table_expand_rate_item">
                  <span class="table_expand_rate_label"> {{ index }}：</span><span class="table_expand_rate_value">{{
                    item }}</span>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="代付费率" align="center" prop="payout_rate" width="320">
            <template slot-scope="scope">
              <div style="">
                <span v-for="(item, index) in JSON.parse(scope.row.payout_rate_interval)" :key="index"
                  class="table_expand_rate_item">
                  <span class="table_expand_rate_label"> {{ index }}：</span><span class="table_expand_rate_value">{{
                    item }}</span>
                </span>
              </div>
            </template>

          </el-table-column>
          <el-table-column label="代收并发限制" align="center" prop="payin_speed_limit" width="120">
            <template slot-scope="scope">
              {{ (scope.row.payin_speed_limit) || '无限制' }}
            </template>
          </el-table-column>
          <el-table-column label="代付并发限制" align="center" prop="payout_speed_limit" width="120">
            <template slot-scope="scope">
              {{ (scope.row.payout_speed_limit) || '无限制' }}
            </template>
          </el-table-column>
          <el-table-column label="代收分流金额" align="center" prop="payin_over_amount" width="120"
            :formatter="Formatter.TableAmount2" />
          <el-table-column label="代收分流通道" align="center" prop="payin_over_chnl_id" width="120"
            :formatter="Formatter.MerchantChannelOverInNameFormatter" />
          <el-table-column label="代付分流金额" align="center" prop="payout_over_amount" width="120"
            :formatter="Formatter.TableAmount2" />
          <el-table-column label="代付分流通道" align="center" prop="payout_over_chnl_id" width="120"
            :formatter="Formatter.MerchantChannelOverOutNameFormatter" />

          <el-table-column label="单笔代收最高限额" align="center" prop="payin_max_limit" width="140"
            :formatter="Formatter.TableAmount2" />
          <el-table-column label="单笔代收最低限额" align="center" prop="payin_min_limit" width="140"
            :formatter="Formatter.TableAmount2" />
          <el-table-column label="单笔代付最高限额" align="center" prop="payout_max_limit" width="140"
            :formatter="Formatter.TableAmount2" />
          <el-table-column label="单笔代付最低限额" align="center" prop="payout_min_limit" width="140"
            :formatter="Formatter.TableAmount2" />

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
            v-if="hasPermiVisible(['excellent:mchAccConfig:edit'])">
            <template slot-scope="scope">

              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['excellent:mchAccConfig:edit']">修改</el-button>

              <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
  v-hasPermi="['excellent:mchAccConfig:remove']">删除</el-button> -->
            </template>
          </el-table-column>

        </el-table>


        <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.page"
          :limit.sync="queryParams.limit" @pagination="getList" />
      </div>

      <EditInfo v-show="open" key="edit" ref="editInfo" @cancel="cancel" @submit="submit"></EditInfo>


    </transition-group>
    <!-- 批量切换支付通道 -->
    <BatchChangeChannels :visibleShow="batchChangeChannelsVisible" @updateVisible="updateVisible" @submit="batchSubmit"
      :ChangeList="ChangeList">
    </BatchChangeChannels>
    <!-- 批量进行分流设置 -->
    <BatchDiversionVue :visibleShow="BatchDiversionVisible" @updateVisible="updateBatchDiversionVisible"
      @submit="batchDiversion" :ChangeList="ChangeList"></BatchDiversionVue>
    <!-- 批量设置并发限制 -->
    <BatchSpeedLimit v-model="BatchSpeedLimitVisible" @submit="batchSpeedLimit" :ChangeList="ChangeList">
    </BatchSpeedLimit>
    <!-- 选择代收还是代付 -->
    <el-dialog title="选择代收还是代付" :visible.sync="dialogAllocateVisible" width="500px" center>
      <div class="FlexCenter">
        <el-radio-group v-model="dialogAllocateType" class="DistributionSwitch">
          <el-radio label="payout" border>打开代付分配</el-radio>
          <el-radio label="payoutclose" border>关闭代付分配</el-radio>
          <el-radio label="payin" border>打开代收分配1</el-radio>
          <el-radio label="payinclose" border>关闭代收分配1</el-radio>
          <el-radio label="payin2" border>打开代收分配2</el-radio>
          <el-radio label="payin2close" border>关闭代收分配2</el-radio>
        </el-radio-group>
      </div>
      <div class="FlexCenter" style="margin-top: 12px;">
        <el-button type="primary" @click="BatchDistributionChannels()">确定</el-button>

        <el-button type="primary" plain @click="dialogAllocateVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMchAccConfig,
  getMchAccConfig,
  delMchAccConfig,
  addMchAccConfig,
  updateMchAccConfig,
} from "@/api/excellent/mchAccConfig";

import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";
import BatchChangeChannels from "./modules/BatchChangeChannels.vue";
import BatchDiversionVue from './modules/BatchDiversion.vue';
import ProgressDialog from "@/components/dialog/ProgressDialog.vue";
import ChannelQueryVue from '@/components/Excellent/Channel/ChannelQuery.vue';
import { mapState } from 'vuex';
import EditInfo from "./modules/EditInfo.vue";
import BatchSpeedLimit from "./modules/BatchSpeedLimit.vue";
import ShowChannelPoolVue from '@/components/dialog/showChannelPool.vue';
import { mockRequest, PollingRequest, MultiPollingRequest } from "@/utils/ProgressRequest";
export default {
  name: "MchAccConfig",
  computed: {
    ChangeList() {
      return this.ids.map((item) => item.mch_num)
    },
    ...mapState({
      PassageList: state => state.Cache.channelList,
    }),

  },
  data() {


    return {
      // 选择代收还是代付弹窗
      dialogAllocateVisible: false,
      dialogAllocateType: 'payin',

      selectMchList: '',
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 1,
      // 商户账户配置表格数据
      mchAccConfigList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        limit: 50,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
        payin_chnl_id: null,
      },

      //通道列表
      // PassageList: [],
      //客户搜索列表
      ClientSearchList: [],
      ClientSearchLoading: false,
      FirstSearched: true,

      //批量切换通道
      batchChangeChannelsVisible: false,
      //批量设置分流
      BatchDiversionVisible: false,
      //批量设置并发限制
      BatchSpeedLimitVisible: false
    };
  },
  created() {
    this.loading = true;
    this.getList()

  },
  methods: {
    //批量选中商户
    SelectMch() {
      const MchList = this.selectMchList.split(/[,，]/)
      if (MchList.length == 0) {
        this.$message.error("请输入商户号");
        return
      }
      this.$refs.myTable.clearSelection()
      let errorMchList = []
      MchList.forEach(item => {
        const mchIndex = this.mchAccConfigList.find(item2 => item2.mch_num == item)
        if (mchIndex) {
          this.$refs.myTable.toggleRowSelection(mchIndex, true)

        } else {
          errorMchList.push(item)
        }
      })
      if (errorMchList.length > 0) {
        this.$notify({
          title: '错误',
          message: `以下商户号不存在：${errorMchList.join(',')}`,
          duration: 1000,
          type: 'error',
        });
        this.$util.copyToClipboard(errorMchList.join(','));
        return
      }

    },
    //批量切换支付通道
    BatchSwitchingChannels() {
      if (this.ids.length == 0) {
        this.$message.error("请选择要切换的商户");
        return
      }
      this.batchChangeChannelsVisible = true;
    },
    BatchDiversionChannels() {
      if (this.ids.length == 0) {
        this.$message.error("请选择要设置的商户");
        return
      }
      this.BatchDiversionVisible = true;
    },
    BatchSpeedLimitShow() {
      if (this.ids.length == 0) {
        this.$message.error("请选择要设置的商户");
        return
      }
      this.BatchSpeedLimitVisible = true;
    },

    updateVisible() {
      this.batchChangeChannelsVisible = false;
    },
    updateBatchDiversionVisible() {
      this.BatchDiversionVisible = false;
    },

    //批量提交修改通道
    batchSubmit(confirmList) {
      this.batchChangeChannelsVisible = false;
      PollingRequest(updateMchAccConfig, confirmList).then((res) => {
        this.$message({
          message: '批量切换成功',
          type: 'success',
        });
        this.ids.splice(0, this.ids.length);
        this.getList();
      }).finally(() => {
        this.$store.dispatch("fetchMchConfigList", {
          isUpdate: true
        });
      });

    },
    //批量设置分流数据
    batchDiversion(confirmList) {
      this.BatchDiversionVisible = false;
      PollingRequest(updateMchAccConfig, confirmList).then((res) => {
        this.$message({
          message: '批量设置分流成功',
          type: 'success',
        });

        this.ids.splice(0, this.ids.length);
        this.getList();

      }).finally(() => {
        this.$store.dispatch("fetchMchConfigList", {
          isUpdate: true
        });
      });
    },
    //批量设置并发限制
    batchSpeedLimit(confirmList) {
      this.BatchSpeedLimitVisible = false;
      PollingRequest(updateMchAccConfig, confirmList).then(res => {
        this.BatchSpeedLimitVisible = false;

        this.$message({
          message: '批量设置并发限制成功',
          type: 'success',
        });
        this.ids.splice(0, this.ids.length);
        this.getList();

      })

    },

    //批量设置分配通道
    BatchDistributionChannelsShow() {
      if (this.ids.length == 0) {
        this.$message.error("请选择要设置的商户");
        return
      }
      this.dialogAllocateVisible = true;
    },
    BatchDistributionChannels() {

      if (this.ids.length == 0) {
        this.$message.error("请选择要设置的商户");
        return
      }

      let allocationPoolType
      let label

      if (this.dialogAllocateType == 'payin' || this.dialogAllocateType == 'payinclose') {
        allocationPoolType = 'payin_first_distribution'
      } else if (this.dialogAllocateType == 'payin2' || this.dialogAllocateType == 'payin2close') {
        allocationPoolType = 'payin_second_distribution'
      } else if (this.dialogAllocateType == 'payout' || this.dialogAllocateType == 'payoutclose') {
        allocationPoolType = 'payout_distribution'
      } else {
        this.$message.error("请选择要设置的分配类型");
        return
      }

      if (this.dialogAllocateType == 'payin' || this.dialogAllocateType == 'payinclose') {
        label = '代收分配池1'
      } else if (this.dialogAllocateType == 'payin2' || this.dialogAllocateType == 'payin2close') {
        label = '代收分配池2'
      } else if (this.dialogAllocateType == 'payout' || this.dialogAllocateType == 'payoutclose') {
        label = '代付分配池'
      } else {
        this.$message.error("请选择要设置的分配类型");
        return
      }
      const close = this.dialogAllocateType == 'payinclose' || this.dialogAllocateType == 'payoutclose' || this.dialogAllocateType == 'payin2close'
      this.$confirm(`确认批量设置商户${close ? '关闭' : '使用'}${label}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const confirmList = this.ids.map(item => {
          const confirm = {
            mch_num: item.mch_num,
          }
          if (close) {
            confirm[allocationPoolType] = 1;
          } else {
            if (this.dialogAllocateType == 'payin' && item['payin_second_distribution'] == 0) {
              confirm['payin_second_distribution'] = 1
            }
            if (this.dialogAllocateType == 'payin2' && item['payin_first_distribution'] == 0) {
              confirm['payin_first_distribution'] = 1
            }
            confirm[allocationPoolType] = 0;
          }
          return confirm
        })
        PollingRequest(updateMchAccConfig, confirmList).then((res) => {
          this.$message({
            message: `批量设置${label}成功`,
            type: 'success',
          });
          this.ids.splice(0, this.ids.length);
          this.getList();
          this.dialogAllocateVisible = false;
        })
      })
    },
    /** 查询商户账户配置列表 */
    getList() {
      this.loading = true;
      return new Promise((resolve) => {
        listMchAccConfig(this.queryParams).then((response) => {
          this.loading = false;
          this.mchAccConfigList = response.rows;
          this.total = response.total;

          this.$nextTick(() => {
            if (response.total != this.$store.state.Cache.MchConfigList.length && this.$store.state.Cache.MchConfigList.length > 0) {
              this.$store.dispatch('fetchMchConfigList', {
                isUpdate: this.$store.state.Cache.MchConfigList.length > 0 ? true : false,
              });
            }
          });
          resolve(response.code);
        });
      });
    },
    handleAdd() {
      this.open = true;
      this.$refs.editInfo.handleUpdate('');
    },
    handleUpdate(row) {
      this.open = true;
      this.$refs.editInfo.handleUpdate(row.mch_num);
    },
    cancel() {
      this.open = false;

      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    submit() {
      this.open = false;

      this.getList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection;
      //   this.ids.map((item) => item.id)
    },


    //代付代收通道下拉框数据监听
    payoutProductChange(value) {
      // console.log(value);
    },


    //状态修改按钮
    ChangeState(ChangeData, data, type) {
      let index = this.mchAccConfigList.findIndex((res) => {
        return res.id === data.id;
      });
      // type 1为代付状态的修改 0为状态的修改 2为代收状态的修改

      let form = {
        "mch_num": data.mch_num,
      }
      let key = "state";
      if (type == 0) {
        form['state'] = ChangeData;
        key = "state";
      } else if (type == 1) {
        form['payin_state'] = ChangeData;
        key = "payin_state";
      } else if (type == 2) {
        form['payout_state'] = ChangeData;
        key = "payout_state";
      }
      else if (type == 3) {

        form['payin_first_distribution'] = ChangeData;
        key = "payin_first_distribution";

        form['payin_second_distribution'] = ChangeData ? 0 : 1
      }
      else if (type == 4) {
        form['payout_distribution'] = ChangeData;
        key = "payout_distribution";
      }
      else if (type == 5) {
        form['payin_second_distribution'] = ChangeData;
        key = "payin_second_distribution";
        form['payin_first_distribution'] = ChangeData ? 0 : 1;
      }
      updateMchAccConfig(form).then((response) => {
        for (const key in form) {
          this.$set(this.mchAccConfigList[index], key, form[key]);
        }
        this
          .$nextTick(() => {
            this.$modal.msgSuccess("修改成功");
          })

      });
    },

  },

  components: { dynamicTableVue, MchNumSelect, BatchChangeChannels, BatchDiversionVue, ProgressDialog, ChannelQueryVue, EditInfo, BatchSpeedLimit, ShowChannelPoolVue },
};
</script>

<style lang="scss" scoped>
.DistributionSwitch {
  padding: 0 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 3px;
  text-align: center;
}

.table_expand_rate {
  display: flex;
  align-items: flex-start;
  margin: 6px auto;

  .table_expand_rate_option {
    margin: 0 8px;
  }

  .table_expand_rate_title {
    padding: 6px;
    font-weight: 600;
  }


}

.table_expand_rate_item {
  margin: 6px 0;
  display: inline-block;
  width: 145px;
  font-weight: 600;

  .table_expand_rate_label {
    display: inline-block;
    width: 100px;
    color: #99a9bf;
  }

  .table_expand_rate_value {}
}
</style>
