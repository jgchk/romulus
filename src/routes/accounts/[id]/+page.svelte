<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

<div class="h-full w-full">
  <Card class="h-full p-4">
    <div class="flex h-full max-h-full min-h-0 flex-col">
      <div class="text-xl font-bold">{data.account.username}</div>

      <div class="py-2">
        <div>Genres created: {data.numCreated}</div>
        <div>Genres edited: {data.numUpdated}</div>
        <div>Genres deleted: {data.numDeleted}</div>
      </div>

      <div class="min-h-0 flex-1 overflow-auto">TODO</div>
    </div>
  </Card>
</div>
