<script lang="ts">
  import { GearSix } from 'phosphor-svelte'

  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
  import type { AsyncGenresRune } from '$lib/features/genres/rune.svelte'
  import { slide } from '$lib/transitions/slide'

  import GenreSearchResults from './GenreSearchResults.svelte'
  import GenreTree from './GenreTree/GenreTree.svelte'
  import GenreNavigatorSettings from './Settings/Settings.svelte'
  import { searchStore } from './state'

  let { genres }: { genres: AsyncGenresRune } = $props()

  let showSettings = $state(false)
  let isSearching = $derived($searchStore.debouncedFilter)

  const user = getUserContext()
</script>

<Card class="flex h-full w-full flex-col overflow-hidden">
  <div
    class="flex items-center space-x-1 border-b border-gray-200 p-4 transition dark:border-gray-800"
  >
    <div class="relative flex-1">
      <Input
        ariaLabel="Search Genres"
        class="w-full"
        value={$searchStore.filter}
        onInput={(e) => searchStore.setFilter(e.currentTarget.value)}
        placeholder="Search genres..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            searchStore.setFilterImmediately(e.currentTarget.value)
          }
        }}
      />
    </div>
    <IconButton tooltip="Genre Settings" onClick={() => (showSettings = !showSettings)}>
      <GearSix />
    </IconButton>
  </div>

  {#if showSettings}
    <div
      class="space-y-3 border-b border-gray-200 p-4 transition dark:border-gray-800"
      transition:slide|local={{ axis: 'y' }}
    >
      <GenreNavigatorSettings />
    </div>
  {/if}

  {#if isSearching}
    <div class="flex justify-center border-b border-gray-200 transition dark:border-gray-800">
      <Button kind="text" class="w-full rounded-none" onClick={() => searchStore.clearFilter()}>
        Back to Tree
      </Button>
    </div>
  {/if}

  <div class="flex-1 overflow-auto">
    {#if genres.data}
      {@const genreStore = createGenreStore(genres.data)}
      {#if isSearching}
        <GenreSearchResults genres={genreStore} />
      {:else}
        <GenreTree genres={genreStore} />
      {/if}
    {:else if genres.error}
      <div>Error fetching genres</div>
    {:else}
      <Loader />
    {/if}
  </div>

  {#if $user?.permissions.genres.canCreate}
    <div class="border-t border-gray-200 p-1 transition dark:border-gray-800">
      <LinkButton class="w-full" kind="outline" href="/genres/create">New Genre</LinkButton>
    </div>
  {/if}
</Card>
