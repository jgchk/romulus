<script lang="ts">
  import type { Snippet } from 'svelte'

  import type { LayoutData } from './$types'

  type Props = {
    data: LayoutData
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<nav>
  <a href="/media/artifact-types">Artifact Types</a>
  <a href="/media/artifact-types/relationships">Relationships</a>
  <a href="/media/artifact-types/schema-preview">Schema Preview</a>
</nav>

<div class="flex-1">
  {@render children?.()}
</div>
