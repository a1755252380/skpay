<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商户号" prop="mch_num" v-if="checkRole(['admin'])">
        <MchNumSelect v-model="queryParams.mch_num" @change="handleQuery" :configName="'setting'"></MchNumSelect>
        <!-- <el-input v-model="queryParams.mch_num" placeholder="请输入商户号" clearable @keyup.enter.native="handleQuery" /> -->
      </el-form-item>
      <el-form-item label="商户名称" prop="mch_name">
        <mchNameVue v-model="queryParams.mch_name" @change="handleQuery"></mchNameVue>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :search="false"></right-toolbar>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8" ref="function">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['excellent:MchSetting:add']">新增商户</el-button>
      </el-col>
    </el-row>
    <dynamicTableVue :loading="loading" :tableData="MchSettingList" @cellDblclick="(row, column, cell, event) => {
      this.$util.copyToClipboard(cell.innerText);
    }" :cellClassName="'HoverTooltipCopy'">
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column label="商户号" align="center" prop="mch_num" />
      <el-table-column label="商户名称" align="center" prop="mch_name" />
      <el-table-column label="商户类型" align="center" prop="mch_type">
        <template slot-scope="scope">
          <span v-if="scope.row.mch_type === 0">无</span>
          <span v-else-if="scope.row.mch_type === 1">游戏</span>
          <span v-else-if="scope.row.mch_type === 2">菠菜</span>
          <span v-else-if="scope.row.mch_type === 3">电商</span>
          <span v-else-if="scope.row.mch_type === 4">金融投资</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="state" v-if="hasPermiVisible(['excellent:MchSetting:edit'])">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.state" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeState($event, scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <!-- <el-table-column label="密码" align="center" prop="password" /> -->
      <!-- v-if="hasPermiVisible('excellent:mchSetting:edit')" -->
      <el-table-column label="验证状态" align="center" prop="state" v-if="hasPermiVisible(['excellent:MchSetting:edit'])">
        <template slot-scope="scope">
          <el-switch :value="scope.row.totp_status" active-color="#409EFF" inactive-color="#DCDFE6" :active-value="0"
            :inactive-value="1" @change="ChangeVerifyStatus($event, scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="支付密钥" align="center" prop="apikey">
        <template slot-scope="scope">
          {{ $util.hideMiddle(scope.row.apikey) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
        v-if="hasPermiVisible(['excellent:MchSetting:edit'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['excellent:MchSetting:edit']">修改</el-button>
          <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['excellent:MchSetting:remove']">删除</el-button> -->
        </template>
      </el-table-column>
    </dynamicTableVue>


    <pagination ref="pagination" v-show="total > 0" :total="total" :page.sync="queryParams.page"
      :limit.sync="queryParams.limit" @pagination="getList" />
    <!-- 添加或修改商户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="60%" append-to-body :close-on-click-modal="false">
      <div v-loading="DetailLoading">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="Breakdown-el-form"
          label-position="top">
          <el-form-item label="商户号" prop="mch_num">
            <el-input v-model="form.mch_num" placeholder="请输入商户号" :disabled="mchNumChange" />
          </el-form-item>
          <el-form-item label="商户名称" prop="mch_name">
            <el-input v-model="form.mch_name" placeholder="请输入商户名称" />
          </el-form-item>
          <!-- <el-form-item label="代理人" prop="agent_name">
            <el-input v-model="form.agent_name" placeholder="请输入代理人" />
          </el-form-item> -->
          <el-form-item label="支付密钥" prop="apikey">
            <div class="FlexCenter">
              <el-input v-model="form.apikey" placeholder="请输入支付密钥" :disabled="mchNumChange" />
              <el-button type="primary" @click="generateKey" v-if="!mchNumChange"
                style="margin-left: 10px">生成密钥</el-button>
            </div>
          </el-form-item>
          <el-form-item label="登录密码" prop="password">
            <div class="FlexCenter">
              <el-input v-model="form.password" :type="mchNumChange ? 'password' : 'text'" placeholder="请输入登录密码"
                :disabled="mchNumChange" />
              <el-button type="primary" @click="generatePassword" v-if="!mchNumChange"
                style="margin-left: 10px">生成密码</el-button>
            </div>
          </el-form-item>
          <el-form-item label="代收回调地址" prop="payin_callback_url">
            <el-input v-model.trim="form.payin_callback_url" @input="handleInput($event, 'payin_callback_url')"
              placeholder="请输入代收回调地址" />
          </el-form-item>
          <el-form-item label="代付回调地址" prop="payout_callback_url">
            <el-input v-model.trim="form.payout_callback_url" @input="handleInput($event, 'payout_callback_url')"
              placeholder="请输入代付回调地址" />
          </el-form-item>
          <el-form-item label="ip白名单" prop="ip_white_list" class="ipWhiteList_add ">
            <div class="FlexCenter ipWhiteList_add_div">
              <el-input v-model="ipWhite" placeholder="请输入ip白名单" style="margin-right: 0.5rem;" />
              <el-button type="primary" @click="addIpWhiteList">添加</el-button>
            </div>

          </el-form-item>
          <el-form-item label="白名单列表" style="grid-column: span 2;">
            <div class="ipWhiteList_add_list">
              <template v-for="(item, index) in ip_white_list">
                <el-tooltip :key="index" content="单击可进行修改" :open-delay="2000" style="cursor: pointer;">
                  <el-tag size="small" closable style="margin:0 6px 3px 6px;" effect="dark"
                    @close="delIpWhiteList(index)" @click="UpDateWhiteList(index)">{{ item }}</el-tag>
                </el-tooltip>
              </template>

            </div>
          </el-form-item>
        </el-form>
        <!-- <el-row :gutter="20" class="ipWhiteList_add">
          <el-col :lg="8" :md="8" :sm="24" class="ipWhiteList_add_div">
            <label style="">ip白名单</label>

          </el-col>
          <el-col :lg="16" :md="16" :sm="24" class="ipWhiteList_add_list">


          </el-col>
        </el-row> -->

      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMchSetting, getMchSetting, delMchSetting, addMchSetting, updateMchSetting } from "@/api/excellent/MchSetting";
import dynamicTableVue from '@/components/Excellent/dynamicTable.vue';
import MchNumSelect from "@/components/Excellent/Mch/mchNumSelect.vue";
import mchNameVue from '@/components/Excellent/Mch/mchName.vue';
export default {
  name: "MchSetting",

  components: { dynamicTableVue, MchNumSelect, mchNameVue },
  data() {

    return {
      //商户号是否可修改
      mchNumChange: false,
      // 遮罩层
      loading: true,
      DetailLoading: false,
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
      // 商户表格数据
      MchSettingList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        limit: 20,
        mch_num: null,
        mch_name: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        mch_num: [
          { required: true, message: "商户号不能为空", trigger: "blur" }
          ,
          { validator: this.validate.validateNumber, message: '商户号必须为数字值', trigger: "change" }
        ],
        mch_name: [
          { required: true, message: "商户名称不能为空", trigger: "blur" }
        ],
        mch_type: [
          { required: true, message: "商户类型 0.无 1.游戏 2.菠菜 3.电商 4.金融投资不能为空", trigger: "change" }
        ],
        state: [
          { required: true, message: "状态 0.启用 1.禁用不能为空", trigger: "change" }
        ],
      },
      //客户搜索列表
      ClientSearchList: [],
      ClientSearchLoading: false,
      FirstSearched: true,
      //白名单列表
      ipWhite: '',
      ip_white_list: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    //改变验证状态
    ChangeVerifyStatus(ChangeData, data) {


      let index = this.MchSettingList.findIndex(res => {
        return res.id === data.id;
      })
      const form = JSON.parse(JSON.stringify(data))
      form.totp_status = ChangeData



      const submitForm = this.$util.DiffItems(this.MchSettingList[index], ['mch_num'], form)


      updateMchSetting(submitForm).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.$set(this.MchSettingList[index], 'totp_status', ChangeData);
      });
    },
    //白名单ip添加
    addIpWhiteList() {
      if (this.ipWhite == '') {
        this.$message.error('请输入白名单地址')
        return
      }
      let WhiteList = this.ipWhite.replace(/\s+/g, '');
      if (WhiteList.includes(',') || WhiteList.includes('，')) {
        let list = WhiteList.split(/[,，]/)
        let mess = ''
        for (let index = 0; index < list.length; index++) {
          if (this.ip_white_list.includes(list[index])) {
            mess += (list[index] + '\r\n')
            continue
          }
          this.ip_white_list.push(list[index])
        }
        if (mess != '') {
          this.$notify.warning('地址『' + mess + '』已存在')

        }
        this.ipWhite = ''
      } else {
        if (this.ip_white_list.includes(this.ipWhite)) {
          return this.$message.warning('该地址已存在')
        }
        this.ip_white_list.push(this.ipWhite)
        this.ipWhite = ''
      }

    },
    delIpWhiteList(index) {
      this.ip_white_list.splice(index, 1)
    },
    UpDateWhiteList(index) {


      this.$prompt('原白名单地址：' + this.ip_white_list[index] + '<br>请输入新的白名单地址', '修改白名单地址', {
        confirmButtonText: '确定',
        cancelButtonText: '取消', dangerouslyUseHTMLString: true,

      }).then(({ value }) => {
        if (value) {
          this.$message({
            type: 'success',
            message: '新的白名单地址是: ' + value
          });
          this.$set(this.ip_white_list, index, value);
        } else {
          this.$set(this.ip_white_list, index, this.ip_white_list[index]);
        }

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        });
      });
    },
    //生成随机密钥
    generateKey() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.form.apikey = result
    },
    //生成随机密码
    generatePassword() {
      if (!this.form.mch_num) {
        this.$message.warning('请先输入商户号');
        return
      }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.form.password = this.form.mch_num + result
    },
    /** 查询商户列表 */
    getList() {

      this.loading = true;
      listMchSetting(this.queryParams).then(response => {
        this.MchSettingList = response.rows;
        this.total = response.total;
        this.loading = false;
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
        "agent_name": null,
        "apikey": null,
        "create_by": null,
        "create_time": null,
        "del_flag": null,
        "id": null,
        "ip_white_list": null,
        "mch_name": null,
        "mch_num": null,
        "mch_type": null,
        "password": null,
        "payin_callback_url": null,
        "payout_callback_url": null,
        "state": null,
        "update_by": null,
        "update_time": null
      };
      this.ip_white_list.splice(0)
      this.ipWhite = ""
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
      this.ids = selection.map(item => item.mch_num)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.mchNumChange = false
      this.open = true;
      this.DetailLoading = false
      this.title = "添加商户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.DetailLoading = true
      this.open = true;
      this.title = "修改商户";

      this.reset();
      const id = row.mch_num || this.ids
      this.mchNumChange = true
      getMchSetting(id).then(response => {
        this.form = response.rows[0];
        // form['mch_num']=$util.hideMiddle(form['mch_num'])
        this.DetailLoading = false
        this.ip_white_list = response.rows[0].ip_white_list ? (response.rows[0].ip_white_list.includes(',') ? response.rows[0].ip_white_list.toString().split(",") : [response.rows[0].ip_white_list]) : []
      });
    },
    /** 提交按钮 */
    submitForm() {
      let whiteList = ""
      for (let index = 0; index < this.ip_white_list.length; index++) {
        if (index == this.ip_white_list.length - 1) {
          whiteList += this.ip_white_list[index]
        } else {
          whiteList += this.ip_white_list[index] + ","
        }
      }
      this.form.ip_white_list = whiteList
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form['mch_num'] = Number(this.form['mch_num'])
          if (this.form.id != null) {
            updateMchSetting(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;


              this.getList();
            });
          } else {
            addMchSetting(this.form).then(response => {
              this.$store.dispatch('updateMchList');
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
      this.$modal.confirm('是否确认删除商户编号为"' + ids + '"的数据项？').then(function () {
        return delMchSetting(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('excellent/MchSetting/export', {
        ...this.queryParams
      }, `MchSetting_${new Date().getTime()}.xlsx`)
    },
    //状态修改按钮
    ChangeState(ChangeData, data) {
      let index = this.MchSettingList.findIndex(res => {
        return res.id === data.id;
      })
      let form = data
      form.state = ChangeData
      console.log(form);

      updateMchSetting(form).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.$set(this.MchSettingList[index], 'state', ChangeData);
      });
    },

    handleInput(value, index) {
      this.form[index] = value.replace(/\s+/g, ''); // 去除所有空格
    }
  }
};
</script>
<style lang="scss" scoped>
.ipWhiteList_add {


  label {
    text-align: right;
    vertical-align: middle;
    font-size: 14px;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .ipWhiteList_add_list {
    .ipWhiteList_add_options {
      display: inline-block;
      border-radius: 8px;
      padding: 3px 3px 3px 12px;
      margin: 4px;
      background: #1890FF;
      color: #fff;
    }

    .ipWhiteList_add_options_close {
      border-radius: 50%;
      padding: 5px;
      cursor: pointer;
      color: #fff;
    }

    .ipWhiteList_add_options_update {
      border-radius: 50%;
      padding: 0px 2px;
      cursor: pointer;
      color: #fff;
      // background: #fff;
    }
  }
}
</style>
