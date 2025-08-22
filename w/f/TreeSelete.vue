<template>
  <q-select
    ref="treeSelectRef"
    :class="fieldClass"
    class="nsp-select"
    v-scroll="onScroll"
    v-model="model"
    v-bind="{ ...styleClassAttrs, ...fieldStyleProps }"
    :options="options"
    :transition-duration="100">
    <!-- selected (override slots) -->
    <template #selected>
      <span key="selectedSlot">{{ placeholder }}</span>
    </template>
    <!-- option (override slots) -->
    <template #option="scope">
      <q-tree
        class="nsp-select-tree-option"
        :nodes="[scope.opt]"
        :node-key="nodeKey"
        :label-key="labelKey"
        :children-key="childrenKey"
        v-model:ticked="model"
        v-model:selected="selected"
        default-expand-all
        :tick-strategy="tickStrategy" />
    </template>
  </q-select>
</template>
<script setup>
import { SDLUtil } from '@/utils';
import useStretch from '@/components/common/composables/private/useStretch.js';
import { useFieldProps } from '@/components/common/composables/private/useField.js';
import useFieldStyle, { useFieldStyleProps } from '@/components/common/composables/private/useFieldStyle.js';
import { useOptionsProps } from '@/components/common/composables/private/useOptions.js';
import useInheritAttrs from '@/components/common/composables/private/useInheritAttrs.js';

const props = defineProps({
  ...useFieldProps,
  ...useFieldStyleProps,
  ...useOptionsProps,
  nodeKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' },
  childrenKey: { type: String, default: 'children' },
  tickStrategy: { type: String, default: 'leaf' },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: () => {
      return SDLUtil.getMsgProp('S00003'); /* Select */
    },
  },
});
const required = computed(() => {
  if (props.required === true) {
    return true;
  }
  if (props.rules) {
    if (typeof props.rules === 'string') {
      return props.rules.includes('required');
    }
    if (Array.isArray(props.rules)) {
      return props.rules.includes('required');
    }
    if (typeof props.rules === 'object') {
      return !!props.rules.required;
    }
  }
});
const { stretchClass } = useStretch({});
const fieldClass = computed(() => ({
  'nsp-field': true,
  'nsp-field--required': required.value,
  ...stretchClass.value,
}));
const { styleClassAttrs, inheritedAttrs } = useInheritAttrs();
const { fieldStyleProps } = useFieldStyle();

// v-Model Define
const model = defineModel(Array);

const treeSelectRef = ref(null);
const selected = ref({});

function onScroll() {
  treeSelectRef.value.hidePopup();
}
</script>
