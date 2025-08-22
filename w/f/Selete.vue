<!-- eslint-disable vue/no-v-html -->
<template>
  <q-select
    ref="inputRef"
    v-scroll="onScroll"
    :model-value="computedValue"
    v-bind="{ ...styleClassAttrs, ...fieldStyleProps }"
    :class="fieldClass"
    :popup-content-class="computedPopupContentClass"
    :label="undefined"
    :error="invalid"
    :options="normalizedOptions"
    :option-value="optionValue"
    :option-label="optionLabel"
    :multiple="multiple"
    :emit-value="emitValue"
    :map-options="emitValue"
    :use-input="computedUseInput"
    :fill-input="fillInput ?? computedUseInput"
    :hide-selected="hideSelected ?? computedUseInput"
    :input-debounce="inputDebounce"
    :disable="disable"
    :readonly="readonly"
    :prefix="prefix"
    :suffix="suffix"
    :color="color"
    :bg-color="bgColor"
    :autofocus="autofocus"
    :placeholder="computedUseInput ? $t(placeholder) : undefined"
    :tabindex="tabindex"
    :clearable="clearable"
    no-error-icon
    :dropdown-icon="dropdownIcon"
    :hide-dropdown-icon="hideDropdownIcon"
    :behavior="computedBehavior"
    :transition-show="undefined"
    :transition-hide="undefined"
    :transition-duration="100"
    :display-value-html="displayValueHtml"
    :options-html="optionsHtml"
    clear-icon="clear"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @clear="$emit('clear', $event)"
    @keydown="onKeyDown"
    @input-value="$emit('inputValue', $event)"
    @filter="onFilter"
    @update:model-value="onUpdateValue"
    @popup-show="onPopup(true)"
    @popup-hide="onPopup(false)">
    <!-- no-option (override slots) -->
    <template
      v-if="useInput || $slots['no-option']"
      #no-option="slotProps">
      <slot
        v-if="$slots['no-option']"
        name="no-option"
        v-bind="slotProps" />
      <q-item v-else>
        <q-item-section class="text-italic text-grey">
          {{ $t('sdl.common.message.noResult') }}
          <!-- No Result found -->
        </q-item-section>
      </q-item>
    </template>

    <!-- selected (override slots) -->
    <template
      v-if="selectedText || placeholder"
      #selected>
      <span
        key="selectedSlot"
        :class="{ 'nsp-select__placeholder': !selectedText && !!placeholder }"
        >{{ selectedText || placeholder }}
        <q-tooltip
          anchor="bottom left"
          self="top left"
          :offset="[0, 0]"
          show-when-ellipsised
          class="ellipsis_tooltip shrinked_tooltip">
          {{ selectedText || placeholder }}
        </q-tooltip>
      </span>
    </template>

    <!--before-options -->
    <template
      v-if="multiple"
      #before-options>
      <!-- <div
        v-if="!behavior"
        class="q-select-options__header">
        <h1>{{ placeholder }}</h1>
        <q-icon
          name="close_24"
          @click="inputRef.hidePopup()" />
      </div> -->
      <div
        v-if="multiple"
        class="nsp-select-options__select-all">
        <q-item
          clickable
          @click="toggleAll">
          <q-item-section class="nsp-select-options__side">
            <q-checkbox
              :model-value="selectedAll"
              :true-value="true"
              :false-value="false"
              dense
              @update:model-value="toggleAll" />
          </q-item-section>
          <q-item-section>
            <q-item-label :class="selectedAll ? 'text-weight-bold q-fc--black1' : ''">
              {{ $t('MSG_5_728') }}
              <!-- All -->
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>

    <!-- options -->
    <template #option="{ itemProps, selected, opt, toggleOption }">
      <q-item
        :active="selected"
        v-bind="{ ...itemProps, onClick: () => toggleOption(opt, multiple) }">
        <q-item-section
          v-if="multiple"
          class="nsp-select-options__side">
          <q-checkbox
            :model-value="selected"
            dense
            :true-value="true"
            :false-value="false"
            @update:model-value="toggleOption(opt, multiple)" />
        </q-item-section>
        <q-item-section>
          <q-item-label :class="selected ? 'text-weight-bold q-fc--black1' : ''">
            <div
              v-if="optionsHtml"
              v-html="sanitize(opt[optionHtmlLabel])"></div>
            <template v-if="!optionsHtml">{{ opt[optionLabel] }}</template>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-separator v-if="opt[optionSeparator]" />
    </template>
    <!-- after-options -->
    <template
      v-if="multiple && confirmBtnShow"
      #after-options>
      <div>
        <!-- Confirm -->
        <q-btn
          class="btn-fill sm"
          :label="$t('C00010')"
          @click="onConfirm" />
      </div>
    </template>

    <!-- error -->
    <template
      v-if="invalid"
      #error>
      {{ invalidMessage }}
      <q-tooltip
        anchor="center middle"
        :offset="[0, 3]"
        show-when-ellipsised>
        {{ invalidMessage }}
      </q-tooltip>
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
          <q-tooltip
            :model-value="true"
            :no-parent-event="false"
            :offset="[0, 3]">
            <!-- eslint-disable vue/no-v-html -->
            <slot name="hint">
              <div v-html="sanitize(hint)" />
            </slot>
            <!-- eslint-enable vue/no-v-html -->
          </q-tooltip>
        </q-icon>
      </nsp-click-outside>
    </template>

    <template
      v-if="clearable || $slots.append"
      #append>
      <!-- NspInput clear 아이콘을 NspInput 내부에 직접 구현하면서 추가. 230902 -->
      <nsp-icon
        v-if="clearable"
        :tabindex="-1"
        name="clear"
        class="clear-icon"
        size="16px"
        clickable
        @click.stop.prevent="onClearInput" />
      <slot name="append" />
    </template>
  </q-select>
