<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import MediaArtifactTypeCard from '$lib/features/media/components/MediaArtifactTypeCard.svelte'
  import MediaArtifactTypeForm from '$lib/features/media/components/MediaArtifactTypeForm.svelte'

  import { type PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<div>
  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    {@const isEditing = data.id === mediaArtifactType.id}

    {#if isEditing}
      <Card class="relative p-4">
        <MediaArtifactTypeForm id={data.id} data={data.form} mediaTypes={data.mediaTypes} />
      </Card>
    {:else}
      <MediaArtifactTypeCard {mediaArtifactType} mediaTypes={data.mediaTypes} />
    {/if}
  {/each}
</div>
