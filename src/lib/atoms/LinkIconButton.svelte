<script lang="ts">
  import { IconContext } from 'phosphor-svelte'
  import { scale } from 'svelte/transition'

  import { tooltip as tooltipAction } from '$lib/actions/tooltip'
  import { cn, tw } from '$lib/utils/dom'

  import Loader from './Loader.svelte'

  export let href: string
  export let tooltip: string
  export let disabled = false
  export let type: 'button' | 'submit' = 'button'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let loading = false
  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<a
  {href}
  {type}
  class={tw(
    'inline-block rounded border border-transparent bg-gray-900 bg-opacity-0 p-1 text-primary-500 outline-none transition hover:bg-opacity-10 focus:border-secondary-500 dark:bg-gray-100 dark:bg-opacity-0',
    disabled && 'pointer-events-none text-gray-400 dark:text-gray-500',
    size === 'sm' && 'h-6 w-6',
    size === 'md' && 'h-7 w-7',
    size === 'lg' && 'h-8 w-8',
    class_,
  )}
  use:tooltipAction={{ content: tooltip }}
>
  <div
    class={cn(
      'relative h-full w-full transition-all',
      !disabled && 'group-active/icon-button:top-px',
    )}
  >
    {#if loading}
      <Loader />
    {:else}
      <div class="absolute h-full w-full" transition:scale|local={{ duration: 150 }}>
        <IconContext values={{ size: '100%' }}>
          <slot />
        </IconContext>
      </div>
    {/if}
  </div>
</a>
