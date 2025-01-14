<template>
  <el-dialog :visible="dialogShow" title="绑定二维码" width="350px" :before-close="handleClose" center :show-close="false"
    :close-on-click-modal="false">
    <div style="text-align: center">
      <span>请下载<a class="download" href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
          target="_blank">Microsoft
          Authenticator</a>扫码</span>
      <div @click="getQrCode" class="qrCode" style="width: 300px; height: 300px; margin: 0 auto;cursor: pointer;">
        <el-image :src="qrCode" :fit="'fill'" @click="getQrCode" style="width: 300px; height: 300px;"></el-image>
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
      return this.$store.state.user.passwordBase32
    }
  },
  watch: {
    dialogShow: {
      handler(newVal) {
        if (newVal) {
          console.log(newVal);

          this.getQrCode()
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
        this.$store.dispatch("LogOut")
        Cookies.remove("totp")
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

      // Base32 编码
      const serviceName = "2-buddy";
      const accountName = "www.2-buddy.in";
      console.log(this.passwordBase32);
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(
        serviceName
      )}:${encodeURIComponent(
        accountName
      )}?secret=${this.passwordBase32}&issuer=${encodeURIComponent(serviceName)}`;

      QRCode.toDataURL(otpauthUrl)
        .then(url => {
          this.qrCode = url;
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
