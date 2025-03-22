<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query'
  import type { Snippet } from 'svelte'

  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import Card from '$lib/atoms/Card.svelte'
  import SplitPane from '$lib/atoms/SplitPane.svelte'
  import { createClearGenresCommand } from '$lib/genre-db/application/clear-genres'
  import { createSeedGenresCommand } from '$lib/genre-db/application/seed-genres'
  import { createSetGenresCommand } from '$lib/genre-db/application/set-genres'
  import type { GenreDatabase } from '$lib/genre-db/infrastructure/db'

  import type { LayoutData } from './$types'
  import { createAsyncGenreTreeStore, setGenreTreeStoreContext } from './genre-tree-store.svelte'
  import GenreNavigator from './GenreNavigator/GenreNavigator.svelte'
  import { createTreeStateStore, setTreeStateStoreContext } from './tree-state-store.svelte'

  type Props = {
    data: LayoutData
    children?: Snippet
  }

  let { data, children }: Props = $props()

  let windowWidth = $state(0)

  let leftPaneSize = $state(data.leftPaneSize ?? 300)
  $effect(() => {
    if (browser) {
      document.cookie = `genres.leftPaneSize=${leftPaneSize}; path=/; max-age=31536000`
    }
  })

  setGenreTreeStoreContext(createAsyncGenreTreeStore(data.streamed.genres))
  setTreeStateStoreContext(createTreeStateStore())

  const queryClient = useQueryClient()

  $effect(() => {
    async function storeGenres(db: GenreDatabase) {
      const genres = await data.streamed.genres

      const seedDatabase = createSeedGenresCommand({
        clearGenres: createClearGenresCommand(db),
        setGenres: createSetGenresCommand(db),
      })

      await seedDatabase(genres)

      await queryClient.invalidateQueries({ queryKey: ['genres'] })
    }

    if (data.genreDatabase) {
      void storeGenres(data.genreDatabase)
    }
  })
</script>

<svelte:window bind:innerWidth={windowWidth} />

<SplitPane
  minSize={200}
  maxSize={windowWidth - 300}
  defaultSize={leftPaneSize}
  class="h-full pt-0"
  on:resize={(e) => (leftPaneSize = e.detail)}
  onSmallScreenCollapseto={$page.url.pathname === '/genres' ? 'left' : 'right'}
>
  {#snippet left()}
    <GenreNavigator genreDatabase={data.genreDatabase} />
  {/snippet}
  {#snippet right()}
    <Card class="h-full overflow-auto">
      {@render children?.()}
    </Card>
  {/snippet}
</SplitPane>
