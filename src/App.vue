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
  }
};
</script>


<style scoped>
#app .theme-picker {
  display: none;
}

#app {
  position: relative;
}
</style>
<style lang="scss">
// @font-face {
//   font-family: 'Noto Sans SC';
//   src: url('assets/fonts/NotoSansCJKsc-Regular.otf') format('truetype');
//   font-weight: normal;
//   font-style: normal;
// }</style>
