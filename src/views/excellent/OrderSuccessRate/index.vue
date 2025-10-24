<template>
  <div class="app-container fulltable_div">
    <el-form :model="queryParams" ref="queryForm" size="mini" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="统计时间" prop="StatisticalTime">
        <el-select v-model="queryParams.StatisticalTime" placeholder="请选择统计时间" style="width: 120px;">
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



      </el-form-item>
      <el-form-item label="业务中:" v-if="hasPermiVisible(['excellent:OrderRecords:platform']) && routeFlag == 'order'">
        <div class="FlexCenter">
          <div style="width: 150px;">
            <ChannelQueryVue v-model="channelQuery"></ChannelQueryVue>
          </div>
          <el-button-group style="margin-left: 6px;">
            <el-button type="primary" size="mini" @click="copyMch('payin')">代收</el-button>
            <el-button type="primary" size="mini" @click="copyMch('payout')">代付</el-button>
          </el-button-group>

          <ShowChannelPoolVue style="margin-left: 6px;"></ShowChannelPoolVue>
        </div>
      </el-form-item>

    </el-form>
    <!-- <dynamicTableVue :loading="loading" :tableData="OrderSuccessRateListSort" :cellClassName="'HoverTooltipCopy'"
      @cellDblclick="cellDblclick" >


    </dynamicTableVue> -->
    <el-table :key="tableKey" v-AutoHeight="{
      Ref: tableKey
    }" v-table-move="[tableKey]" :data="OrderSuccessRateListSort" @cell-dbclick="cellDblclick" v-loading="loading"
      :ref="tableKey" border :height="200" :cell-class-name="'HoverTooltipCopy'"
      :row-key="routeFlag == 'order' ? 'mch_num' : 'chnl_id'" :row-class-name="rowClassName">
      <el-table-column prop="mch_num" label="商户号" align="center" width="70" fixed="left" v-if="routeFlag == 'order'">
      </el-table-column>
      <el-table-column prop="chnl_id" label="通道名称" align="center" fixed="left" v-else
        :formatter="Formatter.SettingChannelNameFormatter" width="80">
      </el-table-column>

      <el-table-column label="代收分配" align="center" width="90"
        v-if="routeFlag == 'order' && hasPermiVisible(['excellent:OrderRecords:platform'])">
        <template slot-scope="scope">
          <el-tag v-if="routeFlag == 'order'" :type="AllocationMethod(scope.row, 'payin').type">{{
            AllocationMethod(scope.row, 'payin').label }}</el-tag>
        </template>
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



      <el-table-column prop="payout_success_rate" label="代付成功率" align="center" class-name="rate_show" width="100"
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
      <el-table-column label="代付分配" align="center" width="80"
        v-if="routeFlag == 'order' && hasPermiVisible(['excellent:OrderRecords:platform'])">
        <template slot-scope="scope">
          <el-tag v-if="routeFlag == 'order'" :type="AllocationMethod(scope.row, 'payout').type">{{
            AllocationMethod(scope.row, 'payout').label }}</el-tag>
        </template>
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

    </el-table>

  </div>
</template>

