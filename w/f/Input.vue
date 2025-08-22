<template>
  <q-input
    ref="inputRef"
    :model-value="value"
    v-bind="{ ...styleClassAttrs, ...fieldStyleProps }"
    class="nsp-field nsp-input"
    :class="fieldClass"
    :label="undefined"
    :error="invalid"
    :type="type"
    :debounce="debounce"
    :disable="disable"
    :readonly="readonly"
    :rows="rows"
    :cols="cols"
    :autogrow="autogrow"
    :mask="computedMask"
    :fill-mask="fillMask"
    :reverse-fill-mask="computedReverseFillMask"
    :unmasked-value="computedUnmaskedValue"
    :prefix="prefix"
    :suffix="suffix"
    :color="color"
    :bg-color="bgColor"
    :autofocus="autofocus"
    :placeholder="$t(placeholder)"
    :tabindex="tabindex"
    :min="min"
    :max="max"
    :step="step"
    :input-class="computedInputClass"
    :input-style="inputStyle"
    :maxlength="computedMaxLength"
    :autocomplete="autocomplete"
    no-error-icon
    @focus="onFocus"
    @blur="onBlurInput"
    @keydown="onKeydownInput"
    @keyup="onKeyupInput"
    @change="onChangeInput"
    @update:model-value="onUpdateValue">
    <!-- default -->
    <template
      v-if="$slots.default"
      #default>
      <slot />
    </template>

    <!-- prepend -->
    <template
      v-if="$slots.prepend"
      #prepend>
      <slot name="prepend" />
    </template>

    <!-- append -->
    <template
      v-if="icon || (type !== 'textarea' && clearable) || $slots.append"
      #append>
      <!-- NspInput clear 아이콘을 NspInput 내부에 직접 구현하면서 추가. 230902 -->
      <nsp-icon
        v-if="type !== 'textarea' && clearable"
        :tabindex="-1"
        name="clear"
        class="clear-icon"
        size="16px"
        clickable
        @click="() => onClearInput(value)" />
      <nsp-icon
        v-if="icon"
        :tabindex="-1"
        :name="icon"
        :disable="disable || disableIcon"
        clickable
        class="click-icon"
        @click="onClickIcon?.()" />
      <slot name="append" />
    </template>

    <!-- before -->
    <template
      v-if="$slots.before"
      #before>
      <slot name="before" />
    </template>

    <!-- after -->
    <template
      v-if="$slots.after"
      #after>
      <slot name="after" />
    </template>

    <!-- counter -->
    <template
      v-if="inputCounter"
      #counter>
      <span class="input-group-text">
        (<strong>{{ inputCounter }}</strong
        ><span>/</span>{{ maxCounter }}Byte )
      </span>
    </template>

    <!-- error -->
    <template
      v-if="invalid"
      #error>
      {{ invalidMessage }}
      <nsp-tooltip
        anchor="center middle"
        :offset="[0, 3]"
        show-when-ellipsised>
        {{ invalidMessage }}
      </nsp-tooltip>
    </template>

    <!-- label -->
    <template
      v-if="label || $slots.label"
      #label>
      <span>{{ label ?? label }}</span>
      <nsp-click-outside @click-outside="showingHint = false">
        <q-icon
          v-if="hint"
          size="16px"
          name="info"
          class="ml4"
          style="vertical-align: -3px"
          @click.capture.stop.prevent="toggleHint">
          <nsp-tooltip
            v-model="showingHint"
            :offset="[0, 3]"
            :no-parent-event="false">
            <!-- eslint-disable vue/no-v-html -->
            <slot name="hint">
              <div v-html="sanitize(hint)" />
            </slot>
            <!-- eslint-enable vue/no-v-html -->
          </nsp-tooltip>
        </q-icon>
      </nsp-click-outside>
    </template>
  </q-input>
</template>

<script>
import { isEmpty } from 'lodash-es';
import useInheritAttrs from '../../composables/private/useInheritAttrs';
import useField, { useFieldProps } from '../../composables/private/useField';
import useFieldStyle, { useFieldStyleProps } from '../../composables/private/useFieldStyle';
import { StringUtil } from '@/utils';
import { preventSubmitEnter, stopAndPrevent } from '../../../../utils/private/event';
import { sanitize } from '../../../../plugins/sanitize';

