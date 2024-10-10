<template>
  <div id="app">
    <router-view />
    <theme-picker />
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";
export default {
  name: "App",
  components: {
    ThemePicker,
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
          if (process.env.VUE_APP_ENV === 'production') {
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
