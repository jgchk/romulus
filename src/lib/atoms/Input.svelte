<script lang="ts">
  import { tw } from '$lib/utils/dom'

  import { getInputGroupErrors } from './InputGroup'

  export let value = ''
  export let type: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' = 'text'
  export let name: string | undefined = undefined
  export let id: string | undefined = undefined
  export let disabled = false
  export let placeholder: string | undefined = undefined
  export let autofocus = false
  export let pattern: string | undefined = undefined
  export let min: string | number | undefined = undefined
  export let max: string | number | undefined = undefined
  export let required = false
  export let step: number | string | undefined = undefined
  export let minlength: number | undefined = undefined
  export let maxlength: number | undefined = undefined
  export let autocomplete: string | undefined = 'off'
  export let ariaLabel: string | undefined = undefined

  let class_: string | undefined = undefined
  export { class_ as class }

  let propErrors: string[] | undefined = undefined
  export { propErrors as errors }
  const contextErrors = getInputGroupErrors()
  $: errors = propErrors ?? ($contextErrors && $contextErrors.length > 0)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type $$Events = {
    input: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
    focus: FocusEvent & {
      currentTarget: EventTarget & HTMLInputElement
    }
    keydown: KeyboardEvent & {
      currentTarget: EventTarget & HTMLInputElement
    }
    blur: FocusEvent & {
      currentTarget: EventTarget & HTMLInputElement
    }
  }
</script>

<!-- svelte-ignore a11y-autofocus -->
<input
  {value}
  on:input
  on:input={(e) => (value = e.currentTarget.value)}
  on:focus
  on:keydown
  on:blur
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
