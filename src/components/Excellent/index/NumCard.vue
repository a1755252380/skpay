<template>
  <div class="NumCard">
    <!-- <div class="card_left">
      <div class="card_left_img">
        <i class="el-icon-goods"></i>
      </div>
    </div> -->
    <div class="card_right">

      <div class="card_context">
        <!-- :style="{ 'color': (color) }"> -->
        <vue-numeric read-only placeholder="0" :currency="currency" :value="displayValue" :precision="precision"
          :style="{ 'color': (color) }" :animated="true" output-type="String"
          :currency-symbol-position="position"></vue-numeric>
      </div>
      <div class="card_title">{{ name }}</div>
    </div>
  </div>
</template>

<script>
import VueNumeric from "vue-numeric";
export default {
  name: "WorkspaceJsonNumCard",
  props: {
    "name": {
      type: String,
      default: "标题",
    },
    "value": {
      type: [String, Number],
      default: 0,
    },
    "color": {
      type: String,
      default: "#000",
    },
    precision: {
      type: Number,
      default: 2,
    },
    currency: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: 'prefix'
    }
  },

  data() {
    return {
      displayValue: 0, // 显示的数字
    };
  },
  components: {
    VueNumeric,
  },
  mounted() { },
  watch: {
    value: {
      deep: true,
      handler(newValue, oldval) {


        if (newValue != oldval) {
          this.startAnimation(newValue); // 监听value变化，重新开始动画
        }
      }
    },
  },

  methods: {
    startAnimation(newValue) {
      console.log(newValue);

      let increment; // 设置每次变化的值
      increment = (newValue - this.displayValue);
      if (increment > 100) {
        increment = parseInt((newValue - this.displayValue) / 10);
      }
      // if (this.currency == '%') {


      // } else {

      //   if (increment < 1) {
      //     increment = 1
      //   }
      // }


      const interval = setInterval(() => {

        // 如果是增长
        if (increment > 0 && this.displayValue >= newValue) {
          this.displayValue = newValue;
          clearInterval(interval); // 达到目标值，停止动画
        }
        // 如果是减少
        else if (increment < 0 && this.displayValue <= newValue) {
          this.displayValue = newValue;
          clearInterval(interval); // 达到目标值，停止动画
        }
        else {
          this.displayValue += increment;
        }
      }, 50); // 每30毫秒跳动一次
    },

    percentModifierMethod(value) {

      if (this.percentModifier == '') {
        return value;
      } else if (this.percentModifier == '%') {
        return value + '%';  // 添加百分比符号
      }
      return value   // 添加百分比符号
    }
  },
};
</script>
<style lang="scss">
.NumCard {
  // background: #e9eef5;
  background: #fff;
  box-shadow: 1px 1px 8px 0px #00000014;
  // box-shadow: var(0 0 #0000, 0 0 #0000), var(0 0 #0000, 0 0 #0000), var(0 0 #0000) !important;
  // box-shadow: -9px -5px 17px 0px #FFFFFF;
  // display: flex;
  // align-items: center;
  padding: 12px 12px 12px 26px;
  // margin: 16px 0;
  border-radius: 8px;
  margin: 10px 0;

  .card_left {
    .card_left_img {
      border-radius: 50%;
      padding: 8px 12px;
      background-color: #fff;
      color: #000;
    }
  }

  .card_right {
    // flex: 1;
    // padding-left: 16px;

    .card_title {
      font-size: 18px;
      color: #9da7b6;
      margin-bottom: 8px;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      font-weight: 600;
    }

    .card_context {
      // display: flex;
      // justify-content: center;
      text-align: left;
      font-size: 20px;
      color: #4E5A6D;
      // padding: 24px;
      margin-bottom: 12px;
      font-weight: 700;
    }
  }
}
</style>
