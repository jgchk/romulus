<script lang="ts">
  import { userSettings } from '$lib/contexts/user-settings'

  import BaseSettings from './BaseSettings.svelte'
</script>

<BaseSettings
  genreRelevanceFilter={$userSettings.genreRelevanceFilter}
  showRelevanceTags={$userSettings.showRelevanceTags}
  showTypeTags={$userSettings.showTypeTags}
  showNsfw={$userSettings.showNsfw}
  on:change={(e) => userSettings.update((prev) => ({ ...prev, ...e.detail }))}
/>
