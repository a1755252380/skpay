<template>
  <el-dialog :title="'状态调整'" :visible.sync="showData" width="500px" append-to-body :before-close="() => {
    showData = false;
  }
    ">
    <el-form ref="AdjustForm" :model="form" label-width="80px" label-position="top" :rules="rules"
      class="AdjustOrderStatus">
      <el-form-item label="商户订单号">
        <el-input v-model="form._id" placeholder="请输入登录名称" disabled />
      </el-form-item>
      <el-form-item label="状态调整" prop="operation">
        <el-radio-group v-model="form.operation" class="radio-item">
          <template v-for="item in radioList">
            <el-radio :key="item.value" :label="item.value" class="radio-item-options" border v-if="
              item.NoState == 'all' ||
              item.show == 'all' ||
              (item.NoState != ChangeData.status && item.show == type)
            ">{{ item.name }}</el-radio></template>
        </el-radio-group>
      </el-form-item>

      <!-- <el-form-item label="备注">
        <el-input v-model="form.changeReason" type="textarea" placeholder="请备注调整原因" rows="3" />
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="showData = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "AdjustOrderStatus",
  props: ["Change", "show", "type"],
  computed: {
    showData: {
      set(value) {
        this.num = 0;
        (this.form = {
          _id: "",
          operation: null,
          // changeReason: ''
        }),
          this.$refs["AdjustForm"].clearValidate();
        this.$emit("CloseAdjustOrderStatus", value);
      },
      get() {
        return this.show;
      },
    },
    ChangeData: {
      get() {
        return this.Change;
      },
    },
  },
  watch: {
    Change: {
      deep: true,
      handler(newval, oldval) {
        console.log(newval.status);

        for (const key in this.form) {
          this.form[key] = newval[key] ? newval[key] : this.form[key];
        }
      },
    },
  },
  data() {
    return {
      form: {
        _id: "",
        operation: null,
      },
      //调整选项
      radioList: [
        {
          name: "标记成功",
          value: 0,
          NoState: "all",
          show: "all",
        },
        {
          name: "标记失败",
          value: 1,
          NoState: 0,
          show: "all",
        },
        {
          name: "同步状态",
          value: 2,
          NoState: 0,
          show: "all",
        },

        // {
        //   name: "回调状态",
        //   value: 3,
        //   NoState: 2,
        //   show: "history",
        // },
      ],
      rules: {
        operation: [
          { required: true, message: "请选择修改状态", trigger: "blur" },
        ],
      },
    };
  },

  mounted() { },

  methods: {
    //校验表单
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs["AdjustForm"].validate((valid) => {
          console.log(valid);

          if (valid) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    },

    submitForm() {
      const mergedObj = { ...this.Change, ...this.form };
      this.validateForm().then((res) => {
        this.showData = false;
        this.$emit("ChangeOrderStatusRow", mergedObj);
      });
    },
  },
};
</script>
<style lang="scss">
.AdjustOrderStatus .el-form-item {
  margin-bottom: 8px !important;
}

.radio-item {
  display: grid;
  gap: 6px;

  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));

  .radio-item-options {
    width: 100%;
    margin-left: 0px !important;
  }
}
</style>
