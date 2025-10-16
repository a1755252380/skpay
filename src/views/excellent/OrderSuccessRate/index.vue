<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="统计时间" prop="StatisticalTime">
        <el-select v-model="queryParams.StatisticalTime" placeholder="请选择统计时间">
          <el-option v-for="item in StatisticalTimeOptions" :key="item.value" :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="fetchMchSettings(false)">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button icon="el-icon-refresh" type="warning" size="mini"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" @click="changeRate">{{ this.routeFlag ===
            'order'
            ? '通道成功率' :
            '订单成功率'
          }}</el-button>
        <el-form-item label="业务中:" v-if="hasPermiVisible(['excellent:OrderRecords:platform']) && routeFlag == 'order'">
          <div class="FlexCenter">
            <div style="width: 150px;">
              <ChannelQueryVue v-model="channelQuery"></ChannelQueryVue>
            </div>
            <el-button-group style="margin-left: 6px;">
              <el-button type="primary" size="mini" @click="copyMch('payin')">代收</el-button>
              <el-button type="primary" size="mini" @click="copyMch('payout')">代付</el-button>
            </el-button-group>
          </div>
        </el-form-item>

      </el-form-item>
    </el-form>


    <dynamicTableVue :loading="loading" :tableData="OrderSuccessRateListSort" :cellClassName="'HoverTooltipCopy'"
      @cellDblclick="cellDblclick">
      <el-table-column prop="mch_num" label="商户号" align="center" width="70" fixed="left" v-if="routeFlag == 'order'">
      </el-table-column>
      <el-table-column prop="chnl_id" label="通道名称" align="center" fixed="left" v-else
        :formatter="Formatter.SettingChannelNameFormatter" width="80">
      </el-table-column>
      <el-table-column label="代收通道" align="center" width="80"
        v-if="routeFlag == 'order' && hasPermiVisible(['excellent:OrderRecords:platform'])"
        :formatter="Formatter.MerchantChannelInNameFormatter">
      </el-table-column>
      <el-table-column label="代收分流通道" align="center" width="110"
        v-if="routeFlag == 'order' && hasPermiVisible(['excellent:OrderRecords:platform'])"
        :formatter="Formatter.MerchantChannelOverInNameFormatter">
      </el-table-column>
      <el-table-column prop="payin_success_rate" label="代收成功率" align="center" width="100" class-name="rate_show"
        :formatter="Formatter.TableRate">

      </el-table-column>
      <!-- <el-table-column prop="payin_success_service_charge" label="代收成功手续费" align="center"
        :formatter="Formatter.TableAmount">

      </el-table-column> -->
      <el-table-column prop="payin_success_count" label="代收成功订单总数" align="center">

      </el-table-column>
      <el-table-column prop="payin_success_amount" label="代收成功订单总额" align="center" :formatter="Formatter.TableAmount"
        min-width="100">

      </el-table-column>

      <el-table-column prop="payin_total_count" label="代收订单总数" align="center">

      </el-table-column>

      <el-table-column prop="payin_total_amount" label="代收总金额" align="center" min-width="100"
        :formatter="Formatter.TableAmount">

      </el-table-column>



      <el-table-column prop="payout_success_rate" label="代付成功率" align="center" class-name="rate_show" min-width="100"
        :formatter="Formatter.TableRate">

      </el-table-column>
      <el-table-column label="代付通道" align="center" width="80"
        v-if="routeFlag == 'order' && hasPermiVisible(['excellent:OrderRecords:platform'])"
        :formatter="Formatter.MerchantChannelOutNameFormatter">
      </el-table-column>
      <el-table-column label="代付分流通道" align="center" width="110"
        v-if="routeFlag == 'order' && hasPermiVisible(['excellent:OrderRecords:platform'])"
        :formatter="Formatter.MerchantChannelOverOutNameFormatter">
      </el-table-column>
      <!-- <el-table-column prop="payout_success_service_charge" label="代付成功手续费" align="center"
        :formatter="Formatter.TableAmount">

      </el-table-column> -->
      <el-table-column prop="payout_success_count" label="代付成功订单总数" align="center">

      </el-table-column>
      <el-table-column prop="payout_success_amount" label="代付成功订单总额" align="center" :formatter="Formatter.TableAmount"
        min-width="100">

      </el-table-column>

      <el-table-column prop="payout_total_count" label="代付订单总数" align="center">

      </el-table-column>
      <el-table-column prop="payout_total_amount" label="代付总金额" min-width="100" align="center"
        :formatter="Formatter.TableAmount">

      </el-table-column>
      <el-table-column prop="payout_pending_amount" label="代付在途金额
