<script lang="ts">
  import { tw } from '$lib/utils/dom'

  export let checked = false

  export let id: string | undefined = undefined
  let class_: string | undefined = undefined
  export { class_ as class }
  export let tabindex: number | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type $$Events = {
    change: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  }
</script>

<input
  {id}
  {tabindex}
  type="checkbox"
  bind:checked
  on:change
  class={tw('h-5 w-5 cursor-pointer accent-secondary-600', class_)}
/>
