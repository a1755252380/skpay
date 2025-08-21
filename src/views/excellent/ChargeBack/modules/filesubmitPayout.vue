<template>
  <!-- 上传xlsx文件 -->
  <el-dialog title="上传xlsx文件" :visible.sync="value" :width="uploadShow ? '600px' : '70%'" append-to-body
    :close-on-click-modal="false">
    <!-- 上传文件demo -->
    <div class="submitShow" v-show="uploadShow">
      <el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/" :show-file-list="false"
        :before-upload="beforeUpload" accept=".xlsx, .xls">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传xlsx/xls文件</div>
      </el-upload>
    </div>

    <!-- 文件解析结果 -->

    <div v-show="!uploadShow">
      <el-table :data="fileData" border style="width: 100%" v-loading="fileLoading" :height="'50rem'"
        :row-class-name="tableRowClassName">
        v-table-move="['FilesubmitPayoutTable']" ref="FilesubmitPayoutTable">
        <el-table-column v-for="(item, index) in fileCoulmn" :key="index" :prop="item.name" align="center"
          :label="item.title" :formatter="item.formatter"></el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="reUpload">取 消</el-button>
      <el-button @click="downloadExcelTemplate(fileCoulmn)" type="primary">下载模板</el-button>
      <el-button type="primary" :disabled="uploadShow || fileData.length == 0" @click="submitData">提 交</el-button>
    </template>
  </el-dialog>
</template>

<script>
import * as XLSX from 'xlsx';
import { AddPayOutOrder } from '@/api/excellent/OrderRecords'
import { TableAmount2 } from '@/utils/Formatter';
export default {
  name: 'WorkspaceJsonFilesubmitPayout',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'value',
    event: 'update:value'

  },
  data() {
    return {
      uploadShow: true,
      fileLoading: false,
      fileData: [],
      fileCoulmn: [
        { name: 'mch_number', title: '商户号', },
        { name: 'amount', title: '金额', formatter: TableAmount2 },
        { name: 'bene_address', title: '受益人地址' },
        { name: 'bene_bank_acct', title: '受益人银行卡号' },
        { name: 'bene_email', title: '受益人邮箱' },
        { name: 'bene_ifsc', title: '受益人银行代号' },
        { name: 'bene_name', title: '受益人名字' },
        { name: 'bene_phone', title: '受益人手机号' },
        // { name: 'merchant_order_id', title: '订单号' },
        { name: 'pan', title: 'pan' },
      ],
    };
  },

  mounted() {

  },

  methods: {

    //上传文件处理
    beforeUpload(file) {
      this.uploadShow = false
      this.fileLoading = true
      const reader = new FileReader();
      let that = this;

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        that.AnalyzeFileContent(jsonData).then(res => {
          // 你可以在这里进行后续处理，比如保存到 data、发送请求等
          that.$message.success('解析成功');
          that.fileData = res
          that.fileLoading = false
        })
      };

      reader.readAsArrayBuffer(file);

      // 阻止 el-upload 自动上传
      return false;
    },
    //提交数据
    submitData() {
      const submit = JSON.parse(JSON.stringify(this.fileData))
      const submitData = submit.map(item => {

        if (item['pan']) {
          item['pan'] = item['pan'].toString()
        } else {
          delete item.pan
        }
        item['bene_phone'] = item['bene_phone'].toString()
        item['bene_ifsc'] = item['bene_ifsc'].toString()
        item['bene_email'] = item['bene_email'].toString()
        item['bene_name'] = item['bene_name'].toString()
        item['bene_bank_acct'] = item['bene_bank_acct'].toString()
        item['bene_address'] = item['bene_address'].toString()
        item['amount'] = item['amount'] * 100
        item['merchant_order_id'] = this.$store.state.user.name + Math.floor(10000000 + Math.random() * 90000000)
        return item
      }).filter(item => item.mch_number == '888888' || item.mch_number == '999999')
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      const len = submitData.length
      AddPayOutOrder(submitData).then(res => {
        if (!res.results) {
          this.$message.success(`成功新增代付订单 ${len} 条`)
          return

        }
        const errorList = res.results.filter(item => item.code === 1)

        const errorText = errorList.map(item => {
          return `订单号：${item.merchant_order_id}，错误信息：${item.msg}`
        })
        this.$message.success(`成功新增代付订单${res.count - errorList.length}条`)

        if (errorList.length > 0) {
          this.$notify.error({
            title: '错误提示',
            dangerouslyUseHTMLString: true,
            message: `<div style='max-height: 400px;overflow-y: auto'>上传失败：${len - res.count}条<br/>${errorText.join('<br/>')}</div>`,
            duration: 10000
          })
        }

      }).catch(err => {
        this.$message.error('新增代付订单失败')
      }
      ).finally(() => {
        this.uploadShow = true
        this.fileData = []
        this.$emit('CancelUpload')
        loading.close()

      })

    },
    //读取xlsx文件内容并提取所用信息
    async AnalyzeFileContent(raw) {

      // 只提取你需要的字段
      const usefulData = await raw.map(row => {
        const item = {};
        this.fileCoulmn.forEach(col => {
          item[col.name] = row[col.name] ?? ''; // 根据 Excel 中列头进行提取
        });
        return item;
      });

      return usefulData
    },
    //重新上传
    reUpload() {
      if (this.uploadShow) {
        this.$emit('CancelUpload')
        return
      }
      this.uploadShow = true
      this.fileData = []
    },
    downloadExcelTemplate(fileColumns, filename = 'template.xlsx') {
      // 生成一行空数据，表头用 `name`
      const headerRow = {};
      fileColumns.forEach(col => {
        headerRow[col.name] = '';
      });

      const worksheet = XLSX.utils.json_to_sheet([headerRow], { skipHeader: false });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, filename);
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.mch_number != '888888' && row.mch_number != '999999') {
        return 'warning-row';
      }
    }
  },
};
</script>
<style lang="scss" scoped>
::v-deep .warning-row {
  background: #fad0d0 !important;
}

.el-upload__tip {
  text-align: center;
  font-weight: normal;
  font-size: 0.8rem;
  color: #666666;

}

.submitShow {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;

}
</style>