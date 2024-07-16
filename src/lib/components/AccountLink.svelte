<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  import { tw } from '$lib/utils/dom'

  type $$Props = HTMLAttributes<HTMLAnchorElement> & {
    accountId: number
    username: string
    class?: string
  }

  export let accountId: $$Props['accountId']
  export let username: $$Props['username']

  let class_: $$Props['class'] = undefined
  export { class_ as class }

  $: isSpecial = accountId === 3
</script>

<a
  class={tw(
    'transition-all',
    isSpecial
      ? 'bg-gradient-to-r from-code1-500 to-code2-500 bg-clip-text font-medium text-transparent'
      : 'text-primary-500 hover:underline',
    class_,
  )}
  href="/accounts/{accountId}"
  {...$$restProps}><span class="hover:underline">{username}</span></a
>
