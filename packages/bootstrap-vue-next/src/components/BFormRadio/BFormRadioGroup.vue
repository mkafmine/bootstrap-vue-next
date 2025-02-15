<template>
  <div
    v-bind="computedAttrs"
    :id="computedId"
    ref="element"
    role="radiogroup"
    :class="computedClasses"
    class="bv-no-focus-ring"
    tabindex="-1"
  >
    <slot name="first" />
    <b-form-radio v-for="item in normalizeOptions" :key="item.self" v-bind="item.props">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-if="item.html" v-html="item.html" />
      <span v-else v-text="item.text" />
    </b-form-radio>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type {AriaInvalid, Booleanish, ButtonVariant, Size} from '../../types'
import {computed, provide, ref, toRef, watchEffect} from 'vue'
import {radioGroupKey} from '../../utils'
import BFormRadio from './BFormRadio.vue'
import {getGroupAttr, getGroupClasses, useBooleanish, useId} from '../../composables'
import {useFocus, useVModel} from '@vueuse/core'

interface BFormRadioGroupProps {
  size?: Size
  form?: string
  id?: string
  name?: string
  modelValue?: string | boolean | unknown[] | Record<string, unknown> | number
  ariaInvalid?: AriaInvalid
  autofocus?: Booleanish
  buttonVariant?: ButtonVariant
  buttons?: Booleanish
  disabled?: Booleanish
  disabledField?: string
  htmlField?: string
  options?: (string | Record<string, unknown>)[]
  plain?: Booleanish
  required?: Booleanish
  stacked?: Booleanish
  state?: Booleanish
  textField?: string
  validated?: Booleanish
  valueField?: string
}

const props = withDefaults(defineProps<BFormRadioGroupProps>(), {
  modelValue: '',
  autofocus: false,
  buttonVariant: 'secondary',
  buttons: false,
  ariaInvalid: undefined,
  state: undefined,
  disabled: false,
  disabledField: 'disabled',
  htmlField: 'html',
  options: () => [],
  plain: false,
  required: false,
  stacked: false,
  textField: 'text',
  validated: false,
  valueField: 'value',
})

interface BFormRadioGroupEmits {
  (e: 'input', value: BFormRadioGroupProps['modelValue']): void
  (e: 'update:modelValue', value: BFormRadioGroupProps['modelValue']): void
  (e: 'change', value: BFormRadioGroupProps['modelValue']): void
}

const emit = defineEmits<BFormRadioGroupEmits>()

const modelValue = useVModel(props, 'modelValue', emit)

const computedId = useId(toRef(props, 'id'), 'radio')
const computedName = useId(toRef(props, 'name'), 'checkbox')

const autofocusBoolean = useBooleanish(toRef(props, 'autofocus'))
const buttonsBoolean = useBooleanish(toRef(props, 'buttons'))
const disabledBoolean = useBooleanish(toRef(props, 'disabled'))
const plainBoolean = useBooleanish(toRef(props, 'plain'))
const requiredBoolean = useBooleanish(toRef(props, 'required'))
const stackedBoolean = useBooleanish(toRef(props, 'stacked'))
const stateBoolean = useBooleanish(toRef(props, 'state'))
const validatedBoolean = useBooleanish(toRef(props, 'validated'))

const element = ref<HTMLElement | null>(null)

useFocus(element, {
  initialValue: autofocusBoolean.value,
})

const activeValue = ref<string | boolean | unknown[] | Record<string, unknown> | number>(
  modelValue.value
)

provide(radioGroupKey, {
  set: (value: string | boolean | unknown[] | Record<string, unknown> | number) => {
    activeValue.value = value
  },
  modelValue,
  buttonVariant: toRef(props, 'buttonVariant'),
  form: toRef(props, 'form'),
  name: computedName,
  // 'id': `${computedId.value}_option_${idx}`,
  button: buttonsBoolean,
  state: stateBoolean,
  plain: plainBoolean,
  size: toRef(props, 'size'),
  inline: computed(() => !stackedBoolean.value),
  required: requiredBoolean,
  disabled: disabledBoolean,
})

watchEffect(() => (modelValue.value = activeValue.value))

const normalizeOptions = computed<
  {
    props: {
      value: string | undefined
      disabled: boolean | undefined
    }
    text: string | undefined
    html: string | undefined
    self: symbol
  }[]
>(() =>
  props.options.map((el, ind) =>
    typeof el === 'string'
      ? {
          props: {
            value: el,
            disabled: disabledBoolean.value,
          },
          text: el,
          html: undefined,
          self: Symbol(`radioGroupOptionItem${ind}`),
        }
      : {
          props: {
            value: el[props.valueField] as string | undefined,
            disabled: el[props.disabledField] as boolean | undefined,
            ...(el.props ? el.props : {}),
          },
          text: el[props.textField] as string | undefined,
          html: el[props.htmlField] as string | undefined,
          self: Symbol(`radioGroupOptionItem${ind}`),
        }
  )
)

const classesObject = computed(() => ({
  required: requiredBoolean.value,
  ariaInvalid: props.ariaInvalid,
  state: stateBoolean.value,
  validated: validatedBoolean.value,
  buttons: buttonsBoolean.value,
  stacked: stackedBoolean.value,
  size: props.size,
}))
const computedAttrs = getGroupAttr(classesObject)
const computedClasses = getGroupClasses(classesObject)
</script>
