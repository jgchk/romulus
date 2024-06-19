<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip'
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import { getTimeSinceShort, toPrettyDate } from '$lib/utils/datetime'
  import { cn } from '$lib/utils/dom'
  import { capitalize } from '$lib/utils/string'

  import { treeState } from '../GenreNavigator/GenreTree/state'
  import type { PageData } from './$types'

  export let data: PageData

  treeState.setSelectedId(undefined)
  treeState.setSelectedPath(undefined)
</script>

<div class="h-full w-full max-w-lg p-2">
  <VirtualList items={data.genreHistory} let:item={genre}>
    <div class="flex px-2 py-1">
      <div class="flex-[3]">
        {#if genre.operation === 'DELETE'}
          <div class="text-gray-500 line-through">{genre.name}</div>
        {:else}
          <GenreLink
            id={genre.treeGenreId}
            name={genre.name}
            subtitle={genre.subtitle}
            type={genre.type}
          />
        {/if}
      </div>

      <div
        class={cn(
          'flex-1',
          genre.operation === 'DELETE' && 'text-error-500',
          genre.operation === 'CREATE' && 'text-success-500',
          genre.operation === 'UPDATE' && 'text-warning-500',
        )}
      >
        {capitalize(genre.operation)}
      </div>

      <div class="flex-1">
        {#if genre.account}
          <a href="/accounts/{genre.account.id}" class="text-primary-500 hover:underline"
            >{genre.account.username}</a
          >
        {:else}
          <div class="text-gray-500 line-through">Deleted</div>
        {/if}
      </div>

      <div class="flex-1">
        <span use:tooltip={{ content: toPrettyDate(genre.createdAt) }}
          >{getTimeSinceShort(genre.createdAt)}</span
        >
      </div>
    </div>
  </VirtualList>
</div>
