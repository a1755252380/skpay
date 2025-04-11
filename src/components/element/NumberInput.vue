<template>
  <el-input v-bind="$attrs" :value="stringValue" @input="handleInput" @blur="handleBlur" clearable />
</template>

<script>
export default {
  name: 'NumericInput',
  props: {
    value: {
      type: [Number, null],
      default: null,
    },
  },
  computed: {
    stringValue() {
      return this.value !== null && this.value !== undefined ? String(this.value) : ''
    },
  },
  methods: {
    handleInput(val) {
      const num = Number(val)
      // 输入为空时仍然传 null
      const result = val === '' ? null : (isNaN(num) ? this.value : num)
      this.$emit('input', result)
    },
    handleBlur() {
      this.$emit('blur')
    }
  },
}
</script>
