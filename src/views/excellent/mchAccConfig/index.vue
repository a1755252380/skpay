<template>
  <div class="app-container" style="min-height: inherit; padding: 0 0 0" v-loading="editloading">
    <transition-group name="el-fade-in-linear" style="min-height: inherit; padding: 0 0 0">
      <div v-show="!open" class="fulltable_div" style="padding: 20px" key="show">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
          label-width="68px">
          <el-form-item label="商户号 " prop="mch_num">
            <!-- <el-input v-model="queryParams.mch_num" placeholder="请输入商户号 " clearable @keyup.enter.native="handleQuery" /> -->
            <MchNumSelect v-model="queryParams.mch_num" @change="handleQuery"></MchNumSelect>
          </el-form-item>
          <el-form-item label="货币代号" prop="currency">
            <el-input v-model="queryParams.currency" placeholder="请输入货币代号" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
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

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
              v-hasPermi="['excellent:mchAccConfig:add']">商户开户</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="mini" @click="BatchSwitchingChannels"
              v-hasPermi="['excellent:mchAccConfig:add']">批量切换通道</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="mini" @click="BatchDiversionChannels"
              v-hasPermi="['excellent:mchAccConfig:add']">批量设置分流</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['excellent:mchAccConfig:edit']">修改（启用/禁用）</el-button>
      </el-col> -->
          <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
        </el-row>

        <dynamicTableVue :loading="loading" :tableData="mchAccConfigList"
          @handleSelectionChange="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" fixed />
          <!--      <el-table-column label="商户id" align="center" prop="mchId" />-->
          <el-table-column label="商户号 " align="center" prop="mch_num" fixed />
          <el-table-column label="货币代号" align="center" prop="currency" />
          <el-table-column label="代收通道" align="center" prop="payin_chnl_id" width="100"
            :formatter="Formatter.MerchantChannelInNameFormatter" />

          <el-table-column label="代付通道" align="center" prop="payout_chnl_id" width="100"
            :formatter="Formatter.MerchantChannelOutNameFormatter" />
          <el-table-column label="结算模式" align="center" prop="settle_mode">
            <template slot-scope="scope">
              <span v-if="scope.row.settle_mode === 0">实时结算</span>
              <span v-else-if="scope.row.settle_mode === 1">延时结算</span>
              <span v-else-if="scope.row.settle_mode === 2">手动结算</span>
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
          <!-- <el-table-column label="支付方式  " align="center" prop="paymentMode" /> -->

          <el-table-column label="代收费率" align="center" prop="payin_rate" />
          <el-table-column label="代付费率" align="center" prop="payout_rate" />
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
        </dynamicTableVue>

        <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.page"
          :limit.sync="queryParams.limit" @pagination="getList" />
      </div>

      <div v-show="open" style="padding: 8px" key="edit">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" label-position="top">
          <el-card class="form_card_first" :header="'商户信息'">
            <el-form-item label="商户号 " prop="mch_num">
              <el-select v-model="form.mch_num" placeholder="请选择商户号" :disabled="mchNumChange" class="w100_input">
                <el-option v-for="dict in ClientSearchList" :key="dict.mch_num" :label="dict.mch_num"
                  :value="dict.mch_num" />
              </el-select>
            </el-form-item>
            <el-form-item label="货币代号" prop="currency">
              <el-input v-model="form.currency" placeholder="请输入货币代号" disabled />
            </el-form-item>

            <el-form-item label="结算模式" prop="settle_mode">
              <el-select v-model="form.settle_mode" placeholder="请选择结算模式" class="w100_input">
                <el-option label="实时结算" :value="0"></el-option>
                <!-- <el-option label="延时结算" :value="1"></el-option> -->
                <el-option label="手动结算" :value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-card>
          <div style="display: flex;align-items: flex-start;width: 100%;">
            <el-card class="form_card" :header="'代收设置'">
              <el-form-item label="代收通道" prop="payin_chnl_id">
                <ChannelQueryVue v-model="form.payin_chnl_id"></ChannelQueryVue>

              </el-form-item><br>


              <el-form-item label="代收费率" prop="payin_rate">
                <el-input-number v-model="form.payin_rate" placeholder="请输入代收费率" :min="0.0" :precision="4"
                  :step="0.0001" class="w100_input" />
              </el-form-item>

              <el-form-item label="代理账户代收费率" prop="agent_payin_rate">
                <el-input-number v-model="form.agent_payin_rate" placeholder="请输入代理账户代收费率" :min="0.0" :precision="4"
                  :step="0.0001" class="w100_input" />
              </el-form-item>
              <el-form-item label="单笔代收最高限额" prop="payin_max_limit">
                <el-input-number v-model="form.payin_max_limit" placeholder="请输入单笔代收最大限额" :min="0" class="w100_input" />
              </el-form-item>

              <el-form-item label="单笔代收最低限额" prop="payin_min_limit">
                <el-input-number v-model="form.payin_min_limit" placeholder="请输入单笔代收最低限额" :min="0" class="w100_input" />
              </el-form-item>
              <el-form-item label="代收分流金额" prop="payin_over_amount">
                <el-input-number v-model="form.payin_over_amount" placeholder="请输入代收分流金额" :min="0" class="w100_input"
                  :precision="0" />
              </el-form-item>
              <el-form-item label="代收分流通道" prop="payin_over_chnl_id" v-if="form.payin_over_amount > 0">
                <ChannelQueryVue v-model="form.payin_over_chnl_id"></ChannelQueryVue>

              </el-form-item>

            </el-card>
            <el-card class="form_card" :header="'代付设置'">
              <el-form-item label="代付通道" prop="payout_chnl_id">
                <ChannelQueryVue v-model="form.payout_chnl_id"></ChannelQueryVue>

              </el-form-item><br>


              <el-form-item label="代付费率" prop="payout_rate">
                <el-input-number v-model="form.payout_rate" placeholder="请输入代付费率" :min="0.0" :precision="4"
                  :step="0.0001" class="w100_input" />
              </el-form-item>

              <el-form-item label="单笔代付手续费" prop="payout_fee_single">
                <el-input-number v-model="form.payout_fee_single" placeholder="请输入单笔代付手续费" :min="0"
                  class="w100_input" />
              </el-form-item>
              <el-form-item label="单笔代付最高限额" prop="payout_max_limit">
                <el-input-number v-model="form.payout_max_limit" placeholder="请输入单笔代付最大限额" :min="0"
                  class="w100_input" />
              </el-form-item>

              <el-form-item label="单笔代付最低限额" prop="payout_min_limit">
                <el-input-number v-model="form.payout_min_limit" placeholder="请输入单笔代付最低限额" :min="0"
                  class="w100_input" />
              </el-form-item>



              <el-form-item label="代理账户代付费率" prop="agent_payout_rate">
                <el-input-number v-model="form.agent_payout_rate" placeholder="请输入代理账户代付费率" :min="0.0" :precision="4"
                  :step="0.0001" class="w100_input" />
              </el-form-item>
              <el-form-item label="代理账户单笔代付手续费" prop="agent_payout_fee">
                <el-input-number v-model="form.agent_payout_fee" placeholder="请输入代理账户单笔代付手续费" :min="0"
                  class="w100_input" />
              </el-form-item>
              <el-form-item label="代付分流金额" prop="payout_over_amount">
                <el-input-number v-model="form.payout_over_amount" placeholder="请输入代付分流金额" :min="0"
                  class="w100_input" />
              </el-form-item>
              <el-form-item label="代付分流通道" prop="payout_over_chnl_id" v-if="form.payout_over_amount > 0">
                <ChannelQueryVue v-model="form.payout_over_chnl_id"></ChannelQueryVue>

              </el-form-item>

            </el-card>

          </div>

        </el-form>
        <div class="edit_btn">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </div>


    </transition-group>
    <!-- 批量切换支付通道 -->
    <BatchChangeChannels :visibleShow="batchChangeChannelsVisible" @updateVisible="updateVisible" @submit="batchSubmit"
      :ChangeList="ChangeList">
    </BatchChangeChannels>
    <!-- 批量进行分流设置 -->
    <BatchDiversionVue :visibleShow="BatchDiversionVisible" @updateVisible="updateBatchDiversionVisible"
      @submit="batchDiversion" :ChangeList="ChangeList"></BatchDiversionVue>
    <!-- 进度条弹窗 -->
    <ProgressDialog v-model="progressVisible" ref="ProgressDialog"></ProgressDialog>
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
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import { listMchSetting } from "@/api/excellent/MchSetting";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";
import BatchChangeChannels from "./modules/BatchChangeChannels.vue";
import BatchDiversionVue from './modules/BatchDiversion.vue';
import ProgressDialog from "@/components/dialog/ProgressDialog.vue";
import ChannelQueryVue from '@/components/Excellent/Channel/ChannelQuery.vue';
import { mapState } from 'vuex';
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
    const validateNumber = function (rule, value, callback) {
      if (value === "") {
        callback(new Error("费率不能为空"));
      } else if (value == 0) {
        callback(new Error("费率不能为0"));
      } else if (!/^(?!0(\.0+)?$)\d+(\.\d+)?$/.test(value)) {
        callback(new Error("费率不能为0"));
      } else {
        callback();
      }
    };

    return {
      //商户号是否可修改
      mchNumChange: false,
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
        limit: 20,
        mch_num: null,
        currency: null,
        payout_chnl_id: null,
        payin_chnl_id: null,
      },
      // 表单参数
      form: {},
      FormBackup: {}, //表单备份
      // 表单校验
      rules: {
        mch_num: [
          { required: true, message: "商户号不能为空", trigger: "blur" },
          {
            validator: this.validate.validateNumber,
            message: "商户号必须为数字值",
            trigger: "change",
          },
        ],
        state: [
          {
            required: true,
            message: "状态 0.启用 1.禁用不能为空",
            trigger: "change",
          },
        ],
        payin_chnl_id: [
          { required: true, message: "请选择代收通道", trigger: "change" },
        ],
        payout_chnl_id: [
          { required: true, message: "请选择代付通道", trigger: "change" },
        ],
        settle_mode: [
          { required: true, message: "请选择结算模式", trigger: "change" },
        ],
        payout_rate: [
          { required: true, message: "请输入正确的代付费率", trigger: "change" },
          { validator: validateNumber, message: '请输入正确的代付费率', trigger: "change" }
        ],
        payin_rate: [
          { required: true, message: "请输入正确的代收费率", trigger: "change" },
          { validator: validateNumber, message: '请输入正确的代收费率', trigger: "change" }
        ],
        payout_fee_single: [
          { required: true, message: "请输入正确的单笔代付手续费", trigger: "change" },
          { validator: validateNumber, message: '请输入正确的单笔代付手续费', trigger: "change" }
        ],
        payin_over_amount: [
          { required: true, message: "请输入代收分流金额", trigger: "change" },
        ],
        payout_over_amount: [
          { required: true, message: "请输入代付分流金额", trigger: "change" },
        ],
        payout_over_chnl_id: [
          {
            validator: (rule, value, callback) => {
              console.log(this.form.payout_over_amount);
              console.log(value);

              if (this.form.payout_over_amount == 0) {
                callback();
              } else {
                if (value == null) {
                  callback(new Error('请选择代付分流通道'));
                }
                callback();
              }
            }, message: '请选择代付分流通道', trigger: "change"
          }
        ],
        payin_over_chnl_id: [
          {
            validator: (rule, value, callback) => {
              if (this.form.payin_over_amount == 0) {
                callback();
              } else {
                if (value == null) {
                  callback(new Error('请选择代收分流通道'));
                }
                callback();
              }
            }, message: '请选择代收分流通道', trigger: "change"
          }
        ]
      },
      //通道列表
      // PassageList: [],
      //客户搜索列表
      ClientSearchList: [],
      ClientSearchLoading: false,
      FirstSearched: true,
      //修改遮盖层
      editloading: false,

      //批量切换通道
      batchChangeChannelsVisible: false,
      //批量设置分流
      BatchDiversionVisible: false,
      //进度条弹窗
      progressVisible: false,
    };
  },
  created() {
    this.loading = true;

    Promise.all([this.SeekTunelApi(), this.SeekNumApi(), this.getList()]).then((res) => {
      this.loading = false;
    });
  },
  methods: {
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

    updateVisible() {
      this.batchChangeChannelsVisible = false;
    },
    updateBatchDiversionVisible() {
      this.BatchDiversionVisible = false;
    },

    //批量提交修改通道
    batchSubmit(confirmList) {
      this.progressVisible = true;
      this.batchChangeChannelsVisible = false;
      this.$refs.ProgressDialog.batchRequest(confirmList, updateMchAccConfig).then((res) => {
        this.$message({
          message: '批量切换成功',
          type: 'success',
        });
        this.ids.splice(0, this.ids.length);
        this.getList();
      })

    },
    //批量设置分流数据
    batchDiversion(confirmList) {
      this.progressVisible = true;
      this.BatchDiversionVisible = false;
      this.$refs.ProgressDialog.batchRequest(confirmList, updateMchAccConfig).then((res) => {
        this.$message({
          message: '批量设置分流成功',
          type: 'success',
        });

        this.ids.splice(0, this.ids.length);
        this.getList();

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
          resolve(response.code);
        });
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        mch_id: null,
        mch_num: null,
        currency: "INR",
        payout_chnl_id: null,
        payin_chnl_id: null,
        settle_mode: null,
        state: null,
        paymentMode: null,
        payout_rate: null,
        payin_rate: null,
        payout_fee_single: null,
        payinFeeSingle: null,
        agent_payin_rate: null,
        agent_payout_rate: null,
        agent_payout_fee: null,
        payin_min_limit: null,
        payout_min_limit: null,
        payin_max_limit: null,
        payout_max_limit: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        update_by: null,
        update_time: null,
        payin_over_amount: 0, payout_over_amount: 0, payin_over_chnl_id: null, payin_over_chnl_name: null, payout_over_chnl_id: null, payout_over_chnl_name: null
      };
      this.resetForm("form");
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加商户账户配置";
      this.mchNumChange = false;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.mchNumChange = true;
      this.editloading = true;
      this.reset();
      const id = row.mch_num || this.ids;
      getMchAccConfig(id).then((response) => {
        this.editloading = false;
        this.FormBackup = { ...response.rows[0] };
        this.form = response.rows[0];
        this.open = true;
        this.title = "修改商户账户配置";
      });
    },
    /** 提交按钮 */
    submitForm() {

      this.$refs["form"].validate((valid) => {
        // payoutProductName代付通道名称
        // payinProductName代收通道名称
        let payoutProductIndex = this.PassageList.findIndex((res) => {
          return res.id === this.form.payout_chnl_id;
        });
        let payinProductIndex = this.PassageList.findIndex((res) => {
          return res.id === this.form.payin_chnl_id;
        });
        this.form["payout_chnl_name"] =
          this.PassageList[payoutProductIndex].chnl_name;
        this.form["payin_chnl_name"] =
          this.PassageList[payinProductIndex].chnl_name;
        let UserIndex = this.ClientSearchList.findIndex((res) => {
          return res.mch_num === this.form.mch_num;
        });
        //分流代收通道名称
        if (this.form['payin_over_amount'] != 0 && this.form['payin_over_chnl_id']) {
          let payInOverIndex = this.PassageList.findIndex((res) => {
            return res.id === this.form.payin_over_chnl_id;
          });
          this.form['payin_over_chnl_name'] = this.PassageList[payInOverIndex].chnl_name
        }
        //分流代付通道数据
        if (this.form['payout_over_amount'] != 0 && this.form['payout_over_chnl_id']) {
          let payOutOverIndex = this.PassageList.findIndex((res) => {
            return res.id === this.form.payout_over_chnl_id;
          });
          this.form['payout_over_chnl_name'] = this.PassageList[payOutOverIndex].chnl_name
        }
        //提交内容
        let form = this.form;
        if (valid) {

          if (this.form.id != null) {
            let submitForm = {}
            submitForm["mch_num"] = form.mch_num;
            for (const key in this.FormBackup) {
              if (form[key] != this.FormBackup[key]) {
                console.log(form[key] + " " + this.FormBackup[key]);

                submitForm[key] = form[key]
              }
            }
            console.log(submitForm);
            updateMchAccConfig(submitForm).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            form["mch_id"] = this.ClientSearchList[UserIndex]["id"];
            form["mch_num"] = this.ClientSearchList[UserIndex]["mch_num"];
            console.log(form);

            addMchAccConfig(form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除商户账户配置编号为"' + ids + '"的数据项？')
        .then(function () {
          return delMchAccConfig(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "excellent/mchAccConfig/export",
        {
          ...this.queryParams,
        },
        `mchAccConfig_${new Date().getTime()}.xlsx`
      );
    },
    //代付代收通道下拉框数据监听
    payoutProductChange(value) {
      console.log(value);
    },
    SeekNumApi() {
      return new Promise((resolve) => {
        listMchSetting({
          page: null,
          limit: null,
          mch_num: null,
          currency: null,
          payout_chnl_id: null,
        }).then((res) => {
          this.ClientSearchList = res.rows;
        })
      })
    },
    //获取通道信息
    SeekTunelApi() {
      this.$store.dispatch('fetchOptions');
      // this.loading = true;
      // return new Promise((resolve) => {
      //   listChnlSetting({
      //     page: null,
      //     limit: null,
      //     mch_num: null,
      //     currency: null,
      //     payout_chnl_id: null,
      //     payin_chnl_id: null,
      //   }).then((response) => {
      //     this.PassageList = response.rows.sort((a, b) => a.id - b.id);

      //     resolve(response);
      //   });
      // });
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
      updateMchAccConfig(form).then((response) => {
        this.$modal.msgSuccess("修改成功");
        this.$set(this.mchAccConfigList[index], key, ChangeData);
      });
    },

  },

  components: { dynamicTableVue, MchNumSelect, BatchChangeChannels, BatchDiversionVue, ProgressDialog, ChannelQueryVue },
};
</script>

<style lang="scss" scoped>
.el-select input {
  width: 100% !important;
}

.form_card {
  box-shadow: none !important;
  border-radius: 8px;
  margin: 1rem;
  flex: 1;

  ::v-deep .el-card__body {
    display: grid;
    gap: 0px 16px;
    grid-template-columns: repeat(auto-fit, minmax(47%, 1fr));
  }
}

.form_card_first {
  box-shadow: none !important;
  border-radius: 8px;
  margin: 1rem;
  flex: 1;

  ::v-deep .el-card__body {
    display: grid;
    gap: 0px 16px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

::v-deep .el-dialog {
  border-radius: 16px;
}

::v-deep .el-dialog__body {
  padding: 30px 60px;
}

.edit_btn {
  position: sticky;
  bottom: 0;
  padding: 20px;
  text-align: right;
}
</style>
