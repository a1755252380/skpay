<template>
  <div class="login" @keyup.enter="handleLogin">
    <div class="container">
      <div class="panda">
        <div class="ear left"></div>
        <div class="ear right"></div>
        <div class="face">
          <div class="eye-shadow left"></div>
          <div class="eye-white left">
            <div class="eye-ball"></div>
          </div>
          <div class="eye-shadow right"></div>
          <div class="eye-white right">
            <div class="eye-ball"></div>
          </div>
          <div class="nose"></div>
          <div class="mouth"></div>
        </div>
        <div class="body"></div>
        <div class="foot left">
          <div class="sole"></div>
        </div>
        <div class="foot right">
          <div class="sole"></div>
        </div>
      </div>
      <div class="login-box" id="login_div">
        <div class="hand left"></div>
        <div class="hand right"></div>
        <h1>Buddy后台管理系统</h1>
        <div class="input_div">
          <div class="input_box">
            <div class="ipt-box" v-show="codeNeed">
              <input type="text" required v-model="loginForm.username">
              <label>用户名</label>
            </div>



            <div class="ipt-box" v-show="codeNeed">
              <input :type="passwordVisible ? 'text' : 'password'" id="password" v-model="loginForm.password" required>
              <label>密码</label>
              <!-- 切换密码显示状态的图标 -->
              <span @click="passwordVisible = !passwordVisible" class="password-toggle" v-show="loginForm.password">
                <i :class="passwordVisible ? 'el-icon-view' : 'el-icon-view'"></i>
              </span>
            </div>

            <div class="ipt-box code_input" v-show="!codeNeed">
              <input v-model="loginForm.captcha_input" required>
              <label>验证码</label>

              <!-- 验证码图片 -->
            </div>
          </div>
          <div class="login_btn">
            <el-checkbox v-model="loginForm.rememberMe" style="margin:10px auto">记住密码</el-checkbox>
            <button @click="handleLogin" :disabled="loading"> <template v-if="!loading">登
                录</template>
              <template v-else><i class="el-icon-loading"></i></template></button>
          </div>
        </div>


      </div>
    </div>



    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2023-2025 Buddy.in All Rights Reserved.</span>
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
      const username = Cookies.get("Buddy-username");
      const password = Cookies.get("Buddy-password");
      const rememberMe = Cookies.get('Buddy-rememberMe')
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
          Cookies.set("Buddy-username", this.loginForm.username, { expires: 30 });
          Cookies.set("Buddy-password", encrypt(this.loginForm.password), { expires: 30 });
          Cookies.set('Buddy-rememberMe', this.loginForm.rememberMe, { expires: 30 });
        } else {
          Cookies.remove("Buddy-username");
          Cookies.remove("Buddy-password");
          Cookies.remove('Buddy-rememberMe');
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

<style rel="stylesheet/scss" lang="scss">
.input_div {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 0 25px 0;
  justify-content: space-between;
  width: 65%;
  align-items: center;

  .input_box {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .login_btn {
    display: flex;
    flex-direction: column;
  }
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.png");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
  font-family: 'Rubik Mono One', "Noto Sans SC" !important;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
}
</style>
<style lang="scss" scoped>
::v-deep .el-card {
  border-radius: 16px;
  box-shadow: 0px 1px 14px 0px rgba(0, 0, 0, 0.1)
}

.code_input {
  display: flex;
  align-items: center;
}

.login {
  /* 100%窗口高度 */
  height: 100vh;
  /* 弹性布局 水平+垂直居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 渐变背景 */
  background: linear-gradient(200deg, #37e2b2, #2fa080);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login {
  .password-toggle {
    position: absolute;
    right: 0;
    top: 7px;
    cursor: pointer;
  }

  /* 开始画熊猫 */
  .panda {
    /* 相对定位 */
    position: relative;
    width: 200px;
  }

  /* 脸部 */
  .face {
    width: 200px;
    height: 200px;
    background-color: #fff;
    border-radius: 100%;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1;
  }

  /* 耳朵 */
  .ear {
    width: 70px;
    height: 70px;
    background-color: #000;
    border-radius: 100%;
    position: absolute;
    top: -10px;
  }

  .ear.right {
    right: 0;
  }

  /* 黑眼圈 */
  .eye-shadow {
    width: 50px;
    height: 80px;
    background-color: #000;
    border-radius: 50%;
    /* 绝对定位 */
    position: absolute;
    top: 40px;
  }

  .eye-shadow.left {
    transform: rotate(45deg);
    left: 30px;
  }

  .eye-shadow.right {
    transform: rotate(-45deg);
    right: 30px;
  }

  /* 眼白 */
  .eye-white {
    width: 30px;
    height: 30px;
    background-color: #fff;
    border-radius: 100%;
    position: absolute;
    top: 68px;
  }

  .eye-white.left {
    left: 38px;
  }

  .eye-white.right {
    right: 38px;
  }

  /* 眼球 */
  .eye-ball {
    width: 20px;
    height: 20px;
    background-color: #000;
    border-radius: 100%;
    position: absolute;
    left: 5px;
    top: 5px;
  }

  /* 鼻子 */
  .nose {
    width: 35px;
    height: 20px;
    background-color: #000;
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    bottom: 65px;
    border-radius: 42px 42px 60px 60px / 30px 30px 60px 60px;
  }

  /* 嘴巴 */
  .mouth {
    width: 68px;
    height: 25px;
    border-bottom: 7px solid #000;
    border-radius: 50%;
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    bottom: 35px;
  }

  /* 身体 */
  .body {
    width: 250px;
    height: 345px;

    background-color: #fff;
    position: relative;
    left: -25px;
    top: -60px;
    border-radius: 100px 100px 100px 100px / 126px 126px 96px 96px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
  }

  /* 脚 */
  .foot {
    width: 82px;
    height: 120px;
    background-color: #000;
    position: absolute;
    bottom: 10px;
    z-index: 3;
    border-radius: 40px 40px 35px 40px / 26px 26px 63px 63px;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
  }

  .foot.left {
    left: -80px;
  }

  .foot.right {
    right: -80px;
    transform: rotateY(180deg);
  }

  /* 脚掌-大椭圆 */
  .foot::after {
    content: "";
    width: 55px;
    height: 65px;
    background-color: #222;
    position: absolute;
    border-radius: 50%;
    left: 0;
    right: 0;
    margin: auto;
    bottom: 10px;
  }

  /* 脚掌-三个小椭圆 */
  .foot .sole,
  .foot .sole::before,
  .foot .sole::after {
    width: 20px;
    height: 30px;
    background-color: #222;
    position: absolute;
    border-radius: 50%;
    left: 0;
    right: 0;
    margin: auto;
    top: 8px;
  }

  .foot .sole::before {
    content: "";
    left: -50px;
  }

  .foot .sole::after {
    content: "";
    left: 25px;
  }

  /* 手 */
  .hand,
  .hand::before,
  .hand::after {
    width: 40px;
    height: 30px;
    background-color: #000;
    border-radius: 50px;
    position: absolute;
    top: 70px;
    left: -20px;
  }

  .hand::before {
    content: "";
    top: 16px;
    left: 0;
  }

  .hand::after {
    content: "";
    top: 32px;
    left: 0;
  }

  .hand.right {
    right: -20px;
    left: auto;
  }

  /* 登录框 */
  .login-box {
    width: 400px;
    height: 325px;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -110px);
    z-index: 2;
    /* 弹性布局 居中 垂直排列 */
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    /* 设置过渡 */
    transition: 0.3s;
  }

  h1 {
    color: #1dc797;
    font-weight: normal;
    margin-bottom: 5px;
  }

  .ipt-box {
    width: 100%;
    margin-top: 25px;
    position: relative;
  }

  .ipt-box input {
    width: 100%;
    height: 35px;
    border: none;
    border-bottom: 1px solid #bbb;
    text-indent: 5px;
    outline: none;
    transition: 0.3s;
  }

  .ipt-box label {
    position: absolute;
    left: 5px;
    top: 5px;
    font-size: 14px;
    color: #888;
    transition: 0.3s;
    pointer-events: none;
  }

  /* 输入框选中或有值时输入框的样式 */
  .ipt-box input:focus,
  .ipt-box input:valid {
    border-color: #1dc797;
    box-shadow: 0 1px #1dc797;
  }

  /* 输入框选中或有值时label的样式 */
  .ipt-box input:focus~label,
  .ipt-box input:valid~label {
    color: #1dc797;
    font-size: 12px;
    transform: translateY(-15px);
  }

  button {
    width: 150px;
    height: 40px;
    background-color: #1dc797;
    border: none;
    border-radius: 3px;
    // margin-top: 10px;
    color: #fff;
    letter-spacing: 10px;
    text-indent: 10px;
    cursor: pointer;
    transition: 0.3s;
  }

  button:hover {
    letter-spacing: 25px;
    text-indent: 25px;
    background-color: #2fa080;
  }

  /* 登录框向上举 */
  .up {
    transform: translate(-50%, -130px);
  }

}
</style>
