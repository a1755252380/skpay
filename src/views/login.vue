<template>
  <div class="login" @keyup.enter="handleLogin">
    <div class="login-wrapper">
      <div class="login-card">

        <div class="header">
          <img src="../assets/logo/logo2.png" alt="logo" style="width: 100%;  " />
        </div>

        <div class="form">

          <div class="ipt-box" v-show="codeNeed">
            <input v-model="loginForm.username" required />
            <label>用户名</label>
          </div>

          <div class="ipt-box" v-show="codeNeed">
            <input :type="passwordVisible ? 'text' : 'password'" v-model="loginForm.password" required />
            <label>密码</label>

            <span class="password-toggle" v-show="loginForm.password"
              @click="passwordVisible = !passwordVisible">👁</span>
          </div>

          <div class="ipt-box" v-show="!codeNeed">
            <input v-model="loginForm.captcha_input" required />
            <label>验证码</label>
          </div>

          <div class="options">
            <el-checkbox v-model="loginForm.rememberMe">
              记住密码
            </el-checkbox>
          </div>

          <button class="login-btn" @click="handleLogin" :disabled="loading">
            <span v-if="!loading">登录</span>
            <i v-else class="el-icon-loading"></i>
          </button>

        </div>
      </div>
    </div>

    <div class="footer">
      Copyright © 2023-2025 SKpay.in All Rights Reserved.
    </div>
  </div>
</template>
<script>
import { getCodeImg, getCodeImgID, verifyArea } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: "Login",
  directives: {
    noSpace: {
      update(el, binding, vnode) {
        const input = el.querySelector('input');
        input.value = input.value.replace(/\s+/g, '');
        vnode.context[binding.expression] = input.value;
      }
    }
  },
  data() {
    return {
      // 是否需要验证码
      codeNeed: true,
      passwordVisible: false,
      codeUrl: null,

      loginForm: {
        username: "",
        password: "",
        rememberMe: false,
        captcha_input: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        // captcha_input: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },

      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: false,
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },


  created() {

    this.getCookie();
  },
  mounted() {
    $('#login_div').focusin(function () {
      // 密码框选中
      $('.login-box').addClass('up');
    }).focusout(function () {
      // 密码框非选中
      $('.login-box').removeClass('up');
    })
    // 眼球移动
    $(document).on('mousemove', function (e) {
      let dw = $(document).width() / 10;
      let dh = $(document).height() / 18;
      let x = e.pageX / dw;
      let y = e.pageY / dh;
      $('.eye-ball').css({
        left: x,
        top: y
      })
    })
  },
  methods: {

    getCookie() {
      const username = Cookies.get("SKpay-username");
      const password = Cookies.get("SKpay-password");
      const rememberMe = Cookies.get('SKpay-rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },

    handleLogin() {
      this.loading = true;
      this.$store.dispatch("Login", this.loginForm).then((res) => {
        this.$message.success("登录成功");
        if (process.env.VUE_APP_ENV === 'production') {
          this.$util.startAnimation()
        }
        if (this.loginForm.rememberMe) {
          Cookies.set("SKpay-username", this.loginForm.username, { expires: 30 });
          Cookies.set("SKpay-password", encrypt(this.loginForm.password), { expires: 30 });
          Cookies.set('SKpay-rememberMe', this.loginForm.rememberMe, { expires: 30 });
        } else {
          Cookies.remove("SKpay-username");
          Cookies.remove("SKpay-password");
          Cookies.remove('SKpay-rememberMe');
        }

        this.$router.push({ path: this.redirect || "/" });

      }).catch((res) => {
        if (res == '用户名或密码错误') {
          return
        }
        this.codeNeed = false;

      }).finally(() => {
        this.loading = false;

      })
        ;
      // this.$refs.loginForm.validate(valid => {
      //   if (valid) {

      //   }
      // });
    },
    //验证地区
    checkArea() {
      // 使用 geoip2.js 库获取地理位置信息
      geoip2.city(
        function (response) {
          // 获取 country.names.en 并更新 data 中的 country
          this.checkAreaName = response.country.names.en || '未知国家';

        }.bind(this),
        function (error) {
          console.error('Error fetching GeoIP2 data:', error);
        }
      );
    }
  }
};
</script>


<style lang="scss" scoped>
.form {
  width: 100%;
}

.login {
  width: 100%;
  height: 100vh;
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  background: url("../assets/images/login-background.png") no-repeat center top;
  background-size: cover;
}

/* 遮罩 */
.login::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.6),
      rgba(255, 255, 255, 0.2));
}

.login-wrapper {
  position: relative;
  z-index: 1;
}

/* 卡片 */
.login-card {
  width: 380px;
  padding: 0 40px 40px;
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);

  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  animation: fadeUp 0.6s ease;
}

.header {
  text-align: center;

  h1 {
    color: #1dc797;
    font-size: 28px;
  }

  p {
    color: #666;
  }
}

/* 输入 */
.ipt-box {
  position: relative;
  margin-bottom: 28px;
}

.ipt-box input {
  width: 100%;
  height: 42px;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  outline: none;
}

.ipt-box label {
  position: absolute;
  left: 0;
  top: 10px;
  color: #999;
  transition: 0.3s;
}

.ipt-box input:focus,
.ipt-box input:valid {
  border-color: #1dc797;
}

.ipt-box input:focus~label,
.ipt-box input:valid~label {
  top: -10px;
  font-size: 12px;
  color: #1dc797;
}

.password-toggle {
  position: absolute;
  right: 0;
  top: 10px;
  cursor: pointer;
}

.options {
  margin-bottom: 20px;
}

/* 按钮 */
.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1dc797, #18a87d);
  color: #fff;
  cursor: pointer;
  transition: 0.3s;

}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(29, 199, 151, 0.4);
}

/* 动画 */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer {
  position: absolute;
  bottom: 10px;
  width: 100%;
  text-align: center;
  color: #ddd;
  font-size: 12px;
}
</style>
