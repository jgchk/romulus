<script lang="ts">
  import { tw } from '$lib/utils/dom'

  export let id: number
  export let username: string

  let class_: string | undefined = undefined
  export { class_ as class }

  $: isSpecial = id === 3
</script>

<a
  class={tw(
    'transition-all',
    isSpecial
      ? 'bg-gradient-to-r from-code1-500 to-code2-500 bg-clip-text font-medium text-transparent'
      : 'text-primary-500 hover:underline',
    class_,
  )}
  href="/accounts/{id}"><span class="hover:underline">{username}</span></a
>
