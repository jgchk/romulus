<script lang="ts">
  import { type Snippet } from 'svelte'

  import { isMouseEventOutsideNodes } from '$lib/actions/clickOutside'
  import { readableBoxWith, writableBoxWith } from '$lib/runes/box.svelte'
  import { tw } from '$lib/utils/dom'

  import { getInputGroupErrors } from '../InputGroup'
  import { SelectState, setSelectState } from './SelectState.svelte'

  let {
    value = $bindable(undefined),
    options = [],
    onChange,
    disabled,
    errors: propErrors,
    class: class_,
    children,
  }: {
    value?: string | undefined
    options?: string[]
    onChange?: (value: string | undefined) => void
    disabled?: boolean
    errors?: string[]
    class?: string
    children?: Snippet
  } = $props()

  const selectState = new SelectState({
    value: writableBoxWith(
      () => value,
      (v) => {
        value = v
        onChange?.(v)
      },
    ),
    options: readableBoxWith(() => options),
    disabled: readableBoxWith(() => !!disabled),
  })
  setSelectState(selectState)

  const popoverReference = selectState.popoverReference

  const contextErrors = getInputGroupErrors()
  let errors = $derived(!!(propErrors?.length ?? $contextErrors?.length))

  let containerElement: HTMLElement | undefined = $state(undefined)
</script>

<svelte:document
  onclickcapture={(e) => {
    if (isMouseEventOutsideNodes(e, [containerElement, selectState.optionsRef])) {
      e.stopPropagation()
      selectState.close(false)
    }
  }}
/>

<div
  use:popoverReference
  data-invalid={errors}
  class={tw('relative', class_)}
  bind:this={containerElement}
>
  {@render children?.()}
</div>
