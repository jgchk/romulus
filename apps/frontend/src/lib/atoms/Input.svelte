<script lang="ts">
  import { type FullAutoFill } from 'svelte/elements'

  import { tw } from '$lib/utils/dom'

  import { getInputGroupErrors } from './InputGroup'

  type Props = {
    value?: string
    type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url'
    name?: string
    id?: string
    disabled?: boolean
    placeholder?: string
    autofocus?: boolean
    pattern?: string
    min?: string | number
    max?: string | number
    required?: boolean
    step?: number | string
    minlength?: number
    maxlength?: number
    autocomplete?: FullAutoFill
    ariaLabel?: string
    class?: string
    errors?: string[]
    onInput?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void
    onFocus?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void
    onKeyDown?: (e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => void
    onBlur?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void
  }

  let {
    value = $bindable(''),
    type = 'text',
    name,
    id,
    disabled = false,
    placeholder,
    autofocus = false,
    pattern,
    min,
    max,
    required = false,
    step,
    minlength,
    maxlength,
    autocomplete = 'off',
    ariaLabel,
    class: class_,
    errors: propErrors,
    onInput,
    onFocus,
    onKeyDown,
    onBlur,
  }: Props = $props()

  const contextErrors = getInputGroupErrors()
  let errors = $derived(propErrors ?? ($contextErrors && $contextErrors.length > 0))
</script>

<!-- svelte-ignore a11y_autofocus -->
<input
  {value}
  oninput={(e) => {
    value = e.currentTarget.value
    onInput?.(e)
  }}
  onfocus={onFocus}
  onkeydown={onKeyDown}
  onblur={onBlur}
  {type}
  {name}
  {id}
  {disabled}
  {placeholder}
  {autofocus}
  {pattern}
  {min}
  {max}
  {required}
  {step}
  {minlength}
  {maxlength}
  {autocomplete}
  data-invalid={errors}
  aria-label={ariaLabel}
  class={tw(
    'rounded border border-gray-300 bg-black bg-opacity-[0.04] p-1.5 px-2 text-sm text-black outline-none transition-all hover:bg-opacity-[0.07] focus:border-secondary-500 dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:text-white dark:hover:bg-opacity-10',
    class_,
  )}
/>