<script>
import { listOrderSuccessRate, listChnlSuccessRate } from "@/api/excellent/OrderSuccessRate";
import ShowChannelPoolVue from '@/components/dialog/showChannelPool.vue';
import { listMchAccConfig } from "@/api/excellent/mchAccConfig";
import { listChnlSetting } from "@/api/excellent/chnlSetting";
import ChannelQueryVue from '@/components/Excellent/Channel/ChannelQuery.vue';
import { mapState } from 'vuex'
export default {
  name: "OrderSuccessRate",
  components: { ChannelQueryVue, ShowChannelPoolVue },
  data() {
    return {
      tableKey: 0,//表格key值，用于刷新表格
      routeFlag: 'order', //路由标识
      SelectType: 'payin',//选择的类型，默认代收
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
  computed: {
    ...mapState({
      payInChannelPool: state => state.Cache.PayInChannelPool,
      payInChannelPool2: state => state.Cache.PayInChannelPool2,
      payOutChannelPool: state => state.Cache.PayOutChannelPool,
    }),

  },
  watch: {
    payInChannelPool: {
      handler(newVal, oldVal) {
        if (newVal.length === 0) {
          this.$store.dispatch('fetchChannelPool', { type: 'payin1' });
        }
      },
      deep: true
    },
    payInChannelPool2: {
      handler(newVal, oldVal) {
        if (newVal.length === 0) {
          this.$store.dispatch('fetchChannelPool', { type: 'payin2' });
        }
      },
      deep: true
    },
    payOutChannelPool: {
      handler(newVal, oldVal) {
        if (newVal.length === 0) {
          this.$store.dispatch('fetchChannelPool', { type: 'payout' });
        }
      },
      deep: true
    },
  },
  created() {
    this.routeFlag = this.$route.meta.flag;
    this.loading = true;

  },
  mounted() {
    this.routeFlag = this.$route.meta.flag;
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
      let sortList

      if (type === 'payin') {
        this.SelectType = 'payin'
        mchNumbers = this.OrderSuccessRateListSort
          .filter(item => item.payin_total_count > 0 && !textMch.includes(Number(item.mch_num)) && item.payin_chnl_id === this.channelQuery)
          .map(item => item.mch_num);
        sortList = this.sortByTypeAndCount(this.OrderSuccessRateListSort, { typeKey: 'payin_chnl_id', countKey: 'payin_total_count', filterType: this.channelQuery })
      }
      if (type === 'payout') {
        this.SelectType = 'payout'
        mchNumbers = this.OrderSuccessRateListSort
          .filter(item => item.payout_total_count > 0 && !textMch.includes(Number(item.mch_num)) && item.payout_chnl_id === this.channelQuery)
          .map(item => item.mch_num)
        sortList = this.sortByTypeAndCount(this.OrderSuccessRateListSort, { typeKey: 'payout_chnl_id', countKey: 'payout_total_count', filterType: this.channelQuery })
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
      this.loading = true

      this.$util.copyToClipboard(mchNumbers.join(','));
      this.OrderSuccessRateListSort = sortList;
      this.$nextTick(() => {
        this.loading = false
      })
    },
    //切换显示成功率
    changeRate() {
      this.tableKey++
      this.OrderSuccessRateList.splice(0);
      this.OrderSuccessRateListSort.splice(0);
      if (this.routeFlag === 'order') {

        this.routeFlag = 'chnl'
      } else {
        this.queryParams.StatisticalTime = "five"
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
    /**
 * 通用排序函数（保留全部数据）：
 * 1. 指定类型（filterType）优先排前；
 * 2. 同类型内：
 *    - 有数量（count > 0）的排前；
 *    - 数量相同时按降序；
 * 3. 其他类型保留在后。
 *
 * @param {Array} list - 要排序的数组
 * @param {Object} options - 配置项
 * @param {string} options.typeKey - 类型字段名，例如 "payin_chnl_id"
 * @param {string} options.countKey - 数量字段名，例如 "payin_total_count"
 * @param {string} [options.filterType] - 可选，指定优先排序的类型
 * @returns {Array} - 排序后的新数组
 */
    sortByTypeAndCount(list, { typeKey, countKey, filterType } = {}) {
      if (!Array.isArray(list)) return [];

      const result = [...list];

      result.sort((a, b) => {
        const typeA = a[typeKey];
        const typeB = b[typeKey];
        const countA = a[countKey] || 0;
        const countB = b[countKey] || 0;

        // 1️⃣ 指定类型优先排前
        if (filterType) {
          const isFilterA = typeA === filterType;
          const isFilterB = typeB === filterType;
          if (isFilterA && !isFilterB) return -1;
          if (!isFilterA && isFilterB) return 1;
        }

        // 2️⃣ 同类型内：有数量排前
        if (typeA === typeB) {
          if (countA > 0 && countB === 0) return -1;
          if (countA === 0 && countB > 0) return 1;
          return countB - countA; // 数量降序
        }

        // 3️⃣ 其他类型按字母排序
        return String(typeA).localeCompare(String(typeB));
      });

      return result;
    }
    ,
    //分配方式
    AllocationMethod(row, type) {
      //payin_second_distribution payin_first_distribution
      const payinType = (row.payin_first_distribution == 0 ? 'payin_first_distribution' : 'payin_second_distribution')
      const key = (type == 'payin' ? 'payin_distribution' : 'payout_distribution')
      const chnlKey = (type == 'payin' ? 'payin_chnl_id' : 'payout_chnl_id')
      let channelPool
      if (type == 'payin' && payinType == 'payin_first_distribution') {
        channelPool = this.payInChannelPool
      } else if (type == 'payin' && payinType == 'payin_second_distribution') {
        channelPool = this.payInChannelPool2
      } else if (type == 'payout') {
        channelPool = this.payOutChannelPool
      }
      if (row[key === 'payin_distribution' ? payinType : key] == 0 && channelPool.find(item => item.id == row[chnlKey])) {
        if (type == 'payin' && payinType == 'payin_first_distribution') {
          return {
            type: 'danger',
            label: '代收池1'
          }
        } else if (type == 'payin' && payinType == 'payin_second_distribution') {
          return {
            type: 'warning',
            label: '代收池2'
          }
        } else {
          return {
            type: 'warning',
            label: '分配中'

          }
        }


      }
      return {
        type: 'info',
        label: '未分配'
      }


    },
    //高亮选择的通道
    rowClassName({ row, rowIndex }) {
      const key = (this.SelectType === 'payin' ? 'payin_chnl_id' : 'payout_chnl_id')
      const countKey = (this.SelectType === 'payin' ? 'payin_total_count' : 'payout_total_count')
      if (row[key] == this.channelQuery && this.channelQuery && row[countKey] > 0) {
        return 'selectRow';
      }
      return '';
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
<style lang="scss">
.selectRow {
  background-color: rgba(64, 158, 255, 0.15) !important;
}
</style>
