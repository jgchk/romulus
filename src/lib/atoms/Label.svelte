<script lang="ts">
  import { tw } from '$lib/utils/dom'

  let for_: string | undefined = undefined
  export { for_ as for }

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<label class={tw('text-sm text-gray-400', class_)} for={for_}>
  <slot />
</label>
