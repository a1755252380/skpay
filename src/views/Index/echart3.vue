<template>
    <el-row :gutter="30">
        <el-col :md="24" :sm="24" :xs="24">
            <CreateEcharts :id="'ChannelEndOrderStatisticsLine'" :options="lineOptions" :styles="{
                'height': '23rem',
                'padding': '1rem 0',
            }"></CreateEcharts>
        </el-col>
        <el-col :md="12" :sm="12" :xs="24">
            <CreateEcharts :id="'ChannelEndOrderStatisticsPie2'" :options="pieOptions2" :styles="{
                'height': '23rem',
                'padding': '1rem 0',
            }"></CreateEcharts>
        </el-col>
        <el-col :md="12" :sm="12" :xs="24">
            <CreateEcharts :id="'ChannelEndOrderStatisticsPie1'" :options="pieOptions" :styles="{
                'height': '23rem',
                'padding': '1rem 0',
            }"></CreateEcharts>
        </el-col>

    </el-row>
</template>

<script>
import CreateEcharts from '@/components/Echart/CreateEcharts.vue'
export default {
    name: 'ChannelEndOrderStatistics',

    data() {
        return {
            CardShow: [{
                name: '账目总额',
                value: parseFloat(Math.random() * 100).toFixed(2)
            }, {
                name: '代收总额',
                value: parseFloat(Math.random() * 100).toFixed(2)
            }, {
                name: '代付总额',
                value: parseFloat(Math.random() * 100).toFixed(2)
            }, {
                name: '可用余额',
                value: parseFloat(Math.random() * 100).toFixed(2)
            }, {
                name: '代付回退总额',
                value: parseFloat(Math.random() * 100).toFixed(2)
            }, {
                name: '未完成代付',
                value: parseFloat(Math.random() * 100).toFixed(2)
            }],
            lineOptions: {},

            pieOptions: {
            }
        };
    },

    mounted() {

    },
    created() {
        this.StartOptions()
    },

    methods: {
        StartOptions() {
            let legend = ['日代收金额', '日代付金额', '日代收订单数量', '日代付订单数量']
            let series = []
            let dates = []
            for (let i = 0; i < 16; i++) {
                let currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - i);
                dates.push(currentDate.toISOString().split('T')[0]); // 格式化为YYYY-MM-DD
            }
            dates = dates.reduceRight((acc, val) => [...acc, val], []);
            for (let index = 0; index < legend.length; index++) {
                let data = []
                for (let i = 0; i < dates.length; i++) {
                    data.push(parseInt(Math.random() * 20))
                }
                series.push(
                    {
                        name: legend[index],
                        type: 'line',
                        smooth: true,
                        stack: 'Total',
                        data: data
                    }

                )

            }

            this.lineOptions = {
                title: {
                    text: '每日数据'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                legend: {
                    data: legend
                },
                grid: {

                    left: '3%',
                    right: '0%',
                    bottom: '8%',
                    containLabel: false
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: dates
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: series
            }

            //饼图数据模拟
            let nameList = ['代收总额', '代付总额', '代付回退总额']
            let piedata = []
            for (let index = 0; index < nameList.length; index++) {
                piedata.push(
                    { value: parseFloat(Math.random() * 1000).toFixed(2), name: nameList[index] },

                )

            }

            this.pieOptions = {
                title: {
                    text: '资金分布',
                    left: '0'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    bottom: 0
                },
                series: [
                    {
                        type: 'pie',
                        radius: '50%',
                        data: piedata,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            }
            // ��图数据模拟
            //饼图数据模拟
            let nameList2 = ['已完成', '未完成']
            let piedata2 = []
            for (let index = 0; index < nameList2.length; index++) {
                piedata2.push(
                    { value: parseInt(Math.random() * 1000), name: nameList2[index] },

                )

            }

            let formatNumber = function (num) {
                let reg = /(?=(\B)(\d{3})+$)/g;
                return num.toString().replace(reg, ',');
            }
            let total = piedata2.reduce((a, b) => {
                return a + b.value * 1
            }, 0);

            this.pieOptions2 = {
                // color: color,
                tooltip: {
                    trigger: 'item'
                },

                title: [{
                    text: '{name|代付订单总数}\n{val|' + formatNumber(total) + '}',
                    top: 'center',
                    left: 'center',
                    textStyle: {
                        rich: {
                            name: {
                                fontSize: 14,
                                fontWeight: 'normal',
                                color: '#666666',
                                padding: [10, 0]
                            },
                            val: {
                                fontSize: 32,
                                fontWeight: 'bold',
                                color: '#333333',
                            }
                        }
                    }
                }, {
                    text: '代付订单',
                    left: 0
                }],
                // legend: {
                //     orient: 'vertical',
                //     icon: 'rect',
                //     x: '80%',
                //     y: 'center',
                //     itemWidth: 12,
                //     itemHeight: 12,
                //     align: 'left',
                //     textStyle: {
                //         rich: {
                //             name: {
                //                 fontSize: 12
                //             },
                //             value: {
                //                 fontSize: 16,
                //                 padding: [0, 5, 0, 15]
                //             },
                //             unit: {
                //                 fontSize: 12
                //             }
                //         }
                //     },
                //     formatter: function(name) {
                //         let res = echartData.filter(v => v.name === name);
                //         res = res[0] || {};
                //         let unit = res.unit || '';
                //         return '{name|' + name + '}  {value|' + res.value + '}{unit|' + unit + '}'
                //     }
                //     // data: legendName
                // },
                series: [{
                    type: 'pie',
                    radius: ['45%', '60%'],
                    center: ['50%', '50%'],
                    data: piedata2,
                    hoverAnimation: false,
                    itemStyle: {
                        normal: {
                            borderColor: "#fff",
                            borderWidth: 2
                        }
                    },
                    labelLine: {
                        normal: {
                            length: 16,
                            length2: 60,
                            lineStyle: {
                                color: '#e6e6e6'
                            }
                        }
                    },
                    label: {
                        normal: {
                            formatter: params => {
                                return (
                                    '{icon|●}{name|' + params.name + '}{value|' +
                                    formatNumber(params.value) + '}'
                                );
                            },
                            padding: [0, -100, 25, -60],
                            rich: {
                                icon: {
                                    fontSize: 16
                                },
                                name: {
                                    fontSize: 12,
                                    padding: [0, 10, 0, 4],
                                    color: '#666666'
                                },
                                value: {
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: '#333333'
                                }
                            }
                        }
                    },
                }]
            };
        }
    },
    components: { CreateEcharts },
};
</script>