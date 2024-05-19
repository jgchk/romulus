<script lang="ts">
  import { writable } from 'svelte/store'

  import { tw } from '$lib/utils/dom'

  import ErrorText from './ErrorText.svelte'
  import { setInputGroupErrors } from './InputGroup'

  export let layout: 'vertical' | 'horizontal' = 'vertical'
  let class_: string | undefined = undefined
  export { class_ as class }

  export let errors: string[] | undefined = undefined

  const errorsStore = writable<string[] | undefined>(errors)
  $: errorsStore.set(errors)
  setInputGroupErrors(errorsStore)
</script>

<div
  class={tw(
    'flex',
    layout === 'vertical' ? 'flex-col items-start gap-0.5' : 'items-center gap-2',
    class_,
  )}
>
  <slot />
  {#if errors && errors.length > 0}
    <ErrorText>{errors.join(', ')}</ErrorText>
  {/if}
</div>
