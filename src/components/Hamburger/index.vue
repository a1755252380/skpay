<template>
  <div style="padding: 0 15px;" @click="toggleClick">
    <!-- <svg :class="{ 'is-active': isActive }" class="hamburger" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
      width="64" height="64">
      <path
        d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z" />
    </svg> -->
    <!-- menuFour -->
    <div :class="'menuFour ' + (isActive ? 'clickMenuFour' : '')">
      <span :style="{ 'background-color': $store.state.settings.theme }" v-for="i in 3" :key="i"></span>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Hamburger',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    }
  }
}
</script>

<style scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}



/* menuFour */
.menuFour {
  width: 24px;
  height: 20px;
  margin: 0;
  position: relative;
  cursor: pointer;
  display: inline-block;

}

.menuFour span {
  background-color: #000;
  position: absolute;
  border-radius: 2px;
  transition: .3s cubic-bezier(.8, .5, .2, 1.4);
}

.menuFour span:nth-child(1) {
  width: 100%;
  height: 4px;
  display: block;
  top: 0px;
  left: 0px;
}

.menuFour span:nth-child(2) {
  width: 100%;
  height: 4px;
  display: block;
  top: 8px;
  left: 0px;
}

.menuFour span:nth-child(3) {
  width: 100%;
  height: 4px;
  display: block;
  bottom: 0px;
  left: 0px;
}

.menuFour:not(.clickMenuFour):hover span:nth-child(1) {
  width: 100%;
  height: 4px;
  display: block;
  top: -2px;
  left: 0px;
  transition: .3s cubic-bezier(.8, .5, .2, 1.4);
}

.menuFour:not(.clickMenuFour):hover span:nth-child(2) {
  width: 100%;
  height: 4px;
  display: block;
  top: 8px;
  left: 0px;
  transition: .4s cubic-bezier(.8, .5, .2, 1.4);
}

.menuFour:not(.clickMenuFour):hover span:nth-child(3) {
  width: 100%;
  height: 4px;
  display: block;
  bottom: -2px;
  left: 0px;
  transition: .3s cubic-bezier(.8, .5, .2, 1.4);
}

.clickMenuFour {
  transform: rotate(90deg);
}

.clickMenuFour span:nth-child(1) {
  left: 4px;
  top: 13px;
  width: 20px;
  transition: .3s cubic-bezier(.8, .5, .2, 1.4);
  transform: rotate(90deg);
  transition-delay: 150ms;
}

.clickMenuFour span:nth-child(2) {
  left: 2px;
  top: 18px;
  width: 15px;
  transition: .3s cubic-bezier(.8, .5, .2, 1.4);
  transform: rotate(45deg);
  transition-delay: 50ms;
}

.clickMenuFour span:nth-child(3) {
  left: 11px;
  top: 18px;
  width: 15px;
  transition: .3s cubic-bezier(.8, .5, .2, 1.4);
  transform: rotate(-45deg);
  transition-delay: 100ms;
}
</style>
