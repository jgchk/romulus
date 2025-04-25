<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { routes } from '$lib/routes'

  import { type LayoutProps } from './$types'

  let { children }: LayoutProps = $props()
</script>

<Card class="h-full overflow-auto p-4">
  <div class="mb-4 flex items-center justify-between">
    <h2 class="text-lg font-semibold">Media Artifact Relationship Types</h2>
    <LinkButton href={routes.media.artifactRelationshipTypes.create.route()}
      >New Relationship Type</LinkButton
    >
  </div>

  {@render children?.()}
</Card>
