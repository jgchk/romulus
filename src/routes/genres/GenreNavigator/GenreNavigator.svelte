<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import { user } from '$lib/contexts/user'
  import SettingsIcon from '$lib/icons/SettingsIcon.svelte'
  import { slide } from '$lib/transitions/slide'

  import GenreNavigatorSettings from './GenreNavigatorSettings.svelte'
  import GenreSearchResults from './GenreSearchResults.svelte'
  import GenreTree from './GenreTree/GenreTree.svelte'
  import type { TreeGenre } from './GenreTree/state'
  import { searchStore } from './state'

  export let genres: Promise<TreeGenre[]>

  let showSettings = false
  $: isSearching = $searchStore.debouncedFilter
</script>

<Card class="flex h-full w-full flex-col">
  <div
    class="flex items-center space-x-1 border-b border-gray-200 p-4 transition dark:border-gray-800"
  >
    <div class="relative flex-1">
      <Input
        ariaLabel="Search Genres"
        class="w-full"
        value={$searchStore.filter}
        on:input={(e) => searchStore.setFilter(e.currentTarget.value)}
        placeholder="Search genres..."
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            searchStore.setFilterImmediately(e.currentTarget.value)
          }
        }}
      />
    </div>
    {#if $user}
      <IconButton tooltip="Genre Settings" on:click={() => (showSettings = !showSettings)}>
        <SettingsIcon />
      </IconButton>
    {/if}
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
      <Button kind="text" class="w-full rounded-none" on:click={() => searchStore.clearFilter()}>
        Back to Tree
      </Button>
    </div>
  {/if}

  <div class="flex-1 overflow-auto">
    {#await genres}
      <div class="center h-full max-h-96 w-full">
        <Loader size={32} class="text-primary-500" />
      </div>
    {:then genres}
      {#if isSearching}
        <GenreSearchResults {genres} />
      {:else}
        <GenreTree {genres} />
      {/if}
    {/await}
  </div>

  {#if $user && $user.permissions?.includes('EDIT_GENRES')}
    <div class="border-t border-gray-200 p-1 transition dark:border-gray-800">
      <a href="/genres/create" class="w-full">
        <Button kind="outline" class="w-full">New Genre</Button>
      </a>
    </div>
  {/if}
</Card>
