<template>
  <div id="app">

    <router-view />
    <theme-picker v-show="false" />
    <!-- 弹窗绑定二维码 -->
    <qrCodeDialogVue></qrCodeDialogVue>
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";
import qrCodeDialogVue from './components/dialog/qrCodeDialog.vue';
import { verifyArea } from "@/api/login";
export default {
  name: "App",
  components: {
    ThemePicker, qrCodeDialogVue
  },
  data() {
    return {
      mainloading: true
    }
  },
  beforeCreate() {
  },
  created() {
    // this.verify()
  },
  metaInfo() {
    return {
      title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
      titleTemplate: title => {
        return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
      }
    }
  },
  mounted() {

    this.$nextTick(() => {
      let that = this

      document.onreadystatechange = function () {

        if (document.readyState === "complete") {
          if (process.env.VUE_APP_SHOW_LOADING) {
            that.$util.startAnimation()
          }
        }
      };



    })
  },
  methods: {
    verify() {
      // 在页面加载时读取sessionStorage里的状态信息
      verifyArea().then((res) => {
      }).catch(() => {
        this.$router.push({ path: "/4040" });

        return
      })
    }
  }
};
</script>


<style scoped lang="scss">
#app .theme-picker {
  display: none;
}

#app {
  position: relative;
}
</style>
