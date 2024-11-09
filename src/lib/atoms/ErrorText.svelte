<script lang="ts">
  import type { AriaRole } from 'svelte/elements'

  type Props = {
    errors: string[] | undefined
    role?: AriaRole | null
  }

  let { errors, role = 'alert' }: Props = $props()
</script>

{#if errors?.length}
  <div class="text-sm text-error-500" {role}>
    {#if errors.length === 1}
      {errors[0]}
    {:else}
      <ul class="list-disc pl-4">
        {#each errors as error}
          <li>{error}</li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
