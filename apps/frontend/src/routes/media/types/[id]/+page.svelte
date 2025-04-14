<script lang="ts">
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<div>
  <h1>Media Type Details</h1>
  <p>Media Type ID: {data.mediaType.id}</p>
  <p>Media Type Name: {data.mediaType.name}</p>
</div>
