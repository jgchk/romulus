<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  import { tooltip as tooltipAction } from '$lib/actions/tooltip'
  import { tw } from '$lib/utils/dom'

  type $$Props = HTMLAttributes<HTMLSpanElement> & { text: string; tooltip?: string }

  export let text: $$Props['text']
  export let tooltip: $$Props['tooltip'] = undefined

  let class_: $$Props['class'] = undefined
  export { class_ as class }
</script>

<span
  class={tw(
    'pointer-events-none rounded-full bg-gray-200 px-1 py-0.5 text-xs font-bold text-gray-500 transition dark:bg-gray-800',
    class_,
  )}
  use:tooltipAction={{ content: tooltip, enabled: !!tooltip }}
  {...$$restProps}
>
  {text}
</span>
