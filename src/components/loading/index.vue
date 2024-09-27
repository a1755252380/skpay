<template>
  <div class="loading_div" id="loader-wrapper">
    <p id="offscreen-text" class="offscreen-text"></p>
    <p id="text" class="text"></p>
    <svg id="svg"></svg>
    <input type="text" class="input" id="input" style="display: none" />
  </div>
</template>

<script>
export default {
  name: 'WorkspaceJsonIndex',

  data() {
    return {

    };
  },

  mounted() {

  },

  methods: {

  },
};
</script>
<style lang="scss" scoped>
.loading_div {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
}
</style>
