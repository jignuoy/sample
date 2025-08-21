<template>
  <div :class="setFormClass">
    <input
      class="form-check-input"
      type="checkbox"
      :id="id"
      :value="value"
      :disabled="disabled"
      v-model="checked"
      @change="updateCheckValue" />
    <label
      :class="labelClass"
      :for="id"
      ><slot></slot
    ></label>
  </div>
</template>

<script>
import { uniqueId } from 'lodash';

export default {
  props: {
    inline: Boolean,
    modelValue: [String, Object],
    value: String,
    disabled: Boolean,
    labelClass: { type: String, default: 'form-check-label' },
  },
  data() {
    return {
      formClass: 'form-check',
      id: uniqueId('sdl-check-box'),
      checked: '',
      checkList: [],
    };
  },
  emits: ['update:modelValue'],
  computed: {
    setFormClass: function () {
      if (this.inline) return this.formClass + ' form-check-inline';
      return this.formClass;
    },
  },
  methods: {
    updateCheckValue: function (event) {
      if ('object' === typeof this.modelValue) {
        this.checkList = this.modelValue;
        if (this.checked) {
          this.checkList.push(event.target.value);
        } else {
          this.checkList.splice(this.checkList.indexOf(event.target.value), 1);
        }
        this.$emit('update:modelValue', this.checkList);
      } else {
        this.$emit('update:modelValue', this.checked ? event.target.value : '');
      }
    },
    syncValue() {
      if ('object' === typeof this.modelValue) {
        if (this.modelValue.includes(this.value)) this.checked = true;
        else this.checked = false;
      } else {
        if (this.modelValue === this.value) this.checked = true;
        else this.checked = false;
      }
    },
  },
  watch: {
    modelValue() {
      this.syncValue();
    },
  },
  mounted() {
    this.syncValue();
  },
};
</script>
