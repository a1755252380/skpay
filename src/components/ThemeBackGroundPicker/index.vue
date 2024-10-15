<template>
  <div class="color-settings">

    <!-- 字体颜色选择器 -->
    <el-color-picker v-model="backgroundColor" :predefine="[
      '#000000', '#FFFFFF', '#FF0000', '#00FF00',
      '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
    ]" class="font-color-picker" popper-class="font-color-picker-dropdown" placeholder="选择字体颜色" />


  </div>
</template>

<script>
// 引入 Element UI 的版本号，用于构建主题 CSS 的 URL
const version = require('element-ui/package.json').version

// 定义默认主题颜色
const ORIGINAL_THEME = '#ffffff'

export default {
  data() {
    return {
      chalk: '',
      backgroundColor: '#000000', // 当前选中的字体颜色，默认黑色
    }
  },
  computed: {

    defaultFontColor() {
      return this.$store.state.settings.backgroundColor
    },

  },
  watch: {

    // 监听默认字体颜色的变化，并更新当前字体颜色
    defaultFontColor: {
      handler: function (val) {
        this.backgroundColor = val
      },
      immediate: true
    },


    // 监听字体颜色的变化，调用 setFontColor 方法更新字体颜色
    async backgroundColor(val) {
      await this.setFontColor(val)
    },

  },
  created() {

    // 同时应用默认字体颜色和背景颜色
    if (this.defaultFontColor) {
      this.setFontColor(this.defaultFontColor)
    }

  },

  methods: {


    /**
     * 设置字体颜色
     * @param {string} val - 选中的字体颜色
     */
    async setFontColor(val) {
      // 获取旧的主题颜色，如果没有旧的主题，则使用默认主题颜色
      const oldVal = this.chalk ? this.backgroundColor : '#ffffff'

      // 如果传入的值不是字符串，则不进行处理
      if (typeof val !== 'string') return

      // 获取新旧主题颜色的色彩集群
      const themeCluster = this.getThemeCluster(val.replace('#', ''))
      const originalCluster = this.getThemeCluster(oldVal.replace('#', ''))
      // 如果 chalk 尚未加载，则通过 URL 获取主题 CSS 字符串
      // 如果 chalk 尚未加载，则通过 URL 获取主题 CSS 字符串
      if (!this.chalk) {
        const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
        await this.getCSSString(url, 'chalk')
      }

      /**
       * 创建一个处理器，用于更新特定变量的样式
       * @param {string} variable - CSS 内容变量
       * @param {string} id - 样式标签的 ID
       */
      const getHandler = (variable, id) => {
        return () => {
          // 获取原始主题的色彩集群
          const originalCluster = this.getThemeCluster(this.backgroundColor.replace('#', ''))

          // 更新样式内容，将旧颜色替换为新颜色
          const newStyle = this.updateStyle(this[variable], originalCluster, themeCluster)

          // 查找是否已有对应的样式标签
          let styleTag = document.getElementById(id)
          if (!styleTag) {
            // 如果没有，则创建一个新的样式标签
            styleTag = document.createElement('style')
            styleTag.setAttribute('id', id)
            document.head.appendChild(styleTag)
          }
          // 设置样式标签的内容为新的样式
          styleTag.innerText = newStyle
        }
      }

      // 获取 chalk 样式处理器，并执行它
      const chalkHandler = getHandler('chalk', 'chalk-style')
      chalkHandler()

      // 查找所有 style 标签中包含旧主题颜色的样式，排除包含 "Chalk Variables" 的样式
      const styles = [].slice.call(document.querySelectorAll('style'))
        .filter(style => {
          const text = style.innerText
          return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
        })

      // 遍历这些样式标签，更新其中的颜色
      styles.forEach(style => {
        const { innerText } = style
        if (typeof innerText !== 'string') return
        style.innerText = this.updateStyle(innerText, originalCluster, themeCluster)
      })




      this.$store.dispatch('settings/changeSetting', {
        key: 'backgroundColor',
        value: val
      })
      this.backgroundColor = val;
    },


    /**
     * 更新样式内容，将旧颜色替换为新颜色
     * @param {string} style - 原始样式内容
     * @param {Array} oldCluster - 旧的色彩集群
     * @param {Array} newCluster - 新的色彩集群
     * @returns {string} - 更新后的样式内容
     */
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style

      oldCluster.forEach((color, index) => {
        // 构造一个正则表达式，只匹配 color 属性的值
        const colorRegex = new RegExp(`(background-color\\s*:\\s*)${color}(\\s*;?)`, 'ig');

        // 进行替换，只替换 color 属性的值
        newStyle = newStyle.replace(colorRegex, `$1${newCluster[index]}$2`);
      });
      return newStyle
    },


    /**
     * 生成主题色的色彩集群，包括不同亮度和饱和度的颜色
     * @param {string} theme - 基础主题颜色（不包含 #）
     * @returns {Array} - 色彩集群数组
     */
    getThemeCluster(theme) {
      /**
       * 根据色调生成不同亮度的颜色
       * @param {string} color - 基础颜色（不包含 #）
       * @param {number} tint - 亮度系数（0-1）
       * @returns {string} - 生成的颜色（包含 #）
       */
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) { // 当主题颜色在其 RGB 空间中时
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255 - red))
          green += Math.round(tint * (255 - green))
          blue += Math.round(tint * (255 - blue))

          red = red.toString(16).padStart(2, '0')
          green = green.toString(16).padStart(2, '0')
          blue = blue.toString(16).padStart(2, '0')

          return `#${red}${green}${blue}`
        }
      }

      /**
       * 根据色调生成不同深度的颜色
       * @param {string} color - 基础颜色（不包含 #）
       * @param {number} shade - 深度系数（0-1）
       * @returns {string} - 生成的颜色（包含 #）
       */
      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1 - shade) * red)
        green = Math.round((1 - shade) * green)
        blue = Math.round((1 - shade) * blue)

        red = red.toString(16).padStart(2, '0')
        green = green.toString(16).padStart(2, '0')
        blue = blue.toString(16).padStart(2, '0')

        return `#${red}${green}${blue}`
      }

      // 初始化色彩集群，包含基础主题颜色
      const clusters = [theme]
      // 生成不同亮度的颜色
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      // 添加稍微加深的颜色
      clusters.push(shadeColor(theme, 0.1))
      return clusters
    },
    /**
 * 获取所有样式表中的 `color` 属性值
 */
    getAllColorProperties(colorList) {
      const colors = new Set(); // 使用 Set 避免重复

      // 遍历所有样式表
      for (const styleSheet of document.styleSheets) {
        let rules;
        try {
          rules = styleSheet.cssRules;
        } catch (e) {
          // 跨域样式表会抛出安全错误，跳过
          console.warn(`无法访问样式表: ${styleSheet.href}`, e);
          continue;
        }

        if (!rules) continue;

        // 遍历所有规则
        for (const rule of rules) {
          if (rule.type === CSSRule.STYLE_RULE) {
            const style = rule.style;
            if (style.color) {
              colors.add(style.color);
            }
          }
        }
      }

      // 遍历所有元素的内联样式
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const color = element.style.color;
        if (color) {
          for (let i = 0; i < colorList.length; i++) {
            if (color == colorList[i]) {
              colors.add(color);

            }

          }
        }

      });

      return Array.from(colors);
    },
    /**
    * 获取指定 URL 的 CSS 字符串，并存储到指定变量中
    * @param {string} url - CSS 文件的 URL
    * @param {string} variable - 存储 CSS 内容的变量名
    * @returns {Promise} - Promise 对象
    */
    getCSSString(url, variable) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            // 移除 @font-face 相关的内容，避免字体加载问题
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
            resolve()
          }
        }
        xhr.open('GET', url)
        xhr.send()
      })
    },


  }
}
</script>

<style>
/* 容器样式，确保颜色选择器垂直排列并有适当间距 */
.color-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 提升主题相关元素的 z-index，确保其在最上层显示 */
.theme-message,
.theme-picker-dropdown,
.font-color-picker-dropdown,
.background-color-picker-dropdown {
  z-index: 99999 !important;
}

/* 自定义主题颜色选择器的触发器样式 */
.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

/* 自定义字体颜色选择器的触发器样式 */
.font-color-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

/* 自定义背景颜色选择器的触发器样式 */
.background-color-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

/* 隐藏颜色选择器下拉中的链接按钮 */
.theme-picker-dropdown .el-color-dropdown__link-btn,
.font-color-picker-dropdown .el-color-dropdown__link-btn,
.background-color-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
