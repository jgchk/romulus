<script lang="ts">
  import { type Snippet } from 'svelte'

  import { isMouseEventOutsideNodes } from '$lib/actions/clickOutside'
  import { readableBoxWith, writableBoxWith } from '$lib/runes/box.svelte'
  import { tw } from '$lib/utils/dom'

  import { getInputGroupErrors } from '../InputGroup'
  import { MultiselectState, setMultiselectState } from './MultiselectState.svelte'

  let {
    value = $bindable([]),
    options,
    onChange,
    disabled,
    errors: propErrors,
    class: class_,
    children,
  }: {
    value?: string[]
    options: string[]
    onChange?: (value: string[]) => void
    disabled?: boolean
    errors?: string[]
    class?: string
    children?: Snippet
  } = $props()

  const multiselectState = new MultiselectState({
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
  setMultiselectState(multiselectState)

  const popoverReference = multiselectState.popoverReference

  const contextErrors = getInputGroupErrors()
  let errors = $derived(!!(propErrors?.length ?? $contextErrors?.length))

  let containerElement: HTMLElement | undefined = $state(undefined)
</script>

<svelte:document
  onclickcapture={(e) => {
    if (isMouseEventOutsideNodes(e, [containerElement, multiselectState.optionsRef])) {
      e.stopPropagation()
      multiselectState.open = false
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
