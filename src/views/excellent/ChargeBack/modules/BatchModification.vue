<template>
  <el-dialog :title="'批量状态调整'" :visible.sync="showData" width="500px" append-to-body :before-close="() => {
    showData = false;
  }
    ">
    <el-form ref="AdjustForm" :model="form" label-width="80px" label-position="top" :rules="rules"
      class="AdjustOrderStatus">
      <el-form-item prop="operation">
        <el-radio-group v-model="form.operation" class="radio-item">
          <template v-for="item in radioList">
            <el-radio :key="item.value" :label="item.value" class="radio-item-options"
              v-if="item.show == type || item.show == 'all'" border>{{ item.name }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>
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
  props: {
    "Change": {

    }, "show": {
      type: Boolean,
      default: false
    }, "type": {
      type: String,
      default: 'all'
    },

    'BatchType': {
      type: String,
      default: 'Change' //change 修改状态  Callback 回调状态
    }


  },
  computed: {
    showData: {
      set(value) {
        this.num = 0;
        (this.form = {
          operation: null,
          // changeReason: ''
        }),
          this.$refs["AdjustForm"].clearValidate();
        this.$emit("CloseBatchModification", value);
      },
      get() {
        return this.show;
      },
    },
    radioList() {

      return [
        // {
        //   name: "标记成功",
        //   value: 0,
        //   show: "now",
        // },
        {
          name: "标记失败",
          value: 1,
          show: "all",
        },
        {
          name: "同步状态",
          value: 2,
          show: "all",
        },

      ]
    }
  },

  data() {
    return {
      form: {
        operation: null,
      },
      // //调整选项
      // radioList: [
      //   {
      //     name: "标记成功",
      //     value: 0,
      //     show: "now",
      //   },
      //   {
      //     name: "标记失败",
      //     value: 1,
      //     show: "now",
      //   },
      //   {
      //     name: "同步状态",
      //     value: 2,
      //     show: "all",
      //   },
      //   {
      //     name: "回调状态",
      //     value: 3,
      //     show: "history",
      //   },
      // ],
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
      const mergedObj = { ...this.form };
      this.validateForm().then((res) => {
        this.$emit("ChangeBatchModification", mergedObj);
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
  display: grid !important;
  gap: 6px;

  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));

  .radio-item-options {
    width: 100%;
    margin-left: 0px !important;
  }
}
</style>
