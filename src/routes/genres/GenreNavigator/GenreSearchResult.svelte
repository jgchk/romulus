<script lang="ts">
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { userSettings } from '$lib/contexts/user-settings'
  import type { GenreMatch } from '$lib/types/genres'

  import type { TreeGenre } from './GenreTree/state'
  import { searchStore } from './state'

  export let match: GenreMatch<TreeGenre>
</script>

<a
  href="/genres/{match.genre.id}"
  class="group block truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] text-gray-600 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
  on:click={() => searchStore.clearFilter()}
>
  {match.genre.name}
  {#if match.genre.subtitle}
    {' '}
    <span
      class="text-[0.8rem] text-gray-500 transition group-hover:text-gray-600 dark:group-hover:text-gray-400"
      >[{match.genre.subtitle}]</span
    >
  {/if}
  {#if match.matchedAka}
    {' '}
    <span class="text-[0.8rem]">({match.matchedAka})</span>
  {/if}
  {#if $userSettings.showTypeTags && match.genre.type !== 'STYLE'}
    {' '}
    <GenreTypeChip type={match.genre.type} />
  {/if}
</a>
