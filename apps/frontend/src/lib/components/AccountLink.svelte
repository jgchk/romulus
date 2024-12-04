<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  import { tw } from '$lib/utils/dom'

  type Props = HTMLAttributes<HTMLAnchorElement> & {
    accountId: number
    username: string
    class?: string
  }

  let { accountId, username, class: class_, ...rest }: Props = $props()

  let isSpecial = $derived(accountId === 3)
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
  {...rest}><span class="hover:underline">{username}</span></a
>
