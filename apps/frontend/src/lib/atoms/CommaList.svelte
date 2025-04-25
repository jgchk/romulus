<script lang="ts" module>
  type T = unknown
</script>

<script lang="ts" generics="T extends unknown">
  import { type Snippet } from 'svelte'

  type Props = {
    items: T[]
    class?: string
    separator?: string
    separatorClass?: string
    children?: Snippet<[{ item: T; i: number }]>
  }

  let { items, class: class_, separator = ', ', separatorClass, children }: Props = $props()
</script>

<!-- eslint-disable svelte/require-each-key -->
<span class={class_}>
  {#each items as item, i}{#if children}{@render children?.({
        item,
        i,
      })}{:else}{item}{/if}{#if i < items.length - 1}<span class={separatorClass}>{separator}</span
      >{/if}{/each}</span
>
<!-- eslint-enable svelte/require-each-key -->
