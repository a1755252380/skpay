<template>
  <div class="loading_div" v-show="visible" id="loading_div_show" ref="loading_div_show">

    <p id="offscreen-text" class="offscreen-text"></p>
    <p id="text" class="text"></p>
    <svg id="svg"></svg>
    <input type="text" class="input" id="input" style="display: none" />

  </div>
</template>

<script>
import { start } from './start.js';
import { throttle } from '@/utils/util';
export default {
  name: 'WorkspaceJsonIndex',

  data() {
    return {
      visible: true,
      resizeObserver: null
    };
  },

  mounted() {
    this.$nextTick(() => {
      // this.resizeObserver = new ResizeObserver(throttle(() => {
      //   start()
      // }, 150));
      // this.resizeObserver.observe(this.$refs.loading_div_show);
    })
  },
  beforeDestroy() {
    // if (this.resizeObserver) {
    //   this.resizeObserver.unobserve(this.$refs.loading_div_show);
    //   this.resizeObserver.disconnect();
    // }
  },

  methods: {
    open() {
      start();
    }
  },
};
</script>
<style lang="scss" scoped>
.loading_div {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;

  width: 100%;
  height: 100%;
  z-index: 999999;

}

.loading_div_show {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
</style>
