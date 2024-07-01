<script lang="ts">
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { userSettings } from '$lib/contexts/user'

  import type { TreeGenre } from './GenreNavigator/GenreTree/state'

  export let genre: TreeGenre
</script>

<span>{genre.name}</span>{#if genre.subtitle}{' '}<span class="text-xs text-gray-500"
    >[{genre.subtitle}]</span
  >{/if}{#if $userSettings.showTypeTags && genre.type !== 'STYLE'}
  {' '}
  <GenreTypeChip type={genre.type} class="dark:border dark:border-gray-700" />
{/if}
