<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  import { tooltip as tooltipAction } from '$lib/actions/tooltip'
  import { tw } from '$lib/utils/dom'

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & {
    text: string
    tooltip?: string
    class?: string
  }

  let { text, tooltip, class: class_, ...rest }: Props = $props()
</script>

<span
  class={tw(
    'pointer-events-none rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-bold text-gray-500 transition dark:bg-gray-800',
    class_,
  )}
  use:tooltipAction={{ content: tooltip, enabled: !!tooltip }}
  {...rest}
>
  {text}
</span>
