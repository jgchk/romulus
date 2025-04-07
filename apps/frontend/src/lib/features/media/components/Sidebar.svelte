<script lang="ts">
  import { createQuery, getQueryClientContext } from '@tanstack/svelte-query'

  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import Loader from '$lib/atoms/Loader.svelte'

  import { getMediaTypeTreeFromCache } from '../state/cache'
  import { mediaTypeQueries } from '../state/tanstack'
  import Tree from './Tree.svelte'

  let expanded = $state(false)

  const mediaTypesQuery = createQuery(mediaTypeQueries.tree())

  const queryClient = getQueryClientContext()
  $effect(() => {
    async function loadMediaTypeTreeFromCache() {
      const cached = await getMediaTypeTreeFromCache()
      if (cached) {
        queryClient.setQueryData(mediaTypeQueries.tree().queryKey, cached)
      }
    }

    void loadMediaTypeTreeFromCache()
  })
</script>

<div class="flex w-10 items-center justify-start">
  <div class="relative -left-8">
    <button class="absolute w-max rotate-90" type="button" onclick={() => (expanded = !expanded)}
      >Media Types</button
    >
  </div>
</div>

{#if expanded}
  <div>
    {#if $mediaTypesQuery.data}
      <Tree mediaTypes={$mediaTypesQuery.data} />
    {:else if $mediaTypesQuery.error}
      <div>Error fetching media types :(</div>
    {:else}
      <Loader size={32} />
    {/if}

    <LinkButton href="/media-types/create">New Media Type</LinkButton>
  </div>
{/if}
