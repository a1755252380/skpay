<template>
  <div :id="id" class="echart_div" :style="styles" :ref="id"></div>
</template>

<script>
import * as echarts from "echarts";
import { throttle } from "@/utils/util.js";

export default {
  name: "WorkspaceJsonEcharts",
  props: {
    id: {
      type: String,
    },
    styles: {
      type: Object,
    },
  },
  data() {
    const hexToRgba = (hex, opacity) => {
      let rgbaColor = ''
      const reg = /^#[\da-f]{6}$/i
      if (reg.test(hex)) {
        rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt('0x' + hex.slice(3, 5))},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
      }
      return rgbaColor
    }
    const lineStyle = (index) => {
      return {
        normal: {
          color: '#4467EF',
          shadowColor: hexToRgba('#4467EF', 0.5),
          shadowBlur: 2,
          shadowOffsetY: 0
        }
      }
    }
    const areaStyle = (index) => {
      return {
        normal: {
          color: echarts.graphic.LinearGradient(0, 0, 0, 1,
            [{
              offset: 0,
              color: hexToRgba('#4467EF', 0.3)
            }, {
              offset: 1,
              color: hexToRgba('#4467EF', 0.1)
            }]
          ),
          shadowColor: hexToRgba('#4467EF', 0.1),
          shadowBlur: 10
        }
      }
    }
    return {
      resizeObserver: null,
      myChart: null,
      max: 0,
      option: {


        // backgroundColor: '#fff',


        title: {
          text: this.$store.state.IndexData.SuccessRateOfProxyPaymentTitle,
          // top: 10,
          // right: 10,
          // textStyle: {
          //     fontSize: 12,
          //     fontWeight: 400,
          //     color: '#567'
          // }
        },
        legend: {
          show: false
        },
        // tooltip: {
        //   trigger: "axis",
        //   axisPointer: {
        //     type: "cross",
        //     label: {
        //       backgroundColor: "#6a7985",
        //     },
        //   },
        // },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          extraCssText: 'font-size:14px;line-height:24px;color:#567;background:#fff;box-shadow:0 0 3px rgba(0, 0, 0, 0.2)',
          formatter: function (params) {
            let html = ''
            params.forEach(v => {
              html += `<div style='  font-size:16px;font-weight:600;'>
                ${v.axisValue}

                  <div style="color:'#4467EF';
                  font-size:16px;font-weight:600;text-align:center"><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:
                  #4467EF;marign-right:5px"></span>当日代付成功率：${v.value * 100}%
                  </div></div>`
            })
            return html
          }
        },
        xAxis: {
          data: this.$store.state.IndexData.CollectionSuccessRateX
        },
        yAxis: [
          {
            type: "value",
            axisLabel: {
              formatter: function (value) {
                // 将Y轴的数据格式化为百分比
                return (value * 100).toFixed(2) + '%';
              }
            },
            min: function (value) {
              return value.min - (value.min * 0.1);  // 让最小值稍微小一点，突出变化
            },
            max: function (value) {
              return value.max + (value.max * 0.2) >= 1 ? 1 : value.max + (value.max * 0.2);  // 让最大值稍微大一点
            },
            // axisLine: {
            //   show: true,
            // }
          },
        ],
        grid: {
          left: "5%",
          right: "3%",
          bottom: "8%",
          containLabel: false,
        },
        series: [{
          name: this.$store.state.IndexData.SuccessRateOfProxyPaymentTitle,
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: lineStyle(0),
          areaStyle: areaStyle(0),
          data: this.$store.state.IndexData.SuccessRateOfProxyPaymentY,
          label: {
            show: false,
            position: 'top',
            formatter: function (param) {
              // 格式化数据标签显示为百分比
              return (param.value * 100).toFixed(2) + '%';
            }
          },
        }]





      },
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.createEcharts();
      this.resizeObserver = new ResizeObserver(
        throttle(() => {
          this.handleResize();
        }, 150)
      );
      this.resizeObserver.observe(this.$refs[this.id]);
    });
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.$refs[this.id]);
      this.resizeObserver.disconnect();
    }
  },

  methods: {
    createEcharts() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById(this.id));
      // 绘制图表
      this.myChart.setOption(this.option);
      document.getElementById(this.id).setAttribute("_echarts_instance_", "");
    },
    //更新图表
    UpdateEchart() {

      this.myChart.setOption(this.option);
    },
    //设置大小监听
    handleResize() {
      this.myChart.resize({
        width: "auto",
        height: "auto",
        silent: false,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.echart_div {
  width: 100%;
}
</style>
