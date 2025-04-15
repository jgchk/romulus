<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { routes } from '$lib/routes'

  import type { LayoutProps } from './$types'

  let { children }: LayoutProps = $props()
</script>

<Card class="flex h-full flex-col overflow-auto p-4">
  <div class="mb-4 flex items-center justify-between">
    <h2 class="text-lg font-semibold">Media Types</h2>
    <LinkButton href={routes.media.types.create.route()}>New Media Type</LinkButton>
  </div>

  <div class="flex-1 overflow-auto">
    {@render children?.()}
  </div>
</Card>
