<script lang="ts">
  import 'swagger-ui/dist/swagger-ui.css'

  import { onMount } from 'svelte'
  import SwaggerUI from 'swagger-ui'

  import Card from '$lib/atoms/Card.svelte'

  onMount(() => {
    SwaggerUI({
      url: '/api/openapi.yaml',
      dom_id: '#swagger-ui-container',
    })
  })
</script>

<svelte:head>
  <title>OpenAPI Spec</title>
</svelte:head>

<Card class="h-full w-full overflow-auto bg-white dark:bg-white">
  <div id="swagger-ui-container"></div>
</Card>
