<script lang="ts" context="module">
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type C = typeof SvelteComponentTyped<any, any, any>
</script>

<script lang="ts" generics="C extends typeof SvelteComponentTyped<any, any, any>">
  import type { SvelteComponentTyped } from 'svelte'
  import { scale } from 'svelte/transition'

  import { tooltip } from '$lib/actions/tooltip'
  import { slide } from '$lib/transitions/slide'
  import { cn, tw } from '$lib/utils/dom'

  import Loader from './Loader.svelte'

  export let disabled = false
  export let type: 'button' | 'submit' = 'button'
  export let kind: 'solid' | 'outline' | 'text' = 'solid'
  export let align: 'left' | 'center' | 'right' = 'center'
  export let loading = false
  let class_: string | undefined = undefined
  export { class_ as class }
  let tooltip_: string | undefined = undefined
  export { tooltip_ as tooltip }
  export let color: 'primary' | 'secondary' | 'error' = 'primary'

  export let icon: C | undefined = undefined
  export let iconClass: string | undefined = undefined
</script>

<button
  on:click
  {disabled}
  {type}
  aria-label={tooltip_}
  class={tw(
    'relative flex items-center rounded border px-4 py-1 text-sm font-medium transition',

    align === 'left' && 'justify-start',
    align === 'center' && 'justify-center',
    align === 'right' && 'justify-end',

    kind === 'solid' &&
      cn(
        'border-transparent text-white disabled:bg-gray-500 disabled:text-gray-700 dark:text-black',
        color === 'primary' && 'bg-primary-500 hover:bg-primary-600',
        color === 'secondary' && 'bg-secondary-500 hover:bg-secondary-600',
        color === 'error' && 'bg-error-600 text-error-100 hover:bg-error-700',
      ),

    kind === 'outline' &&
      cn(
        'bg-transparent hover:bg-black hover:bg-opacity-10 disabled:border-gray-500 disabled:bg-transparent disabled:text-gray-500 dark:hover:bg-white dark:hover:bg-opacity-10',
        color === 'primary' && 'border-primary-500 text-primary-500',
        color === 'secondary' && 'border-secondary-500 text-secondary-500',
        color === 'error' && 'border-error-500 text-error-500',
      ),

    kind === 'text' &&
      cn(
        'border-transparent bg-transparent hover:bg-black hover:bg-opacity-10 disabled:bg-transparent disabled:text-gray-500 dark:hover:bg-white dark:hover:bg-opacity-10',
        color === 'primary' && 'text-primary-500',
        color === 'secondary' && 'text-secondary-500',
        color === 'error' && 'text-error-500',
      ),

    class_,
  )}
>
  {#if loading || icon}
    <div transition:slide|local={{ axis: 'x' }}>
      <div class="relative mr-2 h-3.5 w-3.5">
        {#if loading}
          <Loader />
        {:else}
          <div class="absolute" transition:scale|local={{ duration: 150 }}>
            <svelte:component this={icon} class={iconClass} />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <slot />

  {#if tooltip_ !== undefined}
    <div class="absolute left-0 top-0 h-full w-full" use:tooltip={{ content: tooltip_ }}></div>
  {/if}
</button>
