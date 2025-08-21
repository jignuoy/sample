<template>
  <q-btn
    ref="btnRef"
    v-bind="{ ...styleClassAttrs, ...buttonStyleProps }"
    :class="buttonClass"
    :style="buttonStyles"
    no-caps
    unelevated
    rectangle
    :ripple="false"
    :type="type"
    :label="label ? $t(label) : ''"
    :icon="icon"
    :icon-right="iconRight"
    :tabindex="tabindex"
    :align="align"
    :stack="stack"
    :disable="disabled"
    :no-wrap="noWrap"
    :to="to"
    :replace="replace"
    :href="href"
    :target="target"
    :loading="loading"
    :percentage="percentage"
    :dark-percentage="darkPercentage"
    :title="title ? title : ''"
    @click="onClick">
    <slot />
  </q-btn>
</template>

<script>
import useInheritAttrs from '../../composables/private/useInheritAttrs';
import useBtnStyle, { useBtnStyleProps } from '../../composables/private/useBtnStyle';
import { SDLUtil } from '@/utils';
import { getCurrentInstance } from 'vue';

export default {
  name: 'NspBtn',
  inheritAttrs: false,
  props: {
    // customize props
    ...useBtnStyleProps,

    // fall through props
    type: { type: String, default: 'button' },
    label: { type: [Number, String], default: undefined },
    icon: { type: String, default: undefined },
    iconRight: { type: String, default: undefined },
    tabindex: { type: [Number, String], default: undefined },
    disable: { type: Boolean, default: false },
    to: { type: String, default: undefined },
    replace: { type: Boolean, default: undefined },
    href: { type: String, default: undefined },
    target: { type: String, default: undefined },
    userLevel: { type: Boolean, default: false },
    title: { type: String, default: undefined },

    // about innerClasses
    align: { type: String, default: 'center' },
    stack: { type: Boolean, default: false },
    noWrap: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    percentage: { type: Number, default: undefined },
    darkPercentage: { type: Boolean, default: false },

    // events
    onClick: { type: Function, default: undefined },
  },
  setup(props) {
    const btnRef = ref();
    const hasPermission = ref(true);

    function click(evt) {
      btnRef.value.click(evt);
    }

    const { styleClassAttrs } = useInheritAttrs();
    /* 사용자 정보 */
    const user = SDLUtil.getLoginedUserInfo();
    /* 사용자Level에 따른 컴퍼넌트 Diable 처리 */
    const disabled = computed(() => {
      return props.disable ? props.disable : props.userLevel && user.userLevel > 40;
    });

    return {
      ...useBtnStyle(),
      styleClassAttrs,
      hasPermission,
      btnRef,
      click,
      disabled,
    };
  },
};
</script>
