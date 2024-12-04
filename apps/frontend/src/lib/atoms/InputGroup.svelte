<script lang="ts">
  import type { Snippet } from 'svelte'
  import { writable } from 'svelte/store'

  import { tw } from '$lib/utils/dom'

  import ErrorText from './ErrorText.svelte'
  import { setInputGroupErrors } from './InputGroup'

  type Props = {
    layout?: 'vertical' | 'horizontal'
    class?: string
    errors?: string[]
    children?: Snippet
  }

  let { layout = 'vertical', class: class_, errors, children }: Props = $props()

  const errorsStore = writable<string[] | undefined>(errors)

  errorsStore.set(errors)
  $effect(() => {
    errorsStore.set(errors)
  })

  setInputGroupErrors(errorsStore)
</script>

<div
  class={tw(
    'flex',
    layout === 'vertical' ? 'flex-col items-start gap-0.5' : 'items-center gap-2',
    class_,
  )}
>
  {@render children?.()}
  <ErrorText {errors} />
</div>
