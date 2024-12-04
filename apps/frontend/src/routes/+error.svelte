<script lang="ts">
  import { page } from '$app/stores'
</script>

<div class="flex h-full max-h-96 w-full items-center justify-center">
  <div class="flex flex-col items-center">
    <h1 class="text-lg font-bold">{$page.status}</h1>
    <p>{$page.error?.message ?? 'An unknown error occurred'}</p>
  </div>
</div>