const NAMED_REGEX = {
  alpha: /^[A-Z]*$/i,
  alpha_dash: /^[0-9A-Z_-]*$/i,
  alpha_dot_dash: /^[0-9A-Z._-]*$/i,
  alpha_num: /^[0-9A-Z]*$/i,
  alpha_spaces: /^[A-Z\s]*$/i,
  alpha_underscore: /^[0-9A-Z_]*$/i,
  alpha_hangul: /^[A-Z가-힣ㄱ-ㅎ]*$/i,
  alpha_num_hangul: /^[0-9A-Z가-힣ㄱ-ㅎ]*$/i,
  hangul: /^[가-힣ㄱ-ㅎ]*$/i,
  num: /^[0-9]*$/i,
};

export default {
  name: 'NspInput',
  inheritAttrs: false,

  props: {
    ...useFieldProps,
    ...useFieldStyleProps,

    modelValue: { type: [String, Number], default: undefined },

    // fall through props
    type: { type: String, default: 'text' },
    debounce: { type: [Number, String], default: undefined },
    disable: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    autogrow: { type: Boolean, default: false },
    rows: { type: [Number, String], default: undefined },
    cols: { type: [Number, String], default: undefined },
    mask: { type: String, default: undefined },
    fillMask: { type: [Boolean, String], default: false },
    reverseFillMask: { type: Boolean, default: false },
    unmaskedValue: { type: Boolean, default: undefined },
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
    clearable: { type: Boolean, default: true },
    color: { type: String, default: undefined },
    bgColor: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    tabindex: { type: [Number, String], default: undefined },
    min: { type: [Number, String], default: undefined },
    max: { type: [Number, String], default: undefined },
    step: { type: [Number, String], default: undefined },
    onFocus: { type: Function, default: undefined },
    onBlur: { type: Function, default: undefined },
    onClear: { type: Function, default: undefined },
    onKeydown: { type: Function, default: undefined },
    onKeyup: { type: Function, default: undefined },
    align: { type: String, default: undefined },
    inputClass: { type: [Array, String, Object], default: undefined },
    inputStyle: { type: [Array, String, Object], default: undefined },

    // customize props
    icon: { type: String, default: undefined },
    disableIcon: { type: Boolean, default: false },
    maxlength: { type: [Number, String], default: undefined },
    counter: { type: Boolean, default: false },
    upperCase: { type: Boolean, default: false },
    lowerCase: { type: Boolean, default: false },
    regex: { type: [String, Object], default: undefined, validator: v => v instanceof RegExp || !!NAMED_REGEX[v] },
    spinner: { type: Boolean, default: undefined },
    onClickIcon: { type: Function, default: undefined },
    onKeydownNoClick: { type: Boolean, default: false },
    // when use mask props, keydown event not fired.
    // so use this to block form submit
    preventSubmit: { type: Boolean, default: false },
    telNo0: { type: [String, Number], default: '' },
    telNo1: { type: [String, Number], default: '' },
    telNo2: { type: [String, Number], default: '' },
    autocomplete: { type: String, default: '' },
    clearValue: { type: String, default: '' },
    noBlank: { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'update:telNo0', 'update:telNo1', 'update:telNo2'],

  setup(props, { emit }) {
    const fieldCtx = useField({
      onChangeValue: () => {},
    });
    const { inputRef, value, showingHint, toggleHint } = fieldCtx;

    const computedInputClass = computed(() => {
      const classes = {
        'q-no-input-spinner': !props.spinner,
      };
      if (props.align) {
        classes[`text-${props.align}`] = true;
      }
      if (props.inputClass) {
        return [props.inputClass, classes];
      }
      return classes;
    });

    const hasComma = ref(0);
    const hasHyphen = ref(0);
    const computedMaxLength = computed(() => {
      if (props.maxlength === undefined) return undefined;
      if (props.maxlength && (props.mask === 'number' || props.mask?.indexOf(',') > -1)) return Number(props.maxlength) + Number(hasComma.value);
      if (props.maxlength && (props.mask === 'telephone' || props.mask?.indexOf('-') > -1)) return Number(props.maxlength) + Number(hasHyphen.value);
      return props.maxlength;
    });

    const inputCounter = computed(() => {
      if (props.counter === true && props.maxlength > 0) {
        // TODO 마스킹 있을때, unmaskedValue = false인 상황에서 unmaskedValue 를 구할 수 있어야 함.
        let currentByte;
        if (hasComma.value > 0) currentByte = StringUtil.getByte(value.value ?? '');
        else if (hasHyphen.value > 0) currentByte = StringUtil.getByte(value.value ?? '') - hasHyphen.value;
        else currentByte = StringUtil.getByte(value.value ?? '');
        // console.log(`currentByte [${currentByte}] maxlength[${props.maxlength}]`);
        return `${StringUtil.getNumberWithComma(currentByte)}`;
      }
    });
    const maxCounter = computed(() => {
      return `${StringUtil.getNumberWithComma(props.maxlength)}`;
    });

    const computedMask = computed(() => {
      const newVal = inputRef?.value?.modelValue;
      if (props.mask === 'telephone') {
        if (newVal?.startsWith('02')) {
          if (!props.unmaskedValue) {
            if (newVal?.length <= 11) return '##-###-#####';
            return '##-####-####';
          }
          if (newVal?.length <= 9) return '##-###-#####';
          return '##-####-####';
        }

        if (newVal?.startsWith('0504') || newVal?.startsWith('0505')) {
          if (newVal?.length <= 13) return '####-###-#####';
          return '####-####-####';
        }

        if (newVal?.length <= 9) return '####-#######';

        if (!props.unmaskedValue) {
          if (newVal?.length <= 12) return '###-###-#####';
          return '###-####-####';
        }
        if (newVal?.length <= 10) return '###-###-#####';
        return '###-####-####';
      }

      if (props.mask === 'number') {
        return '###,###,###,###,###,###,###,###';
      }

      return props.mask;
    });

    watch(
      computedMask,
      (newVal, oldVal) => {
        if (oldVal !== newVal) {
          // 마스킹 변경?
          setTimeout(() => {
            const { nativeEl } = inputRef.value;
            const { _value } = nativeEl;
            nativeEl.selectionStart = _value.length;
            nativeEl.selectionEnd = _value.length;
          });
        }
      },
      { deep: true },
    );

    const computedReverseFillMask = computed(() => {
      if (props.reverseFillMask) return props.reverseFillMask;
      if (props.mask === 'number') return true;
      return false;
    });

    const computedUnmaskedValue = computed(() => {
      if (props.unmaskedValue !== undefined) return props.unmaskedValue;
      if (props.mask === 'telephone') return false;
      return true;
    });

    function onKeydownInput(e) {
      // enter
      if (e.keyCode === 13) {
        if (props.onKeydownNoClick) {
          stopAndPrevent(e);
        } else {
          const disabled = props.disable || props.disableIcon;

          if (!disabled && props.icon && !props.onKeydownNoClick) {
            stopAndPrevent(e);
            props.onClickIcon?.();
          }
        }
      }
      props.onKeydown?.(e);
    }

    function onKeyupInput(e) {
      props.onKeyup?.(e);
    }

    // 출하검사 결함 조치로 인한 강제 Trim 적용
    // const isModifiersTrim = useAttrs().modelModifiers?.trim === true;
    const isModifiersTrim = true;
    const isModifiersNumber = useAttrs().modelModifiers?.number === true;

    const clearValue = computed(() => (props.clearValue ? props.clearValue : props.type === 'number' && isModifiersNumber ? null : ''));

    function onChangeInput(val) {
      if (isModifiersTrim && props.mask !== 'number') {
        // 출하검사 결함 조치로 인한 강제 Trim 적용
        // value.value = props.modelValue;
        value.value = props.modelValue.trim();
      }

      //noBlank 인 경우는 clearValue 로 초기화 시켜준다.
      if (props.noBlank && props.clearValue && !val) {
        console.log('noBlank !! change clearValue');
        const el = inputRef.value.getNativeElement();
        value.value = props.clearValue;
        el.value = props.clearValue;
      }
      props.onChange?.(val);
    }

    const regex = computed(() => {
      const v = props.regex;
      return v && (v instanceof RegExp ? v : NAMED_REGEX[v]);
    });

    const min = computed(() => (props.min === undefined ? -Infinity : parseInt(props.min, 10)));
    const max = computed(() => (props.max === undefined ? Infinity : parseInt(props.max, 10)));

    function onUpdateNumberValue(val) {
      val ||= clearValue.value;

      if (val) {
        // min, max
        // update 할 때마다 min, max값을 비교해주면 입력 중일때도 값이 자동비교가 되기 때문에 주석처리.
        // ex. min이 100일때, 999를 입력하는 도중에 100이 되어버림
        // val = Math.min(Math.max(val, min.value), max.value).toString();

        // maxlength
        if (props.maxlength) {
          val = StringUtil.getMaxByteString(val, props.maxlength);
        }
      }

      const el = inputRef.value.getNativeElement();

      el.value = val;
      value.value = val;
    }

    // @NOSONAR_BEGIN
    function onUpdateTextValue(val) {
      val ||= clearValue.value;
      if (val) {
        // regex
        if (regex.value?.test(val) === false) {
          val = value.value;
        }

        //mask 가 number인데 01 등의 말도안되는 데이터 정제
        if (props.mask === 'number') {
          if (val.length > 1 && val.startsWith('0')) {
            val = val.slice(1);
          }
        }

        // maxlength
        if (props.maxlength) {
          if (props.mask === 'number' || (props.mask && props.mask.indexOf(',') > -1)) {
            const share = Math.floor(val.length / 3);
            const remainder = val.length % 3;
            hasComma.value = remainder === 0 ? share - 1 : share;
            val = StringUtil.getMaxByteString(val, props.maxlength + hasComma.value);
          } else if (props.mask === 'telephone' || (props.mask && props.mask.indexOf('-') > -1)) {
            hasHyphen.value = val.split('-').length - 1;
            val = StringUtil.getMaxByteString(val, props.maxlength + hasHyphen.value);
          } else val = StringUtil.getMaxByteString(val, props.maxlength);
        }

        // convert case
        if (props.upperCase) {
          val = val.toUpperCase();
        } else if (props.lowerCase) {
          val = val.toLowerCase();
        }
      } else {
        hasComma.value = 0;
        hasHyphen.value = 0;
      }

      const el = inputRef.value.getNativeElement();

      el.value = val;
      value.value = val;
      if (props.mask === 'telephone') {
        const telephoneNumber = val.split('-');
        if (computedMask.value === '####-#######') {
          emit('update:telNo0', telephoneNumber[0]);
          emit('update:telNo1', undefined);
          emit('update:telNo2', telephoneNumber[1]);
        } else {
          emit('update:telNo0', telephoneNumber[0]);
          emit('update:telNo1', telephoneNumber[1]);
          emit('update:telNo2', telephoneNumber[2]);
        }
      }
    }

    // @NOSONAR_END

    function onUpdateValue(val) {
      switch (props.type) {
        case 'number':
          return onUpdateNumberValue(val);
        default:
          return onUpdateTextValue(val);
      }
    }

    function onClearInput(val) {
      props.onClear?.(val);
      props.onChange?.(clearValue.value);
      onUpdateValue(clearValue.value);
    }

    onMounted(() => {
      if (props.preventSubmit) {
        const el = inputRef.value.getNativeElement();
        preventSubmitEnter(el);
      }

      if (props.mask === 'telephone' && !props.modelValue) {
        if (!(isEmpty(props.telNo0) && isEmpty(props.telNo1) && isEmpty(props.telNo2))) {
          const val = [props.telNo0, props.telNo1, props.telNo2].join('-');
          onUpdateTextValue(val);
        }
      }
    });

    function select() {
      inputRef.value.select();
    }

    function onBlurInput() {
      props.onBlur?.();
      if (props.type === 'number') {
        value.value = Math.min(Math.max(value.value, min.value), max.value).toString();
      }

      const el = inputRef.value.getNativeElement();
      //noBlank 인 경우는 clearValue 로 초기화 시켜준다.
      if (props.noBlank && props.clearValue && !el.value) {
        setTimeout(() => {
          el.value = props.clearValue;
        }, 50);
        el.value = props.clearValue;
      }
    }

    return {
      ...useInheritAttrs(),
      ...useFieldStyle(),
      ...fieldCtx,
      computedInputClass,
      inputCounter,
      maxCounter,
      select,
      onKeydownInput,
      onKeyupInput,
      onClearInput,
      onChangeInput,
      onUpdateValue,
      showingHint,
      toggleHint,
      computedMask,
      computedReverseFillMask,
      sanitize,
      computedUnmaskedValue,
      onBlurInput,
      computedMaxLength,
    };
  },
};
</script>
