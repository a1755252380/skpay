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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="QuerySearch">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-refresh" size="mini" @click="AutoQuerySearch">{{ this.AutoQuery ?
          `${this.AutoQueryInterval}s` : 'AUTO'
          }}</el-button>
        <el-button icon="el-icon-refresh" type="warning" size="mini" :disabled="loading"
          v-if="hasPermiVisible(['excellent:OrderRecords:platform'])" @click="changeRate">{{ this.routeFlag ===
            'order'
            ? '通道成功率' :
            '订单成功率'
          }}</el-button>



      </el-form-item>
      <el-form-item label="业务中:" v-if="hasPermiVisible(['excellent:OrderRecords:platform']) && routeFlag == 'order'">
        <div class="FlexCenter">
          <div style="width: 100px;">
            <mchNumSelectVue v-model="mchNumSelect" :placeholder='"商户"' @change="handleChangeMchNum"></mchNumSelectVue>
          </div>
          <div style="width: 100px;margin-left: 6px;">
            <ChannelQueryVue v-model="channelQuery" :placeholder='"通道"'>
            </ChannelQueryVue>
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
    }" v-table-move="[tableKey]" :data="OrderSuccessRateListMchSelect" @cell-dbclick="cellDblclick" v-loading="loading"
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
      <el-table-column label="代收分流" align="center" width="80"
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
      <el-table-column label="代付分流" align="center" width="80"
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
      <el-table-column prop="payout_pending_amount" label="代付在途金额" align="center" :formatter="Formatter.TableAmount"
        width="100">

      </el-table-column>
      <el-table-column prop="payout_pending_count" label="代付在途总数" align="center">

      </el-table-column>

    </el-table>

  </div>
</template>

<script>
import { listOrderSuccessRate, listChnlSuccessRate } from "@/api/excellent/OrderSuccessRate";
import ShowChannelPoolVue from '@/components/dialog/showChannelPool.vue';
// import { listMchAccConfig } from "@/api/excellent/mchAccConfig";
// import { listChnlSetting } from "@/api/excellent/chnlSetting";
import ChannelQueryVue from '@/components/Excellent/Channel/ChannelQuery.vue';

