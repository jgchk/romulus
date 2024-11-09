<script lang="ts">
  import { getUserSettingsContext } from '$lib/contexts/user-settings'

  import BaseSettings from './BaseSettings.svelte'

  const userSettings = getUserSettingsContext()
</script>

<BaseSettings
  genreRelevanceFilter={$userSettings.genreRelevanceFilter}
  showRelevanceTags={$userSettings.showRelevanceTags}
  showTypeTags={$userSettings.showTypeTags}
  showNsfw={$userSettings.showNsfw}
  onChange={(updates) => userSettings.update((prev) => ({ ...prev, ...updates }))}
/>