</template>

<script>
import { cloneDeep, isEmpty } from 'lodash-es';
import useInheritAttrs from '../../composables/private/useInheritAttrs';
import useField, { useFieldProps } from '../../composables/private/useField';
import useFieldStyle, { useFieldStyleProps } from '../../composables/private/useFieldStyle';
import useOptions, { useOptionsProps, firstOptionLabels } from '../../composables/private/useOptions';
import { sanitize } from '../../../../plugins/sanitize';
import { SDLUtil } from '@/utils';

export default {
  name: 'NspSelect',
  inheritAttrs: false,

  props: {
    ...useFieldProps,
    ...useFieldStyleProps,
    ...useOptionsProps,

    modelValue: { type: [String, Number, Array, Object], default: undefined },

    // fall through props
    multiple: { type: Boolean, default: false },
    emitValue: { type: Boolean, default: true },
    useInput: { type: Boolean, default: false },
    fillInput: { type: Boolean, default: undefined },
    hideSelected: { type: Boolean, default: undefined },
    inputDebounce: { type: [Number, String], default: 100 },
    dropdownIcon: { type: String, default: 'arrow_down' },
    hideDropdownIcon: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
    clearable: { type: Boolean, default: false },
    color: { type: String, default: undefined },
    bgColor: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    placeholder: {
      type: String,
      default: () => {
        return SDLUtil.getMsgProp('S00003'); /* Select */
      },
    },
    tabindex: { type: [Number, String], default: undefined },
    onFilter: { type: Function, default: undefined },
    behavior: { type: String, default: undefined },
    transitionDuration: { type: Number, default: 300 },
    displayValueHtml: { type: Boolean, default: false },
    optionsHtml: { type: Boolean, default: false },
    confirmBtnShow: { type: Boolean, default: true }, //multi select 일때 confirm 버튼 보이지 않게 하기 위해 옵션 추가 - 2025.03.27. EY박서진
  },

  emits: ['update:modelValue', 'focus', 'blur', 'clear', 'keydown', 'inputValue'],

  setup(props, { emit }) {
    const fieldCtx = useField();
    const { inputRef, value, showingHint, toggleHint } = fieldCtx;

    const innerValue = ref();
    const computedValue = computed(() => innerValue.value ?? value.value ?? '');

    const qSelectDialog = document.getElementsByClassName('q-select__dialog');

    function onUpdateValue(val) {
      val ??= props.multiple ? [] : '';

      innerValue.value = val;
      value.value = val;
    }

    const optionsCtx = useOptions({
      valueRef: computedValue,
      onUpdateValue,
      emitValue: props.emitValue,
      value: props.optionValue,
      label: props.optionLabel,
      separator: props.optionSeparator,
    });

    const { normalizedOptions } = optionsCtx;

    function getOptionIndex(val) {
      return normalizedOptions.value.findIndex(v => v[props.optionValue] === val);
    }

    function getOption(val) {
      const index = getOptionIndex(val);
      if (index > -1) return normalizedOptions.value[index];
    }

    function getOptionLabel(v) {
      return getOption(v)?.[props.optionLabel] ?? firstOptionLabels[props.firstOption];
    }

    function isOptionSelected() {
      if (Array.isArray(value.value)) {
        return value.value.length > 0;
      }

      return getOptionIndex(props.emitValue ? value.value : value.value?.[props.optionValue]) > -1;
    }

    function updateInputValue(val, noFilter) {
      inputRef.value.updateInputValue(val, noFilter);
    }

    const computedUseInput = computed(() => props.useInput && !props.multiple);

    const computedBehavior = computed(() => {
      if (props.behavior) return props.behavior;
      return undefined;
    });

    const computedPopupContentClass = computed(() => {
      return 'q-select-options';
    });

    const selectedText = computed(() => {
      if (computedUseInput.value) return null;

      if (props.multiple) {
        /* Multi Select 일 경우, 초기값을 배열로 지정 */
        if (value.value === '') {
          value.value = [];
        }
        return value.value.map(v => getOptionLabel(v?.[props.optionValue] || v)).join(',');
      }
      return getOptionLabel((value.value?.[props.optionValue] || value.value) ?? '');
    });

    function onPopup(show) {
      innerValue.value = show ? cloneDeep(value.value) : undefined;
      if (!props?.options || props?.options?.length <= 0) {
        inputRef.value.hidePopup();
      }
    }

    function onConfirm() {
      value.value = innerValue.value;
      inputRef.value.hidePopup();
    }

    function handlePan({ evt, ...newInfo }) {
      const info = newInfo;
      const height = `${info.position.top}px`;
      qSelectDialog[0].style.top = height;
      if (info.isFinal) {
        qSelectDialog[0].style.top = null;
      } else if (info.distance.y >= 100) {
        inputRef.value.hidePopup();
      }
    }

    function onScroll() {
      inputRef.value.hidePopup();
    }

    function onClearInput() {
      //onUpdateValue('');
      // 2025.03.27. EY박서진
      //multi select 일때 select option list popup에서 체크박스 체크하고 clearable x 버튼 클릭하고 다시 체크박스 체크할때 에러발생
      // ''-> 공백으로 초기화 하면 multi일때 array tpye이 없어져서 다시 체크한 값 push가 안되서 에러 발생
      onUpdateValue();
    }

    /**
     * 입력값에 따라 한건인 경우, 그 값을 설정.
     * @param val
     */
    function onInputValue(val) {
      // emit('inputValue', val);

      console.log(`onInputValue [${computedUseInput.value}] val [${val}]`);

      if (computedUseInput.value && val) {
        const options = cloneDeep(
          normalizedOptions.value.filter(m => {
            if (m[props.optionLabel].toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
          }),
        );
        if (options?.length === 1) {
          onUpdateValue(options[0][props.optionValue]);
        }
      }
      emit('inputValue', val);
    }

    /*
     * Enter 를 입력할 경우, 하나만 있는 option일 경우 자동 선택
     */
    function onKeyDown(e) {
      if (e.keyCode === 13) {
        const val = e.currentTarget._value; // 현재 검색을 시도한 Text
        const options = cloneDeep(
          normalizedOptions.value.filter(m => {
            if ((m[props.optionLabel] || '').toLowerCase().indexOf(val?.toLowerCase()) > -1) {
              return true;
            }
          }),
        );
        if (options?.length === 1 && normalizedOptions.value.filter(m => !isEmpty(m.codeId)).length === 1) {
          onUpdateValue(options[0][props.optionValue]);

          inputRef.value.setOptionIndex(0);
          inputRef.value.moveOptionSelection(1, true);
          // inputRef.value.toggleOption(inputRef.value.options[0], true);
          inputRef.value.toggleOption(options[0], true);
        }
      }
      emit('keydown', e);
    }

    return {
      ...useInheritAttrs(),
      ...useFieldStyle(),
      ...fieldCtx,
      ...optionsCtx,
      computedValue,
      getOptionIndex,
      getOption,
      getOptionLabel,
      isOptionSelected,
      updateInputValue,
      onUpdateValue,
      onPopup,
      onConfirm,
      onClearInput,
      computedUseInput,
      computedBehavior,
      computedPopupContentClass,
      selectedText,
      showingHint,
      toggleHint,
      handlePan,
      sanitize,
      onScroll,
      onInputValue,
      onKeyDown,
    };
  },
};
</script>
