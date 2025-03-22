<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import { tooltip } from '$lib/actions/tooltip'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import type { GenreDatabase } from '$lib/genre-db/infrastructure/db'
  import { createGenreDatabaseQueries } from '$lib/genre-db/tanstack-query'
  import { tw } from '$lib/utils/dom'

  type Props = {
    id: number
    text?: string
    genreDatabase: GenreDatabase
  }

  let { id, text, genreDatabase }: Props = $props()

  const genreDatabaseQueries = createGenreDatabaseQueries(genreDatabase)
  const genreQuery = createQuery(genreDatabaseQueries.getGenre(id))

  const userSettings = getUserSettingsContext()
</script>

{#if $genreQuery.data !== undefined}
  {@const genre = $genreQuery.data}
  <a
    href={genre ? `/genres/${id}` : `/genre/${id}/history`}
    class={tw('inline-block underline', genre?.nsfw && !$userSettings.showNsfw && 'blur-sm')}
    >{#if text}{text}{:else if genre}{genre.name}{:else}&lt;Deleted Genre&gt;{/if}</a
  >{#if genre?.nsfw}&nbsp;<span
      class="align-super text-xs font-bold text-error-500 no-underline transition dark:text-error-700"
      use:tooltip={{ content: 'NSFW' }}
      data-testid="nsfw-indicator">N</span
    >
  {/if}
{:else if $genreQuery.error}
  <a href="/genres/{id}" class="inline-block underline"
    >{#if text}{text}{:else}&lt;Error&gt;{/if}</a
  >
{:else}
  <a href="/genres/{id}" class="inline-block underline"
    >{#if text}{text}{:else}&lt;Loading...&gt;{/if}</a
  >
{/if}