" align="center" :formatter="Formatter.TableAmount">

      </el-table-column>
      <el-table-column prop="payout_pending_count" label="代付在途总数" align="center">

      </el-table-column>

    </dynamicTableVue>
  </div>
</template>

<script>
import { listOrderSuccessRate, listChnlSuccessRate } from "@/api/excellent/OrderSuccessRate";
import dynamicTableVue from "@/components/Excellent/dynamicTable.vue";

import { listMchAccConfig } from "@/api/excellent/mchAccConfig";
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import ChannelQueryVue from '@/components/Excellent/Channel/ChannelQuery.vue';
export default {
  name: "OrderSuccessRate",
  components: { dynamicTableVue, ChannelQueryVue },
  data() {
    return {
      routeFlag: 'order', //路由标识
      channelQuery: null,
      loading: false,
      showSearch: true,
      queryParams: { StatisticalTime: "five" },
      StatisticalTimeOptions: [
        { label: "5分钟", value: "five" },
        { label: "10分钟", value: "ten" },
        { label: "30分钟", value: "thirty" },
        { label: "全部", value: "today" },
      ],
      OrderSuccessRateList: [],
      OrderSuccessRateListSort: [],
      mch_list: [],
    };
  },
  filters: {

  },
  created() {
    this.routeFlag = this.$route.meta.flag;
    this.loading = true;
  },
  mounted() {
    this.fetchMchSettings();
  },
  methods: {
    //复制在跑的商户
    copyMch(type) {
      if (this.routeFlag !== 'order') {
        return
      }
      if (!this.channelQuery) {
        this.$notify({
          title: "请选择" + (type === 'payin' ? '代收' : '代付') + "通道",
          customClass: "NotificationMessage",
          duration: 1000,
          type: "warning",
        });
        return;
      }
      const textMch = [888888, 999999, 1234567]
      let mchNumbers
      if (type === 'payin') {
        mchNumbers = this.OrderSuccessRateListSort
          .filter(item => item.payin_total_count > 0 && !textMch.includes(Number(item.mch_num)) && item.payin_chnl_id === this.channelQuery)
          .map(item => item.mch_num);

      }
      if (type === 'payout') {
        mchNumbers = this.OrderSuccessRateListSort
          .filter(item => item.payout_total_count > 0 && !textMch.includes(Number(item.mch_num)) && item.payout_chnl_id === this.channelQuery)
          .map(item => item.mch_num)

      }
      if (mchNumbers.length === 0) {
        this.$notify({
          title: "暂无" + (type === 'payin' ? '代收' : '代付') + "中的商户",
          customClass: "NotificationMessage",
          duration: 1000,
          type: "warning",
        });
        return;

      }
      this.$util.copyToClipboard(mchNumbers.join(','));
    },
    //切换显示成功率
    changeRate() {
      this.OrderSuccessRateList.splice(0);
      this.OrderSuccessRateListSort.splice(0);
      if (this.routeFlag === 'order') {
        this.routeFlag = 'chnl'
      } else {
        this.routeFlag = 'order'
      }
      this.fetchMchSettings();
    },
    //添加数据
    async AddData(res) {
      this.OrderSuccessRateList.splice(0)
      for (let index = 0; index < res.length; index++) {
        let q = {}
        if (this.routeFlag == 'order') {
          q = res[index]
        } else {
          q = res[index]
        }

        this.OrderSuccessRateList.push({
          ...res[index],
          payin_success_amount: 0,
          payin_success_count: 0,
          payin_success_rate: 0,
          payin_total_amount: 0,
          payin_total_count: 0,
          payout_success_amount: 0,
          payout_success_count: 0,
          payout_success_rate: 0,
          payout_total_amount: 0,
          payout_total_count: 0, payout_pending_amount_count: 0, payout_pending_count: 0
        });


      }

    },
    async UpdateData(list) {


      let key = this.routeFlag === 'order' ? "mch_number" : "chnl_id"
      let FindKey = this.routeFlag === 'order' ? "mch_num" : "id"



      const resultList = this.mergeListsByTwoKeys(list, this.mch_list, key, FindKey)
      console.log(resultList);

      for (const newItem of resultList) {
        // 查找 this.OrderSuccessRateList 中是否有匹配的项
        const index = this.OrderSuccessRateList.findIndex(
          (item) => item[FindKey] === newItem[key]
        );

        if (index !== -1) {
          // 如果找到匹配项，更新它（使用 Vue 的 $set 确保响应式）
          this.$set(this.OrderSuccessRateList, index, {
            ...this.OrderSuccessRateList[index], // 保留原有数据
            ...newItem,                         // 用新数据覆盖
          });
        } else {
          // 如果没有匹配项，可以选择是否添加到 this.OrderSuccessRateList
          // this.OrderSuccessRateList.push(newItem); // 如果需要新增，取消注释
        }
      }
      this.handleSort().then(() => {
        this.loading = false;

      })
    },
    async fetchMchSettings(add = true) {
      this.loading = true;
      if (this.routeFlag == "order") {
        listMchAccConfig().then((res) => {
          this.mch_list = res.rows;
          if (add) {
            this.AddData(res.rows).then(res => {
              this.getList();
            })
          } else {
            this.getList();
          }


        });
      }
      if (this.routeFlag == "chnl") {
        if (add) {
          listChnlSetting().then((res) => {
            this.mch_list = res.rows;
            this.AddData(res.rows).then(res => {
              this.getList();
            })
          });
        } else {
          this.getList();
        }

      }
    },
    async getList() {


      if (this.routeFlag == "chnl") {
        const query = {
          chnl_list: this.mch_list.map((item) => item.chnl_name),
          cycle: this.queryParams.StatisticalTime,
        };

        listChnlSuccessRate(query).then((response) => {
          this.UpdateData(response.data);
        });
      } else {
        const query = {
          mch_list: this.mch_list.map((item) => item.mch_num),
          cycle: this.queryParams.StatisticalTime,
        };
        listOrderSuccessRate(query).then((response) => {

          this.UpdateData(response.data);
        });
      }



    },
    //合并配置信息和成功率数据
    /**
  * 合并两个列表，按照两个不同的 key 匹配（只要值相同就合并）
  * @param {Array} list1 - 第一个对象数组
  * @param {Array} list2 - 第二个对象数组
  * @param {string} key1 - 第一个列表的匹配属性
  * @param {string} key2 - 第二个列表的匹配属性
  * @returns {Array} 合并后的新数组
  */
    mergeListsByTwoKeys(list1, list2, key1, key2) {
      const map = new Map();

      // 先遍历 list1，用 key1 的值作为 Map 的键
      for (const item of list1) {
        if (item[key1] !== undefined) {
          map.set(item[key1], { ...item });
        }
      }

      // 遍历 list2，检查 key2 的值是否匹配 key1 的值
      for (const item of list2) {
        if (item[key2] !== undefined) {
          // 查找是否有 key1 的值等于当前 key2 的值
          const matchedKey = Array.from(map.keys()).find(
            (k) => k === item[key2]
          );

          if (matchedKey !== undefined) {
            // 合并对象（后者覆盖前者）
            const mergedItem = { ...map.get(matchedKey), ...item };
            map.set(matchedKey, mergedItem);
          } else {
            // 如果没有匹配项，仍然保留（可选是否添加）
            // map.set(item[key2], { ...item }); // 如果需要保留未匹配项，取消注释
          }
        }
      }

      return Array.from(map.values());
    },
    resetQuery() {
      this.queryParams.StatisticalTime = "today";
      this.getList();
    },
    FormatAmount(value) {
      return (value / 100).toFixed(2);
    },
    FormatRate(value) {
      return value.toFixed(2) + "%";
    },
    async handleSort() {

      // 根据列名和排序顺序进行排序
      this.OrderSuccessRateListSort = await [...this.OrderSuccessRateList].sort((a, b) => {
        if (a.payin_total_count == '0' && b.payin_total_count == '0') {
          return b.payout_total_count - a.payout_total_count;
        } else if (a.payin_total_count == '0') {
          return 1;
        } else if (b.payin_total_count == '0') {
          return -1;
        } else {
          return b.payin_total_count - a.payin_total_count;
        }
      });
    },
    cellDblclick(row, column, cell, event) {
      this.$util.copyToClipboard(cell.innerText);
    }
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 0px;
  padding-bottom: 6px;
}
</style>
