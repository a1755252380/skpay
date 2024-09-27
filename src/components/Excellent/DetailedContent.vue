<template>
  <el-dialog :title="'详细信息'" :visible.sync="showData" :width="width" :before-close="() => {
    showData = false;
  }
    ">
    <div>
      <slot name="head"></slot>
      <template v-for="item in detailList">

        <el-descriptions :key="item.title" class="descriptions"
          v-if="hasPermiVisible(item.Jurisdiction) || item.Jurisdiction == ''" :title="item.title" :column="column"
          :labelStyle="{
            width: labelWidth + 'px'
          }" :contentStyle="{
            width: contextWidth + 'px'
          }" border>

          <template v-for=" item2 in item.content">
            <el-descriptions-item :key="item2.key" v-if="
              item2.Jurisdiction == '' ||
              hasPermiVisible(item2.Jurisdiction)
            ">
              <template v-if="item2.type">
                <!-- 标签输出 -->
                <template v-if="item2.type == 'tag'">
                  <template slot="label">
                    <!-- <i class="el-icon-user"></i> -->
                    {{ item2.label }}
                  </template>
                  <el-tag :type="formatStatus(item2.key, detailData[item2.key]).type">{{
                    formatStatus(item2.key, detailData[item2.key]).name
                  }}</el-tag>


                </template>

                <!-- 金额格式化输出 -->
                <template v-if="item2.type == 'formatNum'">
                  <template slot="label">
                    <!-- <i class="el-icon-user"></i> -->
                    {{ item2.label }}
                  </template>

                  {{ detailData[item2.key] | formatValue }}

                </template>
                <!-- 时间格式化输出 -->
                <template v-if="item2.type == 'formatTime'">
                  <template slot="label">
                    <!-- <i class="el-icon-user"></i> -->
                    {{ item2.label }}
                  </template>

                  {{ detailData[item2.key] | formatTime }}

                </template>
              </template>
              <template v-else>
                <template slot="label">
                  <!-- <i class="el-icon-user"></i> -->
                  {{ item2.label }}
                </template>
                {{ detailData[item2.key] }}
              </template>

            </el-descriptions-item>


          </template>

        </el-descriptions>

      </template>


    </div>
  </el-dialog>
</template>

<script>
import moment from "moment-timezone";
export default {
  name: "WorkspaceJsonDetailedContent",
  props: {
    "show": {
      type: Boolean,
      default: false,
    }, "detail": {
      type: Object,
      default: {},
    }, "detailkey": {
      type: Array,
      default: [],
    },
    "labelWidth": {
      type: Number,
      default: 130,
    },
    "column": {
      type: Number,
      default: 2,
    },
    width: {
      type: String,
      default: "800px",
    }
  },
  computed: {
    showData: {
      get() {
        return this.show;
      },
      set(val) {
        this.$emit("updateShow", val);
      },
    },
    detailData: {
      get() {
        return this.detail;
      },
      set(val) { },
    },
    detailList: {
      get() {
        return this.detailkey;
      }
    },
    contextWidth: {
      get() {
        return 400 - this.labelWidth;
      }
    }
  },
  filters: {
    formatValue(value) {
      return value ? (value / 100).toFixed(2) : 0.00;
    },
    //格式化时间
    formatTime(milliseconds) {
      // 将毫秒值转换为Date对象
      const date = new Date(milliseconds * 1000);

      // 使用 moment 进行格式化，指定时区为 IST
      return moment(date).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    },
  },
  data() {
    return {

    };
  },

  mounted() { },

  methods: {
    //状态调整
    formatStatus(key, value) {

      if (key == 'status') {
        // 0-成功，1-失败，2-超时，5-已处理，6-已提交

        if (value == 0) {
          return { name: "成功", type: "success" };
        } else if (value == 1) {
          return { name: "失败", type: "danger" };;
        } else if (value == 2) {
          return { name: "超时", type: "warning" };;
        } else if (value == 5) {
          return { name: "已处理", type: "success" };
        } else if (value == 6) {
          return { name: "已提交", type: "" };
        } else if (value == -1) {
          return { name: "修改失败", type: "danger" };
        } else {
          return { name: "未知", type: "danger" };
        }
      } else {
        if (value == 0) {
          return { name: "未回调", type: "warning" };
        } else if (value == 1) {
          return { name: "已回调", type: "success" };;
        } else {
          return { name: "未知", type: "danger" };
        }
      }
    },

  },
};
</script>
<style lang="scss" scoped>
.descriptions {
  margin-top: 8px;

  .el-descriptions__header {
    margin-bottom: 8px;
  }
}

::v-deep .el-dialog__body {
  padding-top: 0;
}

::v-deep .el-descriptions__header {
  margin-bottom: 10px
}
</style>
