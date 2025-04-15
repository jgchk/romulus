<script lang="ts">
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import MediaTypeCard from '$lib/features/media/components/MediaTypeCard.svelte'
  import { routes } from '$lib/routes'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<div class="space-y-4">
  <div class="flex justify-end space-x-2">
    <LinkButton href={routes.media.types.cards.route()}>Cards</LinkButton>
    <LinkButton href={routes.media.types.tree.route()} kind="outline">Tree</LinkButton>
  </div>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each [...data.mediaTypes.values()] as mediaType (mediaType.id)}
      <MediaTypeCard {mediaType} parentMediaTypes={data.mediaTypes} />
    {/each}
  </div>
</div>
