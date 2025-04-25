<script lang="ts">
  import { IconContext } from 'phosphor-svelte'
  import { type Snippet } from 'svelte'
  import { scale } from 'svelte/transition'

  import { tooltip as tooltipAction } from '$lib/actions/tooltip'
  import { cn, tw } from '$lib/utils/dom'

  import Loader from './Loader.svelte'

  type Props = {
    href: string
    tooltip: string
    disabled?: boolean
    type?: 'button' | 'submit'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    class?: string
    children?: Snippet
  }

  let {
    href,
    tooltip,
    disabled = false,
    type = 'button',
    size = 'md',
    loading = false,
    class: class_,
    children,
  }: Props = $props()
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
          {@render children?.()}
        </IconContext>
      </div>
    {/if}
  </div>
</a>
