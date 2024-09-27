<template>
    <div :id="id" class="echart_div" :style="styles" :ref="id">
        <!-- -->
    </div>
</template>

<script>
import * as echarts from 'echarts';
import { throttle } from '@/utils/util.js';

export default {
    name: 'WorkspaceJsonEcharts',
    props: {
        id: {
            type: String,
        },
        options: {
            type: Object,

        },
        styles: {
            type: Object
        }
    },
    data() {
        return {
            resizeObserver: null,
            myChart: null
        };
    },
    watch: {
        options: {
            deep: true,
            handler(newval, oldval) {
                this.createEcharts(newval)
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.createEcharts(this.options)
            this.resizeObserver = new ResizeObserver(throttle(() => {
                this.handleResize()
            }, 150));
            this.resizeObserver.observe(this.$refs[this.id]);
        })
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
            this.myChart.setOption(this.options);
            document.getElementById(this.id).setAttribute('_echarts_instance_', '');




        },
        handleResize() {
            this.myChart.resize({
                width: 'auto',
                height: 'auto',
                silent: false
            })
        }
    },
};
</script>
<style lang="scss" scoped>
.echart_div {
    width: 100%;
}
</style>