<script lang="ts">
  import { browser } from '$app/environment'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'

  const userSettings = getUserSettingsContext()

  $: if (browser) {
    if ($userSettings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
</script>

<svelte:head>
  {#if $userSettings.darkMode}
    <script>
      document.documentElement.classList.add('dark')
    </script>
  {:else}
    <script>
      document.documentElement.classList.remove('dark')
    </script>
  {/if}
</svelte:head>
