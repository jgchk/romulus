<script lang="ts">
  import { tooltip as tooltipAction } from '$lib/actions/tooltip'
  import { tw } from '$lib/utils/dom'

  export let text: string
  export let tooltip: string | undefined = undefined

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<span
  class={tw(
    'cursor-default rounded-full bg-gray-200 px-1 py-0.5 text-xs font-bold text-gray-500 transition dark:bg-gray-800',
    class_,
  )}
  use:tooltipAction={{ content: tooltip, enabled: !!tooltip }}
>
  {text}
</span>
