<script lang="ts">
  import { makeGenreTag } from '$lib/types/genres'
  import { copyTextToClipboard } from '$lib/utils/dom'

  export let id: number
  export let name: string
  export let subtitle: string | null
</script>

<div class="flex items-center border-b border-gray-200 p-4 transition dark:border-gray-800">
  <div class="text-2xl font-bold text-gray-600 transition dark:text-gray-300">
    {name}
    {#if subtitle}
      {' '}
      <span class="text-lg text-gray-500">[{subtitle}]</span>
    {/if}
  </div>

  <div class="flex-1" />

  <button
    on:click={() => copyTextToClipboard(makeGenreTag(id))}
    class="text-sm text-gray-400 hover:underline"
  >
    {makeGenreTag(id)}
  </button>
</div>
