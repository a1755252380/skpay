<template>
  <div>
    <button @click="changeTheme('theme-light')">Light Theme</button>
    <button @click="changeTheme('theme-dark')">Dark Theme</button>
    <div>
      <h1>主题切换示例</h1>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    changeTheme(theme) {

      const link = document.getElementById('theme-style');
      console.log(`theme/${theme}.css`);

      if (link) {
        link.href = `theme/${theme}.css`
      } else {
        const newLink = document.createElement('link');
        newLink.id = 'theme-style';
        newLink.rel = 'stylesheet';
        newLink.href = `theme/${theme}.css`;
        document.head.appendChild(newLink);
      }

      // 保存用户选择的主题到 localStorage
    }
  },
  mounted() {

  }
};
</script>
