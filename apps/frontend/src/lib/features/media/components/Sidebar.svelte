<script lang="ts">
  import LinkButton from '$lib/atoms/LinkButton.svelte'

  import MediaTypeTree from './MediaTypeTree.svelte'

  let {
    mediaTypes,
  }: { mediaTypes: Map<string, { id: string; name: string; children: string[] }> } = $props()

  let expanded = $state(false)
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
    <MediaTypeTree {mediaTypes} />

    <LinkButton href="/media-types/create">New Media Type</LinkButton>
  </div>
{/if}
