<script lang="ts">
  import { Info } from 'phosphor-svelte'
  import { tooltip as tooltipAction } from '$lib/actions/tooltip'
  import { tw } from '$lib/utils/dom'

  export let tooltip: string

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<span
  class={tw('inline-block cursor-help text-primary-500', class_)}
  use:tooltipAction={{ content: tooltip }}><Info class="inline-block" /></span
>
