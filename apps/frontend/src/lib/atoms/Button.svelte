<script lang="ts" module>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type C = typeof SvelteComponent<any, any, any>
</script>

<script lang="ts" generics="C extends typeof SvelteComponent<any, any, any>">
  import type { Snippet, SvelteComponent } from 'svelte'
  import { scale } from 'svelte/transition'

  import { tooltip } from '$lib/actions/tooltip'
  import { slide } from '$lib/transitions/slide'
  import { cn, tw } from '$lib/utils/dom'

  import Loader from './Loader.svelte'

  type Props = {
    disabled?: boolean
    type?: 'button' | 'submit'
    kind?: 'solid' | 'outline' | 'text'
    align?: 'left' | 'center' | 'right'
    loading?: boolean
    class?: string | undefined
    tooltip?: string | undefined
    color?: 'primary' | 'secondary' | 'error'
    icon?: C | undefined
    iconClass?: string | undefined
    children?: Snippet
    onClick?: () => void
  }

  let {
    disabled = false,
    type = 'button',
    kind = 'solid',
    align = 'center',
    loading = false,
    class: class_,
    tooltip: tooltip_,
    color = 'primary',
    icon,
    iconClass,
    children,
    onClick,
  }: Props = $props()
</script>

<button
  onclick={onClick}
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
          {@const SvelteComponent = icon}
          <div class="absolute" transition:scale|local={{ duration: 150 }}>
            <SvelteComponent class={iconClass} />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {@render children?.()}

  {#if tooltip_ !== undefined}
    <div class="absolute left-0 top-0 h-full w-full" use:tooltip={{ content: tooltip_ }}></div>
  {/if}
</button>
