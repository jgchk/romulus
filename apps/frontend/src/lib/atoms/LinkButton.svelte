<script lang="ts">
  import type { Snippet } from 'svelte'

  import { cn, tw } from '$lib/utils/dom'

  type Props = {
    href?: string
    kind?: 'solid' | 'outline' | 'text'
    align?: 'left' | 'center' | 'right'
    class?: string
    color?: 'primary' | 'secondary' | 'error'
    children?: Snippet
    onClick?: () => void
  }

  let {
    href,
    kind = 'solid',
    align = 'center',
    class: class_,
    color = 'primary',
    children,
    onClick,
  }: Props = $props()
</script>

<a
  {href}
  class={tw(
    'flex w-fit cursor-pointer items-center rounded border px-4 py-1 text-sm font-medium transition',

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
  onclick={onClick}
>
  {@render children?.()}
</a>
