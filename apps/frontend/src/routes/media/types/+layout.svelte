<script lang="ts">
  import { Plus } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { routes } from '$lib/routes'

  import { type LayoutProps } from './$types'

  let { children }: LayoutProps = $props()
</script>

<Card class="flex h-full flex-col overflow-auto">
  <div class="flex items-center justify-between border-b p-4 dark:border-gray-800">
    <h2 class="text-lg font-semibold">Media Types</h2>
    <LinkButton href={routes.media.types.create.route()}>
      <Plus class="mr-1" />New Media Type
    </LinkButton>
  </div>

  <div class="flex-1 overflow-auto">
    {@render children?.()}
  </div>
</Card>
