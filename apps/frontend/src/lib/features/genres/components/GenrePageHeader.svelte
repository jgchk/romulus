<script lang="ts">
  import { makeGenreTag } from '$lib/types/genres'
  import { copyTextToClipboard } from '$lib/utils/dom'

  type Props = {
    id: number
    name: string
    subtitle: string | null
    nsfw: boolean
  }

  let { id, name, subtitle, nsfw }: Props = $props()
</script>

<div class="flex items-center border-b border-gray-200 p-4 transition dark:border-gray-800">
  <h1 class="text-2xl font-bold text-gray-600 transition dark:text-gray-300">
    <span data-testid="genre-name">{name}</span>
    {#if subtitle}
      <span class="genre-subtitle text-lg text-gray-500">[{subtitle}]</span>
    {/if}
    {#if nsfw}
      <span class="align-super text-sm text-error-500">NSFW</span>
    {/if}
  </h1>

  <div class="flex-1"></div>

  <button
    type="button"
    onclick={() => copyTextToClipboard(makeGenreTag(id))}
    class="text-sm text-gray-400 hover:underline"
  >
    {makeGenreTag(id)}
  </button>
</div>
