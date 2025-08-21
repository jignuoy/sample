<template>
  <slot />
</template>

<script>
import { addClickOutside, removeClickOutside } from '../../../../utils/private/clickOutside';

export default {
  name: 'NspClickOutside',

  props: {
    targets: {
      type: Array,
      default: () => [],
      validator: v => v.every(e => typeof e === 'string' || e instanceof Element),
    },
    onClickOutside: {
      type: Function,
      default: undefined,
    },
  },

  setup(props) {
    const { proxy } = getCurrentInstance();
    const innerRefs = computed(() => {
      if (props.targets.length) {
        return props.targets.map(e => (typeof e === 'string' ? document.querySelector(e) : e));
      }

      return [proxy.$el?.nextElementSibling];
    });

    const clickOutsideProps = {
      innerRefs,
      onClickOutside(evt) {
        props.onClickOutside(evt);
      },
    };

    watch(
      () => props.onClickOutside,
      val => {
        removeClickOutside(clickOutsideProps);

        if (val) {
          addClickOutside(clickOutsideProps);
        }
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      removeClickOutside(clickOutsideProps);
    });

    return {
      innerRefs,
    };
  },
};
</script>
