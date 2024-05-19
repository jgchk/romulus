<script lang="ts">
  import { cn, tw } from '$lib/utils/dom'

  export let href: string | undefined = undefined
  export let kind: 'solid' | 'outline' | 'text' = 'solid'
  export let align: 'left' | 'center' | 'right' = 'center'
  let class_: string | undefined = undefined
  export { class_ as class }

  export let layer: 700 | 800 = 800
</script>

<a
  {href}
  class={tw(
    'flex w-fit cursor-pointer items-center rounded border px-4 py-1 text-sm font-medium transition',

    align === 'left' && 'justify-start',
    align === 'center' && 'justify-center',
    align === 'right' && 'justify-end',

    kind === 'solid' && 'border-transparent bg-primary-500 text-black hover:bg-primary-600',
    kind === 'outline' &&
      cn(
        'border-primary-500 bg-transparent text-primary-500',
        layer === 700 && 'hover:bg-gray-600',
        layer === 800 && 'hover:bg-gray-700',
      ),
    kind === 'text' &&
      cn(
        'border-transparent bg-transparent text-primary-500',
        layer === 700 && 'hover:bg-gray-600',
        layer === 800 && 'hover:bg-gray-700',
      ),
    class_,
  )}
  on:click
>
  <slot />
</a>
