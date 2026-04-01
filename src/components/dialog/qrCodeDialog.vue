<template>
  <el-dialog :visible="dialogShow" title="绑定二维码" width="400px" :before-close="handleClose" center :show-close="false"
    :close-on-click-modal="false">
    <div style="text-align: center">
      <span>请下载<a class="download" href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
          target="_blank">Microsoft
          Authenticator</a>(点击可下载)扫码</span>
      <div @click="getQrCode" class="qrCode" style="width: 300px; height: 300px; margin: 12px auto ;cursor: pointer;"
        v-loading="loading">
        <el-image :src="qrCode" :fit="'fill'" style="width: 280px; height: 288px;"></el-image>
      </div>
      <!-- <div style="padding-bottom: 6px;">密文：{{ passwordBase32 }} <i class="el-icon-document-copy"
          style="cursor: pointer;" title="复制密文" @click="$util.copyToClipboard(passwordBase32)"></i></div> -->

      <el-input v-model="captcha_input" placeholder="请输入TOTP验证码" class="w100_input"></el-input>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="VerifyQrCode" :disabled="captcha_input == ''">验 证</el-button>
    </div>
  </el-dialog>
</template>

<script>
import QRCode from 'qrcode';
import Cookies from 'js-cookie';
import { verifyTotp } from '@/api/login';
export default {
  name: 'WorkspaceJsonQrCodeDialog',

  data() {
    return {
      qrCode: '',
      captcha_input: '',
      loading: false,
      num: 0
    };
  },

  mounted() {
  },
  computed: {
    dialogShow: {
      set(value) {

        this.$store.commit('SET_isShowBindQrCode', value)
      },
      get() {

        return this.$store.state.user.isShowBindQrCode
      }
    },
    totpSecret() {
      return this.$store.state.user.totp
    },
    passwordBase32() {
      // return 'ZuCnyWiHnm6hNi9"'
      return this.$store.state.user.passwordBase32
    }
  },
  watch: {
    dialogShow: {
      handler(newVal) {
        if (newVal) {
          this.getQrCode()
        } else {
          this.num = 0
          this.captcha_input = ''
        }
      },
      immediate: true
    }
  },

  methods: {
    close() {

      if (Cookies.get("totp") == 0) {
        this.dialogShow = false
        return
      }
      this.$confirm('不进行验证操作将无法使用网站?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch("LogOut").then(() => {
          Cookies.remove("totp")
          this.$router.push({ path: this.redirect || "/" });
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    VerifyQrCode() {
      if (this.captcha_input == '') {
        return this.$message.error("请输入TOTP验证码！")
      }
      verifyTotp({
        username: this.$store.state.user.name,
        secret: this.passwordBase32,
        captcha_input: this.captcha_input

      }).then(res => {
        this.$message.success("验证成功！")
        Cookies.set("totp", 0);
        this.dialogShow = false
      })
    },

    handleClose() {
      this.captcha_input = ""
      this.dialogShow = false
    },
    getQrCode() {

      this.loading = true
      // Base32 编码
      const serviceName = "sk-pay";
      const accountName = "www.sk-pay.in";
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(
        serviceName
      )}:${encodeURIComponent(
        accountName
      )}?secret=${this.passwordBase32}&issuer=${encodeURIComponent(serviceName)}`;
      console.log("otpauthUrl", otpauthUrl);
      QRCode.toDataURL(otpauthUrl)
        .then(url => {
          console.log('QR Code generated successfully:', url);

          this.qrCode = url;
          setTimeout(() => {
            this.loading = false

          }, 500);
        })
        .catch(err => {
          console.error('QR Code generation failed:', err);
        });

      // 设置 SVG 大小
      // qrcode.toString(
      //   otpauthUrl,
      //   { type: "svg", width: 200 },
      //   function (error, svg) {
      //     if (error) {
      //       console.error("QR Code generation failed:", error);
      //     } else {
      //       this.qrCode = svg;
      //     }
      //   }
      // );
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  border-radius: 16px;
}

.download {
  color: cornflowerblue;
}
</style>
