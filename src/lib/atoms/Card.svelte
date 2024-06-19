<script lang="ts">
  import { tw } from '$lib/utils/dom'

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<div
  class={tw(
    'relative rounded-lg border border-black border-opacity-10 bg-gray-100 transition dark:border-white dark:border-opacity-10 dark:bg-gray-900',
    class_,
  )}
>
  <slot />
</div>
