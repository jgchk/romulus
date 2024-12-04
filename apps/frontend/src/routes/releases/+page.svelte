<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import Release from '$lib/components/Release.svelte'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<Card class="h-full w-full space-y-2 p-4">
  <LinkButton href="/releases/create">Create Release</LinkButton>

  <div class="flex flex-wrap items-start justify-start gap-2">
    {#each data.releases as release (release.id)}
      <Release {...release} />
    {/each}
  </div>
</Card>