import { mapState } from 'vuex'
import mchNumSelectVue from '@/components/Excellent/Mch/mchNumSelect.vue';
export default {
  name: "OrderSuccessRate",
  components: { ChannelQueryVue, ShowChannelPoolVue, mchNumSelectVue },
  data() {
    return {
      AutoQuery: false,//是否自动查询
      AutoQueryIntervalDefault: 15,//自动查询时间间隔，默认1分钟
      AutoQueryInterval: 15,//自动查询时间间隔，默认1分钟
      AutoTimer: null,//自动查询定时器
      isFetching: false,//是否正在请求，用来防止重复触发
      tableKey: 0,//表格key值，用于刷新表格
      routeFlag: 'order', //路由标识
      SelectType: null,//选择的类型，默认代收
      channelQuery: null,//通道查询
      mchNumSelect: null,//商户选择
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
      // mch_list: [],
    };
  },
  computed: {

    ...mapState({
      payInChannelPool: state => state.Cache.PayInChannelPool,
      payInChannelPool2: state => state.Cache.PayInChannelPool2,
      payOutChannelPool: state => state.Cache.PayOutChannelPool,
    }),
    OrderSuccessRateListMchSelect() {
      if (this.mchNumSelect) {
        const filterIndex = this.OrderSuccessRateListSort.indexOf(this.OrderSuccessRateListSort.find(item => item.mch_num == this.mchNumSelect))
        return this.OrderSuccessRateListSort.slice(filterIndex, filterIndex + 1)
      }
      return this.OrderSuccessRateListSort
    },
    mch_list() {
      if (this.routeFlag == "order") {
        return this.$store.state.Cache.MchConfigList || []
      }
      return this.$store.state.Cache.channelList || []
    },
  },
  activated() {
    document.addEventListener("visibilitychange", this.handleVisibilityChange)

    // 页面恢复 → 如果 AutoQuery 开启则启动自动查询
    if (this.AutoQuery) {
      this.startAutoQuery()
    }
    this.channelQuery = null
    this.mchNumSelect = null
    this.SelectType = null
    this.fetchChannelPool();
    this.fetchMchSettings();
  },

  deactivated() {
    // 离开缓存页面 → 停止自动查询
    this.stopAutoQuery()
    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
  },
  beforeDestroy() {
    // 清理
    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
    this.stopAutoQuery()
  },
  created() {
    // 监听页面可见性变化
    document.addEventListener("visibilitychange", this.handleVisibilityChange)
    this.routeFlag = this.$route.meta.flag;
    this.loading = true;
  },
  mounted() {
    this.routeFlag = this.$route.meta.flag;
    this.$nextTick(() => {
      this.fetchMchSettings();
    })
  },
  methods: {

    //复制在跑的商户
    copyMch(type) {
      if (this.routeFlag !== 'order') {
        return
      }
      const textMch = [888888, 999999, 1234567]
      let mchNumbers = []
      if (this.SelectType) {
        this.SelectType = null
        return
      }
      let sortList
      if (!this.channelQuery) {
        if (type === 'payin') {
          this.$msgbox({
            title: '请选择代收池',
            message: `
    <div style="text-align:center;">
      <button id="pool1" style="margin-right:10px" class="el-button el-button--primary">代收池1</button>
      <button id="pool2" class="el-button el-button--success">代收池2</button>
    </div>
  `,
            dangerouslyUseHTMLString: true,
            showCancelButton: false,
            showConfirmButton: false
          })


          this.$nextTick(() => {
            document.getElementById('pool1').onclick = () => {
              this.SelectType = 'payinPool1'
              for (let index = 0; index < this.payInChannelPool.length; index++) {
                mchNumbers = mchNumbers.concat(this.OrderSuccessRateListSort
                  .filter(item => item.payin_total_count > 5 && !textMch.includes(Number(item.mch_num)) && Number(item.payin_chnl_id) === Number(this.payInChannelPool[index].id))
                  .map(item => item.mch_num))
              }

              this.copyMchList(mchNumbers, type)
              this.$msgbox.close()
            }
            document.getElementById('pool2').onclick = () => {
              this.SelectType = 'payinPool2'
              for (let index = 0; index < this.payInChannelPool2.length; index++) {
                mchNumbers = mchNumbers.concat(this.OrderSuccessRateListSort
                  .filter(item => item.payin_total_count > 0 && !textMch.includes(Number(item.mch_num)) && Number(item.payin_chnl_id) === Number(this.payInChannelPool2[index].id))
                  .map(item => item.mch_num))
              }

              this.copyMchList(mchNumbers, type)
              this.$msgbox.close()
            }
          })
        }
        if (type === 'payout') {
          this.SelectType = 'payoutPool'
          for (let index = 0; index < this.payOutChannelPool.length; index++) {
            mchNumbers = mchNumbers.concat(this.OrderSuccessRateListSort
              .filter(item => item.payout_total_count > 0 && !textMch.includes(Number(item.mch_num)) && Number(item.payout_chnl_id) === Number(this.payOutChannelPool[index].id))
              .map(item => item.mch_num))
          }

          this.copyMchList(mchNumbers, type)
        }
      } else {

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
        this.copyMchList(mchNumbers, type)
        this.OrderSuccessRateListSort = sortList;

      }



    },
    copyMchList(mchNumbers, type) {

      if (mchNumbers.length === 0) {
        switch (this.SelectType) {
          case 'payinPool1':
            this.$notify({
              title: "暂无代收池1中的商户",
              customClass: "NotificationMessage", type: "warning",
              duration: 1000,
            });
            break;
          case 'payinPool2':
            this.$notify({
              title: "暂无代收池2中的商户",
              customClass: "NotificationMessage", type: "warning",
              duration: 1000,
            });
            break;
          case 'payoutPool':
            this.$notify({
              title: "暂无代付池中的商户",
              customClass: "NotificationMessage", type: "warning",
              duration: 1000,
            });
            break;
          case 'payin':
            this.$notify({
              title: "暂无代收中的商户",
              customClass: "NotificationMessage",
              duration: 1000,
              type: "warning",
            });
            break;
          case 'payout':
            this.$notify({
              title: "暂无代付中的商户",
              customClass: "NotificationMessage",
              duration: 1000,
              type: "warning",
            });
            break;
        }
        // this.$notify({
        //   title: "暂无" + (type === 'payin' ? '代收' : '代付') + "中的商户",
        //   customClass: "NotificationMessage",
        //   duration: 1000,
        //   type: "warning",
        // });
        return;

      }
      this.loading = true

      this.$util.copyToClipboard(mchNumbers.join(','));
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
      this.resetQuery()
      this.stopAutoQuery()
      this.AutoQuery = false
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
    //更新数据
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
        this.$nextTick(() => {
          this.$refs[this.tableKey].doLayout()
          this.loading = false;

        })
      })
    },
    // 判断是否需要加载商户或通道列表
    // 判断是否需要加载商户或通道列表
    async isEmptyArray() {
      // 1. 判断目标列表
      const targetList = this.routeFlag === "order" ? "MchConfigList" : "channelList";

      // 2. 如果已有数据，直接返回
      if (this.$store.state.Cache[targetList]?.length > 0) {
        return true;
      }

      // 3. 发起异步请求
      const actionName = this.routeFlag === "order" ? "fetchMchConfigList" : "fetchOptions";
      this.$store.dispatch(actionName);

      // 4. 等待数据加载完成
      return new Promise((resolve) => {
        const unwatch = this.$watch(
          () => this.$store.state.Cache[targetList]?.length,
          (val) => {
            if (val > 0) {
              unwatch(); // 数据来了之后取消监听
              resolve(true);
              console.log("数据加载完成");
            }
          }
        );
      });
    }
    ,
    //查询通道或商户缓存数据
    fetchCacheMch() {
      const actionName = this.routeFlag === "order" ? "fetchMchConfigList" : "fetchOptions";
      this.$store.dispatch(actionName, {
        isUpdate: true
      });
    },
    //查询按钮
    //查询按钮点击事件
    QuerySearch() {
      this.AutoQuery = false
      this.stopAutoQuery();
      this.fetchMchSettings(false);
    },

    // 获取商户配置信息
    async fetchMchSettings(add = true) {
      this.loading = true;
      try {
        // 先确保数据已加载
        await this.isEmptyArray();

        // 再次等待 Vue 响应式更新（确保 this.mch_list 已变更）
        await this.$nextTick();

        if (this.routeFlag === "order") {
          if (add) {
            await this.AddData(this.mch_list);
          } else {
            this.fetchCacheMch()
          }
          await this.getList();
        } else if (this.routeFlag === "chnl") {
          if (add) {
            await this.AddData(this.mch_list);
          } else {
            this.fetchCacheMch()
          }
          await this.getList();
        }
      } catch (err) {
        console.error("fetchMchSettings 执行失败:", err);
      }

      return new Promise((resolve, reject) => {
        resolve()
      })
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

    //获取通道池信息
    fetchChannelPool() {
      if (!this.$store.state.Cache.PayInChannelLoading) {
        this.$store.dispatch('fetchChannelPool', { type: 'payin1', isUpdate: true });

      }
      if (!this.$store.state.Cache.PayInChannelPool2Loading) {
        this.$store.dispatch('fetchChannelPool', { type: 'payin2', isUpdate: true });

      }
      if (!this.$store.state.Cache.PayOutChannelLoading) {
        this.$store.dispatch('fetchChannelPool', { type: 'payout', isUpdate: true });

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
      this.SelectType = null//选择的类型，默认代收
      this.channelQuery = null//通道查询
      this.mchNumSelect = null//商户选择
      if (this.routeFlag === 'order') {
        this.queryParams.StatisticalTime = "five";
      } else {
        this.queryParams.StatisticalTime = "today";

      }
      this.fetchMchSettings(false);
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
    handleChangeMchNum() {
      if (this.mchNumSelect) {
        this.channelQuery = null
      }

    },
    //高亮选择的通道
    rowClassName({ row, rowIndex }) {
      if (this.SelectType == 'payinPool1' || this.SelectType == 'payinPool2' || this.SelectType == 'payoutPool') {
        const key = (this.SelectType === 'payinPool1' || this.SelectType === 'payinPool2' ? 'payin_chnl_id' : 'payout_chnl_id')
        const countKey = (this.SelectType === 'payinPool1' || this.SelectType === 'payinPool2' ? 'payin_total_count' : 'payout_total_count')
        if (this.SelectType == 'payinPool1' && this.payInChannelPool.find(item => item.id == row[key]) && row[countKey] > 0) {
          return 'selectRow';
        }
        if (this.SelectType == 'payinPool2' && this.payInChannelPool2.find(item => item.id == row[key]) && row[countKey] > 0) {
          return 'selectRow';
        }
        if (this.SelectType == 'payoutPool' && this.payOutChannelPool.find(item => item.id == row[key]) && row[countKey] > 0) {
          return 'selectRow';
        }

        return '';
      }
      const key = (this.SelectType === 'payin' ? 'payin_chnl_id' : 'payout_chnl_id')
      const countKey = (this.SelectType === 'payin' ? 'payin_total_count' : 'payout_total_count')
      if (row[key] == this.channelQuery && this.channelQuery && row[countKey] > 0) {
        return 'selectRow';
      }
      return '';
    },

    cellDblclick(row, column, cell, event) {
      this.$util.copyToClipboard(cell.innerText);
    },

    //自动挂机查询
    // 开启 / 关闭自动查询
    AutoQuerySearch() {

      if (!this.AutoQuery) {

        this.startAutoQuery()
      } else {
        this.stopAutoQuery()
        this.AutoQuery = false                     // 关闭自动查询开关

      }
    },

    // 启动自动查询
    startAutoQuery() {
      // 避免重复开启
      this.stopAutoQuery()
      this.fetchMchSettings(false)

      this.AutoQuery = true
      this.AutoQueryInterval = this.AutoQueryIntervalDefault
      this.isFetching = false // 是否正在请求，用来防止重复触发

      this.AutoTimer = setInterval(async () => {
        if (document.hidden) return

        // 正在请求中 → 暂停倒计时递减
        if (this.isFetching) {
          console.log('正在请求中 → 暂停倒计时递减');
          return
        }
        this.AutoQueryInterval--

        if (this.AutoQueryInterval <= 0) {
          this.isFetching = true
          this.fetchMchSettings(false).then(() => {

            this.isFetching = false

          }).finally(() => {
            // 请求完成 → 重置倒计时
            this.AutoQueryInterval = this.AutoQueryIntervalDefault
            return
          })

        }

      }, 1000)
    },

    // 停止定时器
    stopAutoQuery() {
      // 清除定时器
      if (this.AutoTimer) {
        clearInterval(this.AutoTimer)
        this.AutoTimer = null
      }
      // 重置所有参数
      this.AutoQueryInterval = this.AutoQueryIntervalDefault  // 倒计时恢复默认
    },

    // 页面变为隐藏时暂停
    handleVisibilityChange() {
      if (document.hidden) {
        // 页面变为隐藏 → 暂停定时器
        console.log('页面隐藏 → 暂停定时器');

        this.stopAutoQuery()
      } else {
        console.log('页面恢复 → 重新开启并重置倒计时');

        // 页面恢复 → 重新开启并重置倒计时
        if (this.AutoQuery) {
          this.startAutoQuery()
        }
      }
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
