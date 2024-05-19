<script lang="ts">
  import { tw } from '$lib/utils/dom'

  import { getInputGroupErrors } from './InputGroup'

  export let value = ''
  export let name: string | undefined = undefined
  export let id: string | undefined = undefined
  export let disabled = false
  export let placeholder: string | undefined = undefined
  export let autofocus = false
  export let required = false
  export let minlength: number | undefined = undefined
  export let maxlength: number | undefined = undefined
  export let rows: number | undefined = undefined

  let class_: string | undefined = undefined
  export { class_ as class }
  export let layer: 700 | 800 = 800

  let propErrors: string[] | undefined = undefined
  export { propErrors as errors }
  const contextErrors = getInputGroupErrors()
  $: errors = propErrors || ($contextErrors && $contextErrors.length > 0)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface $$Events {
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

  let textArea: HTMLTextAreaElement

  export function focus() {
    textArea.focus()
  }

  export function getSelectionRange() {
    return { start: textArea.selectionStart, end: textArea.selectionEnd }
  }

  export function setSelectionRange(...args: Parameters<HTMLTextAreaElement['setSelectionRange']>) {
    textArea.setSelectionRange(...args)
  }
</script>

<!-- svelte-ignore a11y-autofocus -->
<textarea
  bind:this={textArea}
  {value}
  on:input
  on:input={(e) => (value = e.currentTarget.value)}
  on:focus
  on:keydown
  on:blur
  {name}
  {id}
  {disabled}
  {placeholder}
  {autofocus}
  {required}
  {minlength}
  {maxlength}
  {rows}
  data-invalid={errors}
  class={tw(
    'rounded px-2 py-1 text-white',
    layer === 700 && 'bg-gray-600',
    layer === 800 && 'bg-gray-700',
    class_,
  )}
/>

<style>
  textarea {
    transition:
      all 150ms cubic-bezier(0.4, 0, 0.2, 1),
      width 0s,
      height 0s;
  }
</style>
