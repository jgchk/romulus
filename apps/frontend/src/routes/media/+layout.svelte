<script lang="ts">
  import type { Snippet } from 'svelte'

  import { routes } from '$lib/routes'

  import type { LayoutData } from './$types'

  type Props = {
    data: LayoutData
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<nav>
  <a href={routes.media.types.route()}>Media Types</a>
  <a href={routes.media.artifactTypes.route()}>Media Artifact Types</a>
  <a href={routes.media.artifactTypes.relationships.route()}>Media Artifact Relationship Types</a>
</nav>

<div class="flex-1">
  {@render children?.()}
</div>
