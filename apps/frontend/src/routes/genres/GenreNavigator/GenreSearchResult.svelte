<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import type { GenreMatch, GenreType } from '$lib/types/genres'
  import { cn } from '$lib/utils/dom'

  import { searchStore } from './state'

  type Props = {
    match: GenreMatch<{
      id: number
      name: string
      subtitle: string | null
      type: GenreType
      nsfw: boolean
    }>
  }

  let { match }: Props = $props()

  const userSettings = getUserSettingsContext()
</script>

<a
  href="/genres/{match.genre.id}"
  class={cn(
    'group block truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] text-gray-600 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
    match.genre.nsfw && !$userSettings.showNsfw && 'blur-sm',
  )}
  onclick={() => searchStore.clearFilter()}
  use:tooltip={{
    content: 'Enable NSFW genres in settings to view this genre',
    enabled: match.genre.nsfw && !$userSettings.showNsfw,
  }}
>
  {match.genre.name}
  {#if match.genre.subtitle}
    &nbsp;
    <span
      class="text-[0.8rem] text-gray-500 transition group-hover:text-gray-600 dark:group-hover:text-gray-400"
      >[{match.genre.subtitle}]</span
    >
  {/if}
  {#if match.matchedAka}
    &nbsp;
    <span class="text-[0.8rem]">({match.matchedAka})</span>
  {/if}
  {#if $userSettings.showTypeTags && match.genre.type !== 'STYLE'}
    &nbsp;
    <GenreTypeChip type={match.genre.type} />
  {/if}
  {#if match.genre.nsfw}
    <span
      class="align-super text-xs font-bold text-error-500 transition dark:text-error-700"
      use:tooltip={{ content: 'NSFW' }}>N</span
    >
  {/if}
</a>
